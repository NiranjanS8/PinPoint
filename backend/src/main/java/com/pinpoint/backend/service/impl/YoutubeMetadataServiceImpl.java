package com.pinpoint.backend.service.impl;

import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pinpoint.backend.entity.ContentType;
import com.pinpoint.backend.exception.MetadataFetchException;
import com.pinpoint.backend.service.YoutubeMetadataService;
import com.pinpoint.backend.util.YoutubeMetadata;

@Service
public class YoutubeMetadataServiceImpl implements YoutubeMetadataService {

    private static final Pattern AUTHOR_PATTERN = Pattern.compile("\"author\":\"([^\"]+)\"");
    private static final Pattern THUMBNAIL_PATTERN = Pattern.compile("\"thumbnailUrl\":\\[\\{\"url\":\"([^\"]+)\"");

    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    public YoutubeMetadataServiceImpl(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .followRedirects(HttpClient.Redirect.NORMAL)
                .build();
    }

    @Override
    public YoutubeMetadata fetchMetadata(String normalizedUrl, ContentType contentType) {
        if (contentType == ContentType.VIDEO) {
            try {
                return fetchFromOEmbed(normalizedUrl);
            } catch (Exception ignored) {
                // Fall back to page metadata parsing when oEmbed is unavailable.
            }
        }

        return fetchFromPage(normalizedUrl);
    }

    private YoutubeMetadata fetchFromOEmbed(String normalizedUrl) throws IOException, InterruptedException {
        String endpoint = "https://www.youtube.com/oembed?format=json&url="
                + URLEncoder.encode(normalizedUrl, StandardCharsets.UTF_8);

        HttpRequest request = HttpRequest.newBuilder(URI.create(endpoint))
                .timeout(Duration.ofSeconds(10))
                .header("Accept", "application/json")
                .header("User-Agent", "Pinpoint/1.0")
                .GET()
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() >= 400) {
            throw new MetadataFetchException("Could not fetch YouTube metadata");
        }

        JsonNode body = objectMapper.readTree(response.body());
        return YoutubeMetadata.builder()
                .title(textValue(body, "title", "Untitled YouTube content"))
                .channelName(textValue(body, "author_name", "YouTube"))
                .thumbnailUrl(textValue(body, "thumbnail_url", "https://i.ytimg.com/vi/default/hqdefault.jpg"))
                .build();
    }

    private YoutubeMetadata fetchFromPage(String normalizedUrl) {
        try {
            HttpRequest request = HttpRequest.newBuilder(URI.create(normalizedUrl))
                    .timeout(Duration.ofSeconds(12))
                    .header("Accept-Language", "en-US,en;q=0.9")
                    .header("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36")
                    .GET()
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 400) {
                throw new MetadataFetchException("Could not fetch YouTube metadata");
            }

            String body = response.body();
            Document document = Jsoup.parse(body, normalizedUrl);

            String title = firstNonBlank(
                    document.select("meta[property=og:title]").attr("content"),
                    document.title(),
                    "Untitled YouTube content"
            );

            String channelName = firstNonBlank(
                    document.select("link[itemprop=name]").attr("content"),
                    extractWithPattern(body, AUTHOR_PATTERN),
                    "YouTube"
            );

            String thumbnailUrl = firstNonBlank(
                    document.select("meta[property=og:image]").attr("content"),
                    extractWithPattern(body, THUMBNAIL_PATTERN),
                    "https://i.ytimg.com/vi/default/hqdefault.jpg"
            );

            return YoutubeMetadata.builder()
                    .title(title)
                    .channelName(channelName)
                    .thumbnailUrl(thumbnailUrl)
                    .build();
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new MetadataFetchException("Failed to fetch YouTube metadata", exception);
        } catch (IOException exception) {
            throw new MetadataFetchException("Failed to fetch YouTube metadata", exception);
        }
    }

    private String textValue(JsonNode node, String fieldName, String fallback) {
        JsonNode field = node.get(fieldName);
        return field != null && !field.asText().isBlank() ? field.asText() : fallback;
    }

    private String extractWithPattern(String body, Pattern pattern) {
        Matcher matcher = pattern.matcher(body);
        return matcher.find() ? matcher.group(1).replace("\\u0026", "&") : "";
    }

    private String firstNonBlank(String... values) {
        for (String value : values) {
            if (value != null && !value.isBlank()) {
                return value;
            }
        }
        return "";
    }
}
