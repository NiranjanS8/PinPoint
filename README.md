# Pinpoint

Pinpoint is a desktop learning organizer for collecting YouTube videos and playlists, then grouping them into nested topic folders. The app uses Electron for the desktop shell, React for the UI, Spring Boot for the local API, and SQLite for persistence.

## Project Structure

```text
PinPoint/
|- electron/    # Desktop shell and preload bridge
|- frontend/    # React organizer UI
|- backend/     # Spring Boot API + SQLite persistence
|- package.json # Root scripts
`- README.md
```

## Phase 2 Includes

- Electron desktop shell with a single main window
- React organizer UI with:
  - left sidebar navigation
  - Home, Pinned, and Recent views
  - nested topic folders
  - create, rename, and delete folder dialogs
  - folder tree expand/collapse
  - content-to-folder assignment
  - search by title or channel
  - sort by pinned, newest, oldest, or alphabetical
  - embedded player/detail view
  - delete confirmation and toast feedback
- Spring Boot backend with:
  - layered architecture
  - folder and content APIs
  - SQLite persistence
  - duplicate prevention by normalized URL
  - folder-aware content filtering
  - global exception handling

## Architecture Notes

- `backend/controller` stays HTTP-focused.
- `backend/service` owns folder rules, metadata extraction, filtering, and assignment logic.
- `backend/repository` remains thin and persistence-oriented.
- `frontend/services` centralizes API calls for content and folders.
- `frontend/components` now contains reusable organizer primitives such as sidebar, folder tree, action menu, dialogs, and assignment dropdowns.
- `frontend/pages/HomePage.tsx` coordinates the Phase 2 organizer state without introducing a heavier state library.

## What Changed From Phase 1

- The flat saved-items dashboard is now a structured organizer.
- A nested folder model was added to the backend and database.
- Saved content can now be assigned to one folder or remain unassigned.
- The UI now uses a desktop organizer layout with a sidebar and folder tree.
- Search and sort are handled through backend query parameters instead of only local client filtering.

## Folder Deletion Strategy

Phase 2 uses a simple documented rule:

- deleting a folder also deletes its subfolders
- content inside that deleted folder tree is not deleted
- affected content becomes unassigned

This keeps the hierarchy simple while preserving saved learning material.

## Dependencies

### Root

- `concurrently`

### Electron

- `electron`
- `wait-on`

### Frontend

- `react`
- `react-dom`
- `parcel`
- `typescript`

### Backend

- `spring-boot-starter-web`
- `spring-boot-starter-data-jpa`
- `spring-boot-starter-validation`
- `sqlite-jdbc`
- `hibernate-community-dialects`

## Prerequisites

- Node.js 20+
- npm 10+
- Java 21+
- Maven 3.9+

## Setup

Install root, frontend, and Electron dependencies:

```bash
npm install
npm run install:all
```

The backend Maven dependencies are downloaded automatically when you run Spring Boot.

## Local Development

From the project root:

```bash
npm run dev
```

That starts:

1. Spring Boot on `http://localhost:9090`
2. The frontend dev server on `http://localhost:5173`
3. Electron after both services are available

## Build

From the project root:

```bash
npm run build
```

This builds:

- the frontend into `frontend/dist`
- the Spring Boot jar into `backend/target`
- the Electron shell readiness step for later packaging

Packaging installers is still intentionally postponed.

## API Endpoints

### Content

- `POST /api/content`
- `GET /api/content`
- `GET /api/content/{id}`
- `PUT /api/content/{id}/pin`
- `PUT /api/content/{id}/folder`
- `DELETE /api/content/{id}`

Supported query params for `GET /api/content`:

- `folderId`
- `search`
- `sort`
- `pinned`
- `contentType`

### Folders

- `POST /api/folders`
- `GET /api/folders`
- `GET /api/folders/tree`
- `PUT /api/folders/{id}`
- `DELETE /api/folders/{id}`

## Database Notes

- SQLite data is stored in `pinpoint.db` in the backend working directory.
- `saved_content` now supports nullable `folder_id`.
- `folders` stores the nested hierarchy with nullable `parent_id`.
- Hibernate `ddl-auto=update` handles the Phase 2 schema evolution automatically for local development.

## Metadata Strategy

The metadata flow is still intentionally lightweight:

- validate and normalize supported YouTube URLs
- detect `VIDEO` or `PLAYLIST`
- fetch lightweight metadata from YouTube pages
- use video `oEmbed` when available
- keep extraction isolated behind `MetadataService`

## Postponed For Phase 3+

- mini-player overlay
- focus mode
- notes
- progress tracking
- folder reparenting / drag-and-drop
- packaged installers
- richer playlist metadata extraction
- cloud sync or auth
