/// <reference types="vite/client" />

interface DesktopWindowContext {
  windowType: "main" | "mini-player";
  contentId: number | null;
  alwaysOnTop: boolean;
}

interface Window {
  pinpointDesktop?: {
    platform: string;
    getWindowContext: () => Promise<DesktopWindowContext>;
    openMiniPlayer: (contentId: number) => Promise<void>;
    openFullView: (contentId: number) => Promise<void>;
    closeMiniPlayer: () => Promise<void>;
    toggleMiniPlayerAlwaysOnTop: () => Promise<boolean>;
    onMiniPlayerContext: (callback: (payload: DesktopWindowContext) => void) => () => void;
    onNavigateToContent: (callback: (payload: { contentId: number }) => void) => () => void;
  };
}
