package com.pinpoint.backend.util;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

import org.springframework.stereotype.Component;

import com.pinpoint.backend.entity.ContentType;
import com.pinpoint.backend.exception.InvalidYoutubeUrlException;

@Component
public class YoutubeUrlUtils {

    private static final Set<String> VALID_HOSTS = new HashSet<>(Arrays.asList(
            "youtube.com",
            "www.youtube.com",
            "m.youtube.com",
            "youtu.be"
    ));

    public boolean isYoutubeUrl(String rawUrl) {
        try {
            URI uri = normalizeUri(rawUrl);
            return VALID_HOSTS.contains(Optional.ofNullable(uri.getHost()).orElse("").toLowerCase());
        } catch (InvalidYoutubeUrlException exception) {
            return false;
        }
    }

    public ContentType detectContentType(String rawUrl) {
        URI uri = normalizeUri(rawUrl);
        String host = Optional.ofNullable(uri.getHost()).orElse("").toLowerCase();

        if ("youtu.be".equals(host)) {
            return ContentType.VIDEO;
        }

        String videoId = getQueryParameter(uri, "v");
        if (videoId != null && !videoId.isBlank()) {
            return ContentType.VIDEO;
        }

        String playlistId = getQueryParameter(uri, "list");
        if (playlistId != null && !playlistId.isBlank()) {
            return ContentType.PLAYLIST;
        }

        if (uri.getPath() != null && uri.getPath().contains("/playlist")) {
            return ContentType.PLAYLIST;
        }

        throw new InvalidYoutubeUrlException("Unsupported YouTube URL");
    }

    public String normalizeUrl(String rawUrl) {
        ContentType contentType = detectContentType(rawUrl);
        URI uri = normalizeUri(rawUrl);
        String host = Optional.ofNullable(uri.getHost()).orElse("").toLowerCase();

        if (contentType == ContentType.VIDEO) {
            String videoId = "youtu.be".equals(host)
                    ? trimSlashes(uri.getPath())
                    : getQueryParameter(uri, "v");

            if (videoId == null || videoId.isBlank()) {
                throw new InvalidYoutubeUrlException("Missing YouTube video id");
            }

            return "https://www.youtube.com/watch?v=" + videoId;
        }

        String playlistId = getQueryParameter(uri, "list");
        if (playlistId == null || playlistId.isBlank()) {
            throw new InvalidYoutubeUrlException("Missing YouTube playlist id");
        }

        return "https://www.youtube.com/playlist?list=" + playlistId;
    }

    private URI normalizeUri(String rawUrl) {
        if (rawUrl == null || rawUrl.isBlank()) {
            throw new InvalidYoutubeUrlException("YouTube URL is required");
        }

        try {
            URI directUri = new URI(rawUrl.trim());
            if (directUri.getScheme() != null) {
                return directUri;
            }

            return new URI("https://" + rawUrl.trim());
        } catch (URISyntaxException exception) {
            throw new InvalidYoutubeUrlException("Invalid YouTube URL");
        }
    }

    private String getQueryParameter(URI uri, String parameterName) {
        if (uri.getQuery() == null || uri.getQuery().isBlank()) {
            return null;
        }

        return Arrays.stream(uri.getQuery().split("&"))
                .map(pair -> pair.split("=", 2))
                .filter(parts -> parts.length == 2 && parameterName.equals(parts[0]))
                .map(parts -> parts[1])
                .findFirst()
                .orElse(null);
    }

    private String trimSlashes(String value) {
        if (value == null) {
            return null;
        }

        return value.replaceFirst("^/+", "").replaceFirst("/+$", "");
    }
}
