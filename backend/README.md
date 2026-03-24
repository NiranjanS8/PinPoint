# Pinpoint Backend

Spring Boot backend for the Pinpoint desktop app.

## Stack

- Java 21
- Spring Boot
- Spring Web
- Spring Data JPA
- SQLite
- Lombok
- Validation
- Maven

## Run

From the project root:

```powershell
mvn -f backend/pom.xml spring-boot:run
```

The API runs on:

- `http://localhost:9090`

## Database

- SQLite database location: `${user.home}/.pinpoint/pinpoint.db`
- The backend creates the parent directory automatically on startup
- Hibernate schema mode is `update`

## API Endpoints

### POST `/api/content`

Request:

```json
{
  "url": "https://www.youtube.com/watch?v=..."
}
```

Behavior:

- validates YouTube URL
- detects `VIDEO` or `PLAYLIST`
- normalizes URL
- prevents duplicates by `normalizedUrl`
- fetches metadata
- saves and returns the created item

### GET `/api/content`

- returns all saved items
- sorted pinned first, then newest first

### GET `/api/content/{id}`

- returns one saved item
- returns `404` when missing

### PUT `/api/content/{id}/pin`

- toggles pinned state
- returns updated item

### DELETE `/api/content/{id}`

- deletes one saved item
- returns `204 No Content`

## Notes

- URL normalization is used for duplicate detection.
- Video URLs normalize to `https://www.youtube.com/watch?v=...`
- Playlist URLs normalize to `https://www.youtube.com/playlist?list=...`
- Metadata fetching is isolated behind `YoutubeMetadataService`.
- Phase 1 uses a simple, practical strategy:
  - try YouTube oEmbed first for videos
  - fall back to page metadata parsing with Jsoup

## Assumptions

- `watch?v=` and `youtu.be/` links are treated as videos
- `playlist?list=` links are treated as playlists
- watch URLs that include both `v` and `list` are treated as videos
- when channel or thumbnail metadata is incomplete, safe fallback values are used

## Future Improvements

- add tests for URL normalization and service behavior
- add folder support for Phase 2
- improve playlist metadata extraction
- add API filters and search
- add migrations with Flyway or Liquibase
