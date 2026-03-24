import type { ContentType, SavedContent } from "../types/content";

function extractQueryParam(url: URL, key: string) {
  return url.searchParams.get(key)?.trim() || "";
}

export function isValidYouTubeUrl(value: string) {
  try {
    const url = new URL(value.trim());
    const host = url.hostname.toLowerCase();
    return host.includes("youtube.com") || host.includes("youtu.be");
  } catch {
    return false;
  }
}

export function detectContentType(urlValue: string): ContentType | null {
  try {
    const url = new URL(urlValue);
    const host = url.hostname.toLowerCase();
    const path = url.pathname;

    if (host.includes("youtu.be")) {
      return "VIDEO";
    }

    if (path === "/playlist" && extractQueryParam(url, "list")) {
      return "PLAYLIST";
    }

    if ((path === "/watch" || path === "/") && extractQueryParam(url, "v")) {
      return "VIDEO";
    }

    if ((path === "/watch" || path === "/") && extractQueryParam(url, "list")) {
      return "PLAYLIST";
    }

    if (path.startsWith("/shorts/") || path.startsWith("/embed/")) {
      return "VIDEO";
    }

    return null;
  } catch {
    return null;
  }
}

export function buildEmbedUrl(content: SavedContent) {
  try {
    const url = new URL(content.url);
    const host = url.hostname.toLowerCase();

    if (content.contentType === "PLAYLIST") {
      const listId = url.searchParams.get("list");
      return listId
        ? `https://www.youtube-nocookie.com/embed/videoseries?list=${listId}`
        : content.url;
    }

    if (host.includes("youtu.be")) {
      const id = url.pathname.replace("/", "");
      return `https://www.youtube-nocookie.com/embed/${id}`;
    }

    if (url.pathname.startsWith("/shorts/")) {
      return `https://www.youtube-nocookie.com/embed/${url.pathname.split("/")[2]}`;
    }

    const videoId = url.searchParams.get("v");
    return videoId ? `https://www.youtube-nocookie.com/embed/${videoId}` : content.url;
  } catch {
    return content.url;
  }
}
