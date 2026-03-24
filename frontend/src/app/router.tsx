import { createBrowserRouter } from "react-router-dom";
import { App } from "./App";
import { DashboardPage } from "../pages/DashboardPage";
import { LibraryPage } from "../pages/LibraryPage";
import { PlaylistsPage } from "../pages/PlaylistsPage";
import { ArchivedPage } from "../pages/ArchivedPage";
import { AnalyticsPage } from "../pages/AnalyticsPage";
import { StudySessionPage } from "../pages/StudySessionPage";
import { ContentDetailPage } from "../pages/ContentDetailPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "library", element: <LibraryPage /> },
      { path: "playlists", element: <PlaylistsPage /> },
      { path: "archived", element: <ArchivedPage /> },
      { path: "analytics", element: <AnalyticsPage /> },
      { path: "study-session", element: <StudySessionPage /> },
      { path: "content/:id", element: <ContentDetailPage /> }
    ]
  }
]);
