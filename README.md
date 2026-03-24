# Pinpoint

Pinpoint is a desktop learning workspace built with Electron, React, TypeScript, Tailwind CSS, and a Spring Boot backend.

This rebuild focuses on the desktop frontend and Electron shell. The current UI uses local mock data so it can be run immediately and later reconnected to the backend cleanly.

## Structure

```text
PinPoint/
├─ backend/
├─ design/
├─ electron/
│  ├─ main.js
│  ├─ preload.js
│  └─ package.json
├─ frontend/
│  ├─ index.html
│  ├─ package.json
│  ├─ postcss.config.cjs
│  ├─ tailwind.config.ts
│  ├─ tsconfig.app.json
│  ├─ tsconfig.json
│  ├─ tsconfig.node.json
│  ├─ vite.config.ts
│  └─ src/
│     ├─ app/
│     ├─ components/
│     ├─ data/
│     ├─ layouts/
│     ├─ pages/
│     ├─ styles/
│     ├─ types/
│     ├─ main.tsx
│     └─ vite-env.d.ts
├─ package.json
└─ README.md
```

## Frontend Stack

- Electron
- React
- TypeScript
- Tailwind CSS
- React Router
- Lucide React

## Current UI Screens

- Dashboard
- Library
- Playlists
- Archived
- Analytics
- Study Session

## Install

From the project root:

```powershell
npm.cmd install
npm.cmd run install:all
```

This installs:

- root dev tooling
- Electron dependencies
- frontend dependencies

## Run

To run the whole desktop app:

```powershell
npm.cmd run dev
```

This starts:

- Spring Boot backend
- Vite frontend on `http://127.0.0.1:5173`
- Electron shell after the frontend is ready

## Run Frontend Only

```powershell
npm.cmd --prefix frontend run dev
```

## Run Electron Only

Make sure the frontend dev server is already running, then:

```powershell
npm.cmd --prefix electron run dev
```

## Build

```powershell
npm.cmd run build
```

## Notes

- The frontend currently uses local mock data in `frontend/src/data/mockData.ts`.
- The UI structure is organized so mock data can later be replaced with service calls to the Spring Boot backend.
- The Electron shell is intentionally simple: one main window, preload bridge, dev/prod URL handling.
