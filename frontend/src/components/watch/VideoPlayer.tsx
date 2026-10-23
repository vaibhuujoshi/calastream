
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import {
  Plyr,
  type APITypes,
  type PlyrOptions,
} from "plyr-react";
import Hls from "hls.js";
import "plyr-react/plyr.css";

interface VideoPlayerProps {
  videoUrl: string;
  thumbnail: string;
}

const QUALITY_LEVELS = [0, 1080, 720, 480];
const SEEK_SECONDS = 10;
const VOLUME_STEP = 0.05;
const FRAME_DURATION = 1 / 30;

export function VideoPlayer({
  videoUrl,
  thumbnail,
}: VideoPlayerProps) {
  const playerRef = useRef<APITypes | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isPlayerActiveRef = useRef(false);

  const handleQualityChange = useCallback((quality: number) => {
    const hls = hlsRef.current;

    if (!hls) return;

    if (quality === 0) {
      hls.currentLevel = -1;
      return;
    }

    const levelIndex = hls.levels.findIndex(
      (level) => level.height === quality,
    );

    if (levelIndex !== -1) {
      hls.currentLevel = levelIndex;
    }
  }, []);

  const options = useMemo<PlyrOptions>(
    () => ({
      ratio: "16:9",

      controls: [
        "play-large",
        "play",
        "progress",
        "current-time",
        "mute",
        "volume",
        "settings",
        "fullscreen",
      ],

      settings: ["quality", "speed"],

      quality: {
        default: 0,
        options: QUALITY_LEVELS,
        forced: true,
        onChange: handleQualityChange,
      },

      i18n: {
        qualityLabel: {
          0: "Auto",
          1080: "1080p",
          720: "720p",
          480: "480p",
        },
      },

      speed: {
        selected: 1,
        options: [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2],
      },

      fullscreen: {
        enabled: true,
        fallback: true,
        iosNative: false,
      },

      tooltips: {
        controls: true,
        seek: true,
      },

      // We handle shortcuts ourselves to avoid global conflicts.
      keyboard: {
        focused: false,
        global: false,
      },
    }),
    [handleQualityChange],
  );

  // HLS playback and cleanup.
  useEffect(() => {
    const video = playerRef.current?.plyr.media as
      | HTMLVideoElement
      | undefined;

    if (!video || !videoUrl) return;

    let hls: Hls | null = null;

    if (Hls.isSupported()) {
      hls = new Hls({
        capLevelToPlayerSize: true,
      });

      hlsRef.current = hls;

      hls.on(Hls.Events.MANIFEST_PARSED, (_event, data) => {
        console.info(
          "Available HLS qualities:",
          data.levels.map((level) => level.height),
        );
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        console.error("HLS error:", {
          type: data.type,
          details: data.details,
          fatal: data.fatal,
        });

        if (!data.fatal || !hls) return;

        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          hls.startLoad();
        } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
        } else {
          hls.destroy();
        }
      });

      hls.attachMedia(video);
      hls.loadSource(videoUrl);
    } else if (
      video.canPlayType("application/vnd.apple.mpegurl")
    ) {
      video.src = videoUrl;
    } else {
      console.error("This browser does not support HLS playback.");
    }

    return () => {
      hls?.destroy();

      if (hlsRef.current === hls) {
        hlsRef.current = null;
      }

      video.removeAttribute("src");
      video.load();
    };
  }, [videoUrl]);

  // YouTube-style keyboard shortcuts.
  useEffect(() => {
    const container = containerRef.current;

    if (!container) return;

    const isTypingTarget = (target: EventTarget | null) => {
      if (!(target instanceof HTMLElement)) return false;

      return (
        target.isContentEditable ||
        ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)
      );
    };

    const onPointerDown = (event: PointerEvent) => {
      isPlayerActiveRef.current =
        event.target instanceof Node &&
        container.contains(event.target);
    };

    const onFocusIn = (event: FocusEvent) => {
      if (
        event.target instanceof Node &&
        container.contains(event.target)
      ) {
        isPlayerActiveRef.current = true;
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (!isPlayerActiveRef.current) return;
      if (event.defaultPrevented) return;
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      if (isTypingTarget(event.target)) return;

      const player = playerRef.current?.plyr;
      const video = player?.media as HTMLVideoElement | undefined;

      if (!player || !video) return;

      const key = event.key;
      const lowerKey = key.toLowerCase();

      // Don't hijack settings-menu navigation or other player buttons.
      const target = event.target;
      const isControl =
        target instanceof HTMLElement &&
        (target.closest("button, [role='menuitem'], [role='slider']") !==
          null ||
          target.closest(".plyr__controls") !== null);

      // Allow native keyboard interaction when a player control is focused.
      if (isControl && key !== "Escape") return;

      const seekTo = (time: number) => {
        if (!Number.isFinite(video.duration)) return;

        video.currentTime = Math.max(
          0,
          Math.min(video.duration, time),
        );
      };

      let handled = true;

      switch (lowerKey) {
        case "k":
        case " ":
          if (player.playing) {
            player.pause();
          } else {
            void player.play();
          }
          break;

        case "j":
        case "arrowleft":
          seekTo(video.currentTime - SEEK_SECONDS);
          break;

        case "l":
        case "arrowright":
          seekTo(video.currentTime + SEEK_SECONDS);
          break;

        case "arrowup":
          player.volume = Math.min(
            1,
            player.volume + VOLUME_STEP,
          );
          player.muted = false;
          break;

        case "arrowdown":
          player.volume = Math.max(
            0,
            player.volume - VOLUME_STEP,
          );
          player.muted = false;
          break;

        case "m":
          player.muted = !player.muted;
          break;

        case "f":
          if (player.fullscreen.active) {
            void player.fullscreen.exit();
          } else {
            void player.fullscreen.enter();
          }
          break;

        case "home":
          seekTo(0);
          break;

        case "end":
          if (Number.isFinite(video.duration)) {
            seekTo(video.duration);
          }
          break;

        case ",":
          if (video.paused) {
            seekTo(video.currentTime - FRAME_DURATION);
          } else {
            handled = false;
          }
          break;

        case ".":
          if (video.paused) {
            seekTo(video.currentTime + FRAME_DURATION);
          } else {
            handled = false;
          }
          break;

        case ">":
          player.speed = Math.min(2, player.speed + 0.25);
          break;

        case "<":
          player.speed = Math.max(0.25, player.speed - 0.25);
          break;

        default: {
          // Number keys seek to a percentage of the video.
          if (/^[0-9]$/.test(key) && Number.isFinite(video.duration)) {
            seekTo((Number(key) / 10) * video.duration);
          } else {
            handled = false;
          }
        }
      }

      if (handled) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    document.addEventListener("pointerdown", onPointerDown, true);
    document.addEventListener("focusin", onFocusIn, true);
    document.addEventListener("keydown", onKeyDown, true);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown, true);
      document.removeEventListener("focusin", onFocusIn, true);
      document.removeEventListener("keydown", onKeyDown, true);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="video-player-container"
      tabIndex={0}
      aria-label="Video player. Use K to play or pause, J and L to seek, M to mute, and F for fullscreen."
    >
      <div className="video-player-frame">
        <Plyr
          ref={playerRef}
          source={{
            type: "video",
            sources: [
              {
                src: videoUrl,
                type: "application/vnd.apple.mpegurl",
              },
            ],
            poster: thumbnail,
          }}
          options={options}
        />
      </div>
    </div>
  );
}
