import { createBrowserRouter } from "react-router-dom";
import { App } from "./App";
import { LibraryPage } from "../pages/LibraryPage";
import { ArchivedPage } from "../pages/ArchivedPage";
import { AnalyticsPage } from "../pages/AnalyticsPage";
import { StudySessionPage } from "../pages/StudySessionPage";
import { ContentDetailPage } from "../pages/ContentDetailPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <LibraryPage /> },
      { path: "library", element: <LibraryPage /> },
      { path: "archived", element: <ArchivedPage /> },
      { path: "analytics", element: <AnalyticsPage /> },
      { path: "study-session", element: <StudySessionPage /> },
      { path: "content/:id", element: <ContentDetailPage /> }
    ]
  }
]);
