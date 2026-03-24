import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { Dashboard } from "./components/Dashboard";
import { Library } from "./components/Library";
import { Archived } from "./components/Archived";
import { VideoPlayer } from "./components/VideoPlayer";
import { Playlists } from "./components/Playlists";
import { PlaylistView } from "./components/PlaylistView";
import { Analytics } from "./components/Analytics";
import { StudySession } from "./components/StudySession";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: "library", Component: Library },
      { path: "archived", Component: Archived },
      { path: "playlists", Component: Playlists },
      { path: "playlists/:playlistId", Component: PlaylistView },
      { path: "analytics", Component: Analytics },
      { path: "study", Component: StudySession },
      { path: "watch/:videoId", Component: VideoPlayer },
    ],
  },
]);