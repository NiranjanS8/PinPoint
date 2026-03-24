import { Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ContentProvider } from "../context/ContentContext";
import { ToastProvider } from "../context/ToastContext";
import { WorkspaceUiProvider } from "../context/WorkspaceUiContext";
import { AppLayout } from "../layouts/AppLayout";
import { MiniPlayerPage } from "../pages/MiniPlayerPage";

export function App() {
  const navigate = useNavigate();
  const [windowContext, setWindowContext] = useState<DesktopWindowContext | null>(null);

  useEffect(() => {
    const applyTheme = () => {
      const isDarkMode = window.localStorage.getItem("pinpoint-theme") === "dark";
      document.documentElement.dataset.theme = isDarkMode ? "dark" : "light";
    };

    applyTheme();

    const handleStorage = (event: StorageEvent) => {
      if (event.key === "pinpoint-theme") {
        applyTheme();
      }
    };

    const handleFocus = () => {
      applyTheme();
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function loadWindowContext() {
      if (!window.pinpointDesktop?.getWindowContext) {
        if (active) {
          setWindowContext({ windowType: "main", contentId: null, alwaysOnTop: false });
        }
        return;
      }

      try {
        const context = await window.pinpointDesktop.getWindowContext();
        if (active) {
          setWindowContext(context);
        }
      } catch {
        if (active) {
          setWindowContext({ windowType: "main", contentId: null, alwaysOnTop: false });
        }
      }
    }

    void loadWindowContext();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!window.pinpointDesktop?.onNavigateToContent) {
      return;
    }

    return window.pinpointDesktop.onNavigateToContent(({ contentId }) => {
      navigate(`/content/${contentId}`);
    });
  }, [navigate]);

  if (!windowContext) {
    return null;
  }

  return (
    <ToastProvider>
      <WorkspaceUiProvider>
        <ContentProvider>
          {windowContext.windowType === "mini-player" ? (
            <MiniPlayerPage
              initialContentId={windowContext.contentId}
              initialAlwaysOnTop={windowContext.alwaysOnTop}
            />
          ) : (
            <AppLayout>
              <Outlet />
            </AppLayout>
          )}
        </ContentProvider>
      </WorkspaceUiProvider>
    </ToastProvider>
  );
}
