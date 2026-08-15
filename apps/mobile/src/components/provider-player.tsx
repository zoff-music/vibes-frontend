import type { PlaybackState, Song } from '@vibes/models';
import { safeWrap } from '@vibes/shared';
import { NativeSoundCloudPlayer, NativeYouTubePlayer } from '@vibes/ui/native';
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
  positionMs: number;
  resetVersion: number;
  song: Song | null;
  suppressPlayback: boolean;
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
  positionMs,
  resetVersion,
  song,
  suppressPlayback,
  synchronizePosition,
}: ProviderPlayerProps) {
  const { width: windowWidth } = useWindowDimensions();
  const isPhoneLayout = availableWidth === undefined && windowWidth < 600;
  const webViewRef = useRef<WebViewType>(null);
  const previousPosition = useRef(positionMs);
  const previousResetVersion = useRef(resetVersion);
  const [error, setError] = useState('');
  const [retainedYouTubeSong, setRetainedYouTubeSong] = useState<Song | null>(
    song?.sourceType === 'youtube' ? song : null,
  );
  const [retainedSoundCloudSong, setRetainedSoundCloudSong] =
    useState<Song | null>(song?.sourceType === 'soundcloud' ? song : null);
  const songId = song?.id;
  const youtubeSong =
    song?.sourceType === 'youtube' ? song : retainedYouTubeSong;
  const soundCloudSong =
    song?.sourceType === 'soundcloud' ? song : retainedSoundCloudSong;
  const isYouTubeActive = song?.sourceType === 'youtube';
  const isSoundCloudActive = song?.sourceType === 'soundcloud';
  const localIsPlaying = !suppressPlayback && (playback?.isPlaying ?? false);
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
      song?.sourceType === 'spotify' ? getSpotifyPlayerHtml(song.sourceId) : '',
    [song?.sourceId, song?.sourceType],
  );

  useEffect(() => {
    setError('');
  }, [songId]);

  useEffect(() => {
    if (song?.sourceType === 'youtube') setRetainedYouTubeSong(song);
    if (song?.sourceType === 'soundcloud') setRetainedSoundCloudSong(song);
  }, [song]);

  useEffect(() => {
    if (song?.sourceType !== 'spotify') return;
    webViewRef.current?.injectJavaScript(
      `window.zoffSetPlaying?.(${localIsPlaying ? 'true' : 'false'}); true;`,
    );
  }, [localIsPlaying, song?.sourceType]);

  useEffect(() => {
    const positionChanged = Math.abs(positionMs - previousPosition.current);
    previousPosition.current = positionMs;
    const shouldReset = previousResetVersion.current !== resetVersion;
    previousResetVersion.current = resetVersion;
    if (
      song?.sourceType !== 'spotify' ||
      (!shouldReset &&
        (!synchronizePosition || positionChanged < seekChangeThreshold))
    )
      return;
    webViewRef.current?.injectJavaScript(
      `window.zoffSeek?.(${Math.max(0, positionMs)}); true;`,
    );
  }, [positionMs, resetVersion, songId, synchronizePosition]);

  const initializePlayback = () => {
    const position = Math.max(0, positionMs);
    webViewRef.current?.injectJavaScript(
      `window.zoffInitialize?.(${position}, ${localIsPlaying ? 'true' : 'false'}); true;`,
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
      if (suppressPlayback) return;
      onLocalPositionObserved(message.positionMs);
      return;
    }
    if (
      message.type === 'playing' &&
      'isPlaying' in message &&
      typeof message.isPlaying === 'boolean'
    ) {
      if (suppressPlayback) return;
      onLocalPlayingChange(message.isPlaying);
    }
  };

  return (
    <View className="gap-2">
      <View
        className="items-center justify-center overflow-hidden rounded-2xl border border-mobile-border bg-black dark:border-mobile-dark-border"
        style={{
          height: playerHeight,
          marginHorizontal: horizontalMargin,
        }}
      >
        {youtubeSong && (
          <View
            pointerEvents={isYouTubeActive ? 'auto' : 'none'}
            style={[
              StyleSheet.absoluteFill,
              {
                alignItems: 'center',
                justifyContent: 'center',
                opacity: isYouTubeActive ? 1 : 0,
                zIndex: isYouTubeActive ? 2 : 0,
              },
            ]}
          >
            <NativeYouTubePlayer
              height={embeddedPlayerHeight}
              isPlaying={isYouTubeActive && localIsPlaying}
              onError={setError}
              positionMs={isYouTubeActive ? positionMs : 0}
              resetVersion={resetVersion}
              sourceId={youtubeSong.sourceId}
              synchronizePosition={
                isYouTubeActive && !suppressPlayback && synchronizePosition
              }
              width={embeddedPlayerWidth}
              {...(isYouTubeActive
                ? {
                    onLocalPositionObserved: (observedPositionMs) => {
                      if (suppressPlayback) return;
                      onLocalPositionObserved(observedPositionMs);
                    },
                    onLocalSeek,
                    onPlayingChange: (isPlaying) => {
                      if (suppressPlayback) return;
                      onLocalPlayingChange(isPlaying);
                    },
                  }
                : {})}
            />
          </View>
        )}
        {soundCloudSong && (
          <View
            pointerEvents={isSoundCloudActive ? 'auto' : 'none'}
            style={[
              StyleSheet.absoluteFill,
              {
                alignItems: 'center',
                justifyContent: 'center',
                opacity: isSoundCloudActive ? 1 : 0,
                zIndex: isSoundCloudActive ? 2 : 0,
              },
            ]}
          >
            <NativeSoundCloudPlayer
              artworkUrl={soundCloudSong.thumbnailUrl}
              blankArtworkColor={isPhoneLayout ? '#f5f5f5' : '#000000'}
              height={embeddedPlayerHeight}
              interactive={isSoundCloudActive && !suppressPlayback}
              isPlaying={isSoundCloudActive && localIsPlaying}
              onError={setError}
              positionMs={isSoundCloudActive ? positionMs : 0}
              resetVersion={resetVersion}
              sourceId={soundCloudSong.sourceId}
              synchronizePosition={
                isSoundCloudActive && !suppressPlayback && synchronizePosition
              }
              width={embeddedPlayerWidth}
              {...(isSoundCloudActive
                ? {
                    onLocalPositionObserved: (observedPositionMs) => {
                      if (suppressPlayback) return;
                      onLocalPositionObserved(observedPositionMs);
                    },
                    onLocalSeek,
                    onPlayingChange: (isPlaying) => {
                      if (suppressPlayback) return;
                      onLocalPlayingChange(isPlaying);
                    },
                  }
                : {})}
              {...(soundCloudSong.providerUrl
                ? { providerUrl: soundCloudSong.providerUrl }
                : {})}
            />
          </View>
        )}
        {!song && isGenerating && <RoomGenerationProgress />}
        {!song && !isGenerating && (
          <Copy muted>Add a song to start listening.</Copy>
        )}
        {song?.sourceType === 'spotify' && (
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
        )}
      </View>
      <Toast message={error} />
    </View>
  );
}

function getSpotifyPlayerHtml(sourceId: string) {
  const serializedSourceId = JSON.stringify(sourceId);
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
