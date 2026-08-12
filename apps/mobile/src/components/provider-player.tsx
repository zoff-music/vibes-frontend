import type { PlaybackState, Song } from '@vibes/models';
import { safeWrap } from '@vibes/shared';
import { NativeYouTubePlayer } from '@vibes/ui/native';
import { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import type {
  WebViewMessageEvent,
  WebView as WebViewType,
} from 'react-native-webview';
import { WebView } from 'react-native-webview';
import { Copy } from '@/components/native';
import { RoomGenerationProgress } from '@/components/room-generation-progress';
import { Toast } from '@/components/toast';

interface ProviderPlayerProps {
  availableHeight?: number;
  availableWidth?: number;
  horizontalMargin?: number;
  isGenerating: boolean;
  onLocalPlayingChange: (isPlaying: boolean) => void;
  onLocalPositionObserved: (positionMs: number) => void;
  onLocalSeek: (positionMs: number) => void;
  playback: PlaybackState | null;
  resetVersion: number;
  song: Song | null;
  synchronizePosition: boolean;
}

export function ProviderPlayer({
  availableHeight,
  availableWidth,
  horizontalMargin = playerHorizontalMargin,
  isGenerating,
  onLocalPlayingChange,
  onLocalPositionObserved,
  onLocalSeek,
  playback,
  resetVersion,
  song,
  synchronizePosition,
}: ProviderPlayerProps) {
  const { width: windowWidth } = useWindowDimensions();
  const webViewRef = useRef<WebViewType>(null);
  const previousPosition = useRef(playback?.positionMs ?? 0);
  const previousResetVersion = useRef(resetVersion);
  const [error, setError] = useState('');
  const songId = song?.id;
  const playerWidth = Math.max(
    0,
    (availableWidth ?? windowWidth) - horizontalMargin * 2,
  );
  const playerHeight = Math.max(
    minimumPlayerHeight,
    availableHeight ?? playerWidth / playerAspectRatio,
  );
  const embeddedPlayerHeight = Math.min(
    playerHeight,
    playerWidth / playerAspectRatio,
  );
  const embeddedPlayerWidth = Math.min(
    playerWidth,
    embeddedPlayerHeight * playerAspectRatio,
  );
  const playerHtml = useMemo(
    () =>
      song && song.sourceType !== 'youtube'
        ? getPlayerHtml(song.sourceId, song.sourceType, song.providerUrl)
        : '',
    [song?.providerUrl, song?.sourceId, song?.sourceType],
  );

  useEffect(() => {
    setError('');
  }, [songId]);

  useEffect(() => {
    if (!song || song.sourceType === 'youtube') return;
    webViewRef.current?.injectJavaScript(
      `window.zoffSetPlaying?.(${playback?.isPlaying ? 'true' : 'false'}); true;`,
    );
  }, [playback?.isPlaying, songId]);

  useEffect(() => {
    const position = playback?.positionMs ?? 0;
    const positionChanged = Math.abs(position - previousPosition.current);
    previousPosition.current = position;
    const shouldReset = previousResetVersion.current !== resetVersion;
    previousResetVersion.current = resetVersion;
    if (
      !song ||
      song.sourceType === 'youtube' ||
      (!shouldReset &&
        (!synchronizePosition || positionChanged < seekChangeThreshold))
    )
      return;
    webViewRef.current?.injectJavaScript(
      `window.zoffSeek?.(${Math.max(0, position)}); true;`,
    );
  }, [playback?.positionMs, resetVersion, songId, synchronizePosition]);

  if (!song && isGenerating) {
    return (
      <View
        className="overflow-hidden rounded-2xl border border-accent/60 bg-mobile-card dark:bg-mobile-dark-card"
        style={{
          height: playerHeight,
          marginHorizontal: horizontalMargin,
        }}
      >
        <RoomGenerationProgress />
      </View>
    );
  }

  if (!song) {
    return (
      <View
        className="items-center justify-center overflow-hidden rounded-2xl border border-mobile-border bg-black dark:border-mobile-dark-border"
        style={{
          height: playerHeight,
          marginHorizontal: horizontalMargin,
        }}
      >
        <Copy muted>Add a song to start listening.</Copy>
      </View>
    );
  }

  if (song.sourceType === 'youtube') {
    return (
      <View className="gap-2">
        <View
          className="items-center justify-center overflow-hidden rounded-2xl border border-mobile-border bg-black dark:border-mobile-dark-border"
          style={{
            height: playerHeight,
            marginHorizontal: horizontalMargin,
          }}
        >
          <NativeYouTubePlayer
            key={song.id}
            height={embeddedPlayerHeight}
            isPlaying={playback?.isPlaying ?? false}
            onError={setError}
            onLocalPositionObserved={onLocalPositionObserved}
            onPlayingChange={onLocalPlayingChange}
            onLocalSeek={onLocalSeek}
            positionMs={playback?.positionMs ?? 0}
            resetVersion={resetVersion}
            sourceId={song.sourceId}
            synchronizePosition={synchronizePosition}
            width={embeddedPlayerWidth}
          />
        </View>
        <Toast message={error} />
      </View>
    );
  }

  const initializePlayback = () => {
    const position = Math.max(0, playback?.positionMs ?? 0);
    webViewRef.current?.injectJavaScript(
      `window.zoffInitialize?.(${position}, ${playback?.isPlaying ? 'true' : 'false'}); true;`,
    );
  };

  const handlePlayerMessage = (event: WebViewMessageEvent) => {
    const [messageError, message] = safeWrap<unknown>(() =>
      JSON.parse(event.nativeEvent.data),
    );
    if (
      messageError ||
      !message ||
      typeof message !== 'object' ||
      !('type' in message)
    ) {
      return;
    }
    if (
      message.type === 'position' &&
      'positionMs' in message &&
      typeof message.positionMs === 'number'
    ) {
      onLocalPositionObserved(message.positionMs);
      return;
    }
    if (
      message.type === 'playing' &&
      'isPlaying' in message &&
      typeof message.isPlaying === 'boolean'
    ) {
      onLocalPlayingChange(message.isPlaying);
    }
  };

  return (
    <View
      className="overflow-hidden rounded-2xl border border-mobile-border bg-black dark:border-mobile-dark-border"
      style={{
        height: playerHeight,
        marginHorizontal: horizontalMargin,
      }}
    >
      <WebView
        ref={webViewRef}
        key={song.id}
        allowsFullscreenVideo
        allowsInlineMediaPlayback
        allowsProtectedMedia
        bounces={false}
        mediaPlaybackRequiresUserAction={false}
        onError={() =>
          setError(`Could not load the ${song.sourceType} player.`)
        }
        onHttpError={() =>
          setError(`Could not load the ${song.sourceType} player.`)
        }
        onLoadEnd={initializePlayback}
        onMessage={handlePlayerMessage}
        originWhitelist={['https://*']}
        scrollEnabled={false}
        setSupportMultipleWindows={false}
        source={{ baseUrl: platformUrl, html: playerHtml }}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}

function getPlayerHtml(
  sourceId: string,
  sourceType: Exclude<Song['sourceType'], 'youtube'>,
  providerUrl?: string,
) {
  const serializedSourceId = JSON.stringify(sourceId);

  if (sourceType === 'soundcloud') {
    const trackUrl =
      providerUrl ?? `https://api.soundcloud.com/tracks/${sourceId}`;
    const widgetUrl = `https://w.soundcloud.com/player/?url=${encodeURIComponent(trackUrl)}&auto_play=false&show_artwork=true&show_comments=false&show_reposts=false`;
    return getDocument(`
      <iframe id="player" allow="autoplay" src="${widgetUrl}"></iframe>
      <script src="https://w.soundcloud.com/player/api.js"></script>
      <script>
        let initialPosition = 0;
        let shouldPlay = false;
        const player = SC.Widget(document.getElementById('player'));
        let ready = false;
        const syncPlayback = () => {
          if (!ready) return;
          player.seekTo(initialPosition);
          if (shouldPlay) player.play();
          else player.pause();
        };
        player.bind(SC.Widget.Events.READY, () => {
          ready = true;
          syncPlayback();
        });
        player.bind(SC.Widget.Events.PLAY, () => {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'playing', isPlaying: true }));
        });
        player.bind(SC.Widget.Events.PAUSE, () => {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'playing', isPlaying: false }));
        });
        player.bind(SC.Widget.Events.PLAY_PROGRESS, (event) => {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'position', positionMs: event.currentPosition }));
        });
        window.zoffInitialize = (position, playing) => {
          initialPosition = position;
          shouldPlay = playing;
          syncPlayback();
        };
        window.zoffSetPlaying = (playing) => {
          shouldPlay = playing;
          if (!ready) return;
          if (shouldPlay) player.play();
          else player.pause();
        };
        window.zoffSeek = (position) => {
          initialPosition = position;
          if (ready) player.seekTo(position);
        };
      </script>
    `);
  }

  return getDocument(`
    <div id="player"></div>
    <script src="https://open.spotify.com/embed/iframe-api/v1"></script>
    <script>
      let controller;
      let initialPosition = 0;
      let shouldPlay = false;
      const syncPlayback = () => {
        if (!controller) return;
        controller.seek(initialPosition);
        if (shouldPlay) controller.resume();
        else controller.pause();
      };
      window.onSpotifyIframeApiReady = (IFrameAPI) => {
        IFrameAPI.createController(
          document.getElementById('player'),
          { uri: 'spotify:track:' + ${serializedSourceId}, height: '100%', width: '100%' },
          (nextController) => {
            controller = nextController;
            controller.addListener('playback_update', (event) => {
              window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'position', positionMs: event.data.position }));
              window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'playing', isPlaying: !event.data.isPaused }));
            });
            syncPlayback();
          }
        );
      };
      window.zoffInitialize = (position, playing) => {
        initialPosition = position;
        shouldPlay = playing;
        syncPlayback();
      };
      window.zoffSetPlaying = (playing) => {
        shouldPlay = playing;
        if (!controller) return;
        if (playing) controller.resume();
        else controller.pause();
      };
      window.zoffSeek = (position) => {
        initialPosition = position;
        controller?.seek(position);
      };
    </script>
  `);
}

function getDocument(content: string) {
  return `<!doctype html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <style>
          * { box-sizing: border-box; }
          html, body, #player, iframe { background: #000; border: 0; height: 100%; margin: 0; overflow: hidden; padding: 0; width: 100%; }
        </style>
      </head>
      <body>${content}</body>
    </html>`;
}

const platformUrl = 'https://zoff.me';

const seekChangeThreshold = 5_000;

const minimumPlayerHeight = 200;

const playerAspectRatio = 16 / 9;

const playerHorizontalMargin = 16;
