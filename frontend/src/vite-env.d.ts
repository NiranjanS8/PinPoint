interface Window {
  pinpointDesktop?: {
    openExternal: (url: string) => Promise<void>;
  };
}
