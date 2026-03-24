import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    YT?: typeof YT;
    onYouTubeIframeAPIReady?: () => void;
  }

  namespace YT {
    interface PlayerOptions {
      width?: string | number;
      height?: string | number;
      videoId?: string;
      playerVars?: Record<string, string | number>;
      events?: {
        onReady?: (event: PlayerEvent) => void;
        onStateChange?: (event: OnStateChangeEvent) => void;
        onError?: () => void;
      };
    }

    interface PlayerEvent {
      target: Player;
      data: number;
    }

    interface OnStateChangeEvent extends PlayerEvent {}

    interface Player {
      destroy: () => void;
      getCurrentTime: () => number;
      getDuration: () => number;
      playVideo: () => void;
      pauseVideo: () => void;
      seekTo: (seconds: number, allowSeekAhead?: boolean) => void;
    }

    interface PlayerConstructor {
      new (element: HTMLElement, options: PlayerOptions): Player;
    }

    const Player: PlayerConstructor;
    const PlayerState: {
      ENDED: 0;
      PLAYING: 1;
      PAUSED: 2;
    };
  }
}

type PlayerSource =
  | { type: "video"; videoId: string }
  | { type: "playlist"; listId: string };

let youtubeApiPromise: Promise<typeof YT> | null = null;

function loadYoutubeApi(): Promise<typeof YT> {
  if (window.YT?.Player) {
    return Promise.resolve(window.YT);
  }

  if (youtubeApiPromise) {
    return youtubeApiPromise;
  }

  youtubeApiPromise = new Promise((resolve) => {
    window.onYouTubeIframeAPIReady = () => {
      if (window.YT) {
        resolve(window.YT);
      }
    };

    const existingScript = document.querySelector<HTMLScriptElement>('script[src="https://www.youtube.com/iframe_api"]');
    if (!existingScript) {
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(script);
    } else if (window.YT?.Player) {
      resolve(window.YT);
    }
  });

  return youtubeApiPromise;
}

export function YouTubePlayer({
  source,
  autoplay,
  startSeconds = 0,
  onProgress,
  onEnded
}: {
  source: PlayerSource;
  autoplay: boolean;
  startSeconds?: number;
  onProgress?: (seconds: number, duration: number) => void;
  onEnded?: () => void;
}) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<YT.Player | null>(null);
  const progressTimerRef = useRef<number | null>(null);
  const onProgressRef = useRef(onProgress);
  const onEndedRef = useRef(onEnded);
  const [playerError, setPlayerError] = useState(false);

  useEffect(() => {
    onProgressRef.current = onProgress;
  }, [onProgress]);

  useEffect(() => {
    onEndedRef.current = onEnded;
  }, [onEnded]);

  useEffect(() => {
    const seekToTimestamp = (seconds: number) => {
      if (!playerRef.current) {
        return;
      }

      playerRef.current.seekTo(seconds, true);
      playerRef.current.playVideo();
    };

    const customEventListener = (event: Event) => {
      const detail = (event as CustomEvent<{ seconds: number }>).detail;
      if (typeof detail?.seconds === "number") {
        seekToTimestamp(detail.seconds);
      }
    };

    const removeDesktopListener = window.pinpointDesktop?.onSeekPlayer?.((payload) => {
      if (typeof payload.seconds === "number") {
        seekToTimestamp(payload.seconds);
      }
    });

    window.addEventListener("pinpoint:player-seek", customEventListener as EventListener);

    return () => {
      removeDesktopListener?.();
      window.removeEventListener("pinpoint:player-seek", customEventListener as EventListener);
    };
  }, []);

  const sourceType = source.type;
  const sourceVideoId = source.type === "video" ? source.videoId : null;
  const sourceListId = source.type === "playlist" ? source.listId : null;
  const initialStartSecondsRef = useRef(startSeconds);

  useEffect(() => {
    let cancelled = false;

    async function mountPlayer() {
      if (!hostRef.current) {
        return;
      }

      const YTApi = await loadYoutubeApi();
      if (cancelled || !hostRef.current) {
        return;
      }

      const player = new YTApi.Player(hostRef.current, {
        width: "100%",
        height: "100%",
        ...(source.type === "video" ? { videoId: source.videoId } : {}),
        playerVars: {
          autoplay: autoplay ? 1 : 0,
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
          ...(initialStartSecondsRef.current > 0 ? { start: initialStartSecondsRef.current } : {}),
          ...(sourceType === "playlist" && sourceListId
            ? {
                listType: "playlist",
                list: sourceListId
              }
            : {})
        },
        events: {
          onReady: (event) => {
            if (autoplay) {
              event.target.playVideo();
            }
          },
          onStateChange: (event) => {
            if (event.data === YTApi.PlayerState.PLAYING) {
              if (progressTimerRef.current) {
                window.clearInterval(progressTimerRef.current);
              }

              progressTimerRef.current = window.setInterval(() => {
                if (!playerRef.current) {
                  return;
                }

                onProgressRef.current?.(playerRef.current.getCurrentTime(), playerRef.current.getDuration());
              }, 1000);
            } else {
              if (progressTimerRef.current) {
                window.clearInterval(progressTimerRef.current);
                progressTimerRef.current = null;
              }

              if (playerRef.current) {
                onProgressRef.current?.(playerRef.current.getCurrentTime(), playerRef.current.getDuration());
              }

              if (event.data === YTApi.PlayerState.ENDED) {
                onEndedRef.current?.();
              }
            }
          },
          onError: () => {
            setPlayerError(true);
          }
        }
      });

      playerRef.current = player;
    }

    void mountPlayer();

    return () => {
      cancelled = true;
      if (progressTimerRef.current) {
        window.clearInterval(progressTimerRef.current);
        progressTimerRef.current = null;
      }

      const player = playerRef.current;
      playerRef.current = null;
      if (player) {
        try {
          player.destroy();
        } catch {
          // Ignore teardown issues from the YouTube iframe internals.
        }
      }
    };
  }, [autoplay, sourceType, sourceVideoId, sourceListId]);

  if (playerError) {
    return (
      <div className="grid h-full place-items-center px-8 text-center">
        <p className="text-[15px] text-textMuted">Embedded playback is unavailable for this content.</p>
      </div>
    );
  }

  return <div ref={hostRef} className="h-full w-full" />;
}
