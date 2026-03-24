# Pinpoint

Pinpoint is a Phase 1 desktop MVP for collecting YouTube videos and playlists in one focused workspace. It uses Electron for the desktop shell, React for the UI, Spring Boot for the local API, and SQLite for persistence.

## Project Structure

```text
PinPoint/
├─ electron/    # Desktop shell and preload bridge
├─ frontend/    # React app
├─ backend/     # Spring Boot API + SQLite persistence
├─ package.json # Root dev/build scripts
└─ README.md
```

## Phase 1 Includes

- Electron desktop shell with a single main window
- React home dashboard with:
  - add by YouTube URL
  - validation and inline errors
  - filter chips
  - saved content cards
  - embedded player/detail view
  - delete confirmation
  - toast feedback
- Spring Boot backend with:
  - layered architecture
  - SQLite storage
  - duplicate prevention by normalized URL
  - pinned-first sorting
  - metadata extraction service isolated behind an interface
  - global exception handling
- Support for YouTube video links and playlist links

## Architecture Notes

- `backend/controller` handles HTTP only.
- `backend/service` owns business logic and metadata extraction.
- `backend/repository` contains persistence access.
- `frontend/services` keeps API calls out of components.
- `frontend/components` contains reusable UI pieces.
- `frontend/pages/HomePage.tsx` orchestrates Phase 1 state without introducing unnecessary global state.
- `electron/preload.js` exposes only the small desktop capability needed in Phase 1: opening links in the system browser.

This keeps Phase 1 small while leaving clean extension points for:

- topic folders and nested organization
- mini-player overlays
- focus mode flows
- richer metadata providers

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

Install frontend and Electron dependencies:

```bash
npm install
npm run install:all
```

The backend uses Maven dependencies, which are fetched automatically when you run the Spring Boot app.

## Local Development

Start the backend, frontend, and Electron together from the project root:

```bash
npm run dev
```

That script does the following:

1. Runs Spring Boot on `http://localhost:9090`
2. Runs the frontend dev server on `http://localhost:5173`
3. Launches Electron after both services are available

## Build

From the project root:

```bash
npm run build
```

This builds:

- the React frontend into `frontend/dist`
- the Spring Boot jar into `backend/target`
- the Electron shell readiness step for later packaging

For Phase 1, packaging installers is intentionally left out to keep the project focused on the working MVP.

## API Endpoints

- `POST /api/content`
- `GET /api/content`
- `GET /api/content/{id}`
- `PUT /api/content/{id}/pin`
- `DELETE /api/content/{id}`

## Metadata Strategy In Phase 1

The metadata flow is intentionally simple:

- validate and normalize supported YouTube URLs
- detect `VIDEO` or `PLAYLIST`
- fetch lightweight metadata from YouTube pages
- use video `oEmbed` when available
- keep the extraction logic isolated in `MetadataService`

This works well enough for the MVP while making it easy to improve with a stronger parser or official API in a later phase.

## Phase 2+ Placeholders

Not implemented yet:

- nested topic folders
- mini-player overlay
- focus mode
- packaged installers
- stronger playlist metadata extraction
- authentication or cloud sync

## Notes

- SQLite data is stored in `pinpoint.db` in the backend process working directory
- Duplicate protection is based on normalized URL
- The desktop player uses an embedded YouTube iframe and also offers an `Open in Browser` fallback
