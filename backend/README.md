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
- supports optional query params:
  - `folderId`
  - `search`
  - `sort` = `pinned`, `newest`, `oldest`, `alphabetical`
  - `pinned`
  - `contentType`

### GET `/api/content/{id}`

- returns one saved item
- returns `404` when missing

### PUT `/api/content/{id}/pin`

- toggles pinned state
- returns updated item

### PUT `/api/content/{id}/folder`

Request:

```json
{
  "folderId": 12
}
```

Behavior:

- assigns content to a folder
- send `null` to unassign content from folders

### DELETE `/api/content/{id}`

- deletes one saved item
- returns `204 No Content`

### POST `/api/folders`

Request:

```json
{
  "name": "Spring Boot",
  "parentId": 3
}
```

Behavior:

- creates a root folder when `parentId` is omitted
- creates a nested folder when `parentId` is present

### GET `/api/folders`

- returns the flat folder list

### GET `/api/folders/tree`

- returns nested folders for sidebar tree rendering

### PUT `/api/folders/{id}`

Request:

```json
{
  "name": "Advanced Spring Boot",
  "parentId": 3
}
```

Behavior:

- renames a folder
- optionally changes parent when valid
- rejects self-parenting and circular nesting

### DELETE `/api/folders/{id}`

- recursively deletes the selected folder and all descendants
- content inside deleted folders is preserved and becomes unassigned

## Notes

- URL normalization is used for duplicate detection.
- Video URLs normalize to `https://www.youtube.com/watch?v=...`
- Playlist URLs normalize to `https://www.youtube.com/playlist?list=...`
- Metadata fetching is isolated behind `YoutubeMetadataService`.
- Phase 1 uses a simple, practical strategy:
  - try YouTube oEmbed first for videos
  - fall back to page metadata parsing with Jsoup
- Folders are stored as a nested hierarchy using nullable parent references.
- Folder deletion is intentionally simple for this phase:
  - remove the folder subtree
  - keep saved content
  - clear any folder assignments that pointed to the deleted folders

## Assumptions

- `watch?v=` and `youtu.be/` links are treated as videos
- `playlist?list=` links are treated as playlists
- watch URLs that include both `v` and `list` are treated as videos
- when channel or thumbnail metadata is incomplete, safe fallback values are used

## Future Improvements

- add tests for URL normalization and service behavior
- improve playlist metadata extraction
- add migrations with Flyway or Liquibase
- add tests for folder tree validation and recursive delete behavior
