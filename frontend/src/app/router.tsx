import { createBrowserRouter } from "react-router-dom";
import { App } from "./App";
import { LibraryPage } from "../pages/LibraryPage";
import { AnalyticsPage } from "../pages/AnalyticsPage";
import { FoldersPage } from "../pages/FoldersPage";
import { FolderDetailPage } from "../pages/FolderDetailPage";
import { StudySessionPage } from "../pages/StudySessionPage";
import { ContentDetailPage } from "../pages/ContentDetailPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <LibraryPage /> },
      { path: "library", element: <LibraryPage /> },
      { path: "folders", element: <FoldersPage /> },
      { path: "folders/:id", element: <FolderDetailPage /> },
      { path: "analytics", element: <AnalyticsPage /> },
      { path: "study-session", element: <StudySessionPage /> },
      { path: "content/:id", element: <ContentDetailPage /> }
    ]
  }
]);
