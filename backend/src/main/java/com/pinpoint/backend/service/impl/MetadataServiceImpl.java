package com.pinpoint.backend.service.impl;

import com.pinpoint.backend.dto.response.YoutubeMetadata;
import com.pinpoint.backend.entity.ContentType;
import com.pinpoint.backend.exception.InvalidYoutubeUrlException;
import com.pinpoint.backend.exception.MetadataFetchException;
import com.pinpoint.backend.service.MetadataService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URLDecoder;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class MetadataServiceImpl implements MetadataService {

    private static final Pattern META_TAG_PATTERN = Pattern.compile(
            "<meta\\s+(?:property|name)=\"([^\"]+)\"\\s+content=\"([^\"]*)\"",
            Pattern.CASE_INSENSITIVE
    );
    private static final Pattern TITLE_TAG_PATTERN = Pattern.compile("<title>(.*?)</title>", Pattern.CASE_INSENSITIVE | Pattern.DOTALL);
    private static final Pattern OEMBED_TITLE_PATTERN = Pattern.compile("\"title\"\\s*:\\s*\"([^\"]+)\"");
    private static final Pattern OEMBED_AUTHOR_PATTERN = Pattern.compile("\"author_name\"\\s*:\\s*\"([^\"]+)\"");
    private static final Pattern OEMBED_THUMBNAIL_PATTERN = Pattern.compile("\"thumbnail_url\"\\s*:\\s*\"([^\"]+)\"");

    private final HttpClient httpClient;

    public MetadataServiceImpl(@Value("${pinpoint.metadata.request-timeout-ms}") long requestTimeoutMs) {
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofMillis(requestTimeoutMs))
                .build();
    }

    @Override
    public YoutubeMetadata extract(String rawUrl) {
        ParsedYoutubeUrl parsedYoutubeUrl = parseUrl(rawUrl);
        String html = fetchHtml(parsedYoutubeUrl.watchUrl());

        String title = extractMeta(html, "og:title")
                .or(() -> extractTitleTag(html))
                .orElse(parsedYoutubeUrl.defaultTitle());
        String channelName = extractMeta(html, "author")
                .or(() -> extractMeta(html, "og:site_name"))
                .orElse("YouTube");
        String thumbnailUrl = extractMeta(html, "og:image")
                .orElse(parsedYoutubeUrl.fallbackThumbnailUrl());

        if (parsedYoutubeUrl.contentType() == ContentType.VIDEO) {
            OEmbedMetadata oEmbedMetadata = fetchOEmbed(parsedYoutubeUrl.watchUrl());
            title = coalesce(oEmbedMetadata.title(), title);
            channelName = coalesce(oEmbedMetadata.authorName(), channelName);
            thumbnailUrl = coalesce(oEmbedMetadata.thumbnailUrl(), thumbnailUrl);
        }

        if (isBlank(title) || isBlank(thumbnailUrl)) {
            throw new MetadataFetchException("Could not fetch metadata for the provided YouTube link.");
        }

        return new YoutubeMetadata(
                parsedYoutubeUrl.normalizedUrl(),
                parsedYoutubeUrl.contentType(),
                cleanText(title),
                cleanText(channelName),
                cleanText(thumbnailUrl)
        );
    }

    private ParsedYoutubeUrl parseUrl(String rawUrl) {
        if (isBlank(rawUrl)) {
            throw new InvalidYoutubeUrlException("YouTube URL is required.");
        }

        URI uri;
        try {
            uri = new URI(rawUrl.trim());
        } catch (URISyntaxException exception) {
            throw new InvalidYoutubeUrlException("Please enter a valid YouTube URL.");
        }

        String host = Optional.ofNullable(uri.getHost()).orElse("").toLowerCase();
        boolean youtubeHost = host.contains("youtube.com") || host.contains("youtu.be");
        if (!youtubeHost) {
            throw new InvalidYoutubeUrlException("Only YouTube video or playlist links are supported.");
        }

        Map<String, String> queryParams = parseQueryParams(uri.getRawQuery());
        String videoId = null;
        String playlistId = null;

        if (host.contains("youtu.be")) {
            String path = Optional.ofNullable(uri.getPath()).orElse("").replace("/", "").trim();
            if (!path.isEmpty()) {
                videoId = path;
            }
            playlistId = queryParams.get("list");
        } else {
            String path = Optional.ofNullable(uri.getPath()).orElse("");
            if ("/watch".equals(path) || "/".equals(path) || path.isEmpty()) {
                videoId = queryParams.get("v");
                playlistId = queryParams.get("list");
            } else if ("/playlist".equals(path)) {
                playlistId = queryParams.get("list");
            } else if (path.startsWith("/shorts/")) {
                videoId = path.substring("/shorts/".length());
            } else if (path.startsWith("/embed/")) {
                videoId = path.substring("/embed/".length());
            }
        }

        if (!isBlank(videoId)) {
            String normalized = "https://www.youtube.com/watch?v=" + videoId;
            return new ParsedYoutubeUrl(
                    normalized,
                    normalized,
                    ContentType.VIDEO,
                    "YouTube Video",
                    "https://img.youtube.com/vi/" + videoId + "/hqdefault.jpg"
            );
        }

        if (!isBlank(playlistId)) {
            String normalized = "https://www.youtube.com/playlist?list=" + playlistId;
            return new ParsedYoutubeUrl(
                    normalized,
                    normalized,
                    ContentType.PLAYLIST,
                    "YouTube Playlist",
                    "https://i.ytimg.com/vi/" + queryParams.getOrDefault("v", "dQw4w9WgXcQ") + "/hqdefault.jpg"
            );
        }

        throw new InvalidYoutubeUrlException("Unsupported YouTube URL. Please use a video or playlist link.");
    }

    private String fetchHtml(String url) {
        HttpRequest request = HttpRequest.newBuilder(URI.create(url))
                .GET()
                .timeout(Duration.ofSeconds(7))
                .header("User-Agent", "Mozilla/5.0 Pinpoint/1.0")
                .build();

        try {
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 400) {
                throw new MetadataFetchException("YouTube rejected the metadata request.");
            }
            return response.body();
        } catch (IOException | InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new MetadataFetchException("Failed to fetch YouTube metadata.", exception);
        }
    }

    private OEmbedMetadata fetchOEmbed(String url) {
        String endpoint = UriComponentsBuilder
                .fromHttpUrl("https://www.youtube.com/oembed")
                .queryParam("url", url)
                .queryParam("format", "json")
                .build()
                .toUriString();

        HttpRequest request = HttpRequest.newBuilder(URI.create(endpoint))
                .GET()
                .timeout(Duration.ofSeconds(7))
                .header("User-Agent", "Mozilla/5.0 Pinpoint/1.0")
                .build();

        try {
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 400) {
                return new OEmbedMetadata(null, null, null);
            }
            String body = response.body();
            return new OEmbedMetadata(
                    extractRegex(body, OEMBED_TITLE_PATTERN),
                    extractRegex(body, OEMBED_AUTHOR_PATTERN),
                    extractRegex(body, OEMBED_THUMBNAIL_PATTERN)
            );
        } catch (IOException | InterruptedException exception) {
            Thread.currentThread().interrupt();
            return new OEmbedMetadata(null, null, null);
        }
    }

    private Map<String, String> parseQueryParams(String query) {
        Map<String, String> queryParams = new LinkedHashMap<>();
        if (query == null || query.isBlank()) {
            return queryParams;
        }

        String[] pairs = query.split("&");
        for (String pair : pairs) {
            String[] split = pair.split("=", 2);
            if (split.length == 2) {
                queryParams.put(
                        URLDecoder.decode(split[0], StandardCharsets.UTF_8),
                        URLDecoder.decode(split[1], StandardCharsets.UTF_8)
                );
            }
        }
        return queryParams;
    }

    private Optional<String> extractMeta(String html, String key) {
        Matcher matcher = META_TAG_PATTERN.matcher(html);
        while (matcher.find()) {
            if (key.equalsIgnoreCase(matcher.group(1))) {
                return Optional.ofNullable(matcher.group(2));
            }
        }
        return Optional.empty();
    }

    private Optional<String> extractTitleTag(String html) {
        Matcher matcher = TITLE_TAG_PATTERN.matcher(html);
        if (matcher.find()) {
            return Optional.ofNullable(matcher.group(1));
        }
        return Optional.empty();
    }

    private String extractRegex(String source, Pattern pattern) {
        Matcher matcher = pattern.matcher(source);
        if (matcher.find()) {
            return matcher.group(1).replace("\\u0026", "&").replace("\\/", "/");
        }
        return null;
    }

    private String cleanText(String value) {
        return value
                .replace("&amp;", "&")
                .replace(" - YouTube", "")
                .trim();
    }

    private String coalesce(String primary, String fallback) {
        return isBlank(primary) ? fallback : primary;
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private record ParsedYoutubeUrl(
            String normalizedUrl,
            String watchUrl,
            ContentType contentType,
            String defaultTitle,
            String fallbackThumbnailUrl
    ) {
    }

    private record OEmbedMetadata(String title, String authorName, String thumbnailUrl) {
    }
}
