import type { PlaybackState, Song } from '@vibes/models';
import { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import type { WebView as WebViewType } from 'react-native-webview';
import { WebView } from 'react-native-webview';

import { Copy } from '@/components/native';
import { YouTubePlayer } from '@/components/youtube-player';

interface ProviderPlayerProps {
  playback: PlaybackState | null;
  song: Song | null;
}

export function ProviderPlayer({ playback, song }: ProviderPlayerProps) {
  const { width: windowWidth } = useWindowDimensions();
  const webViewRef = useRef<WebViewType>(null);
  const previousPosition = useRef(playback?.positionMs ?? 0);
  const [error, setError] = useState('');
  const songId = song?.id;
  const playerWidth = Math.max(0, windowWidth - playerHorizontalMargin * 2);
  const playerHeight = Math.max(
    minimumPlayerHeight,
    playerWidth / playerAspectRatio,
  );
  const playerHtml = useMemo(
    () =>
      song && song.sourceType !== 'youtube'
        ? getPlayerHtml(song.sourceId, song.sourceType, song.providerUrl)
        : '',
    [song?.providerUrl, song?.sourceId, song?.sourceType],
  );

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
    if (
      !song ||
      song.sourceType === 'youtube' ||
      positionChanged < seekChangeThreshold
    )
      return;
    webViewRef.current?.injectJavaScript(
      `window.zoffSeek?.(${Math.max(0, position)}); true;`,
    );
  }, [playback?.positionMs, songId]);

  if (!song) {
    return (
      <View
        className="items-center justify-center overflow-hidden rounded-2xl border border-mobile-border bg-black dark:border-mobile-dark-border"
        style={{
          height: playerHeight,
          marginHorizontal: playerHorizontalMargin,
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
          className="overflow-hidden rounded-2xl border border-mobile-border bg-black dark:border-mobile-dark-border"
          style={{
            height: playerHeight,
            marginHorizontal: playerHorizontalMargin,
          }}
        >
          <YouTubePlayer
            key={song.id}
            height={playerHeight}
            onError={setError}
            playback={playback}
            sourceId={song.sourceId}
            width={playerWidth}
          />
        </View>
        {Boolean(error) && (
          <View className="px-4">
            <Copy muted>{error}</Copy>
          </View>
        )}
      </View>
    );
  }

  const initializePlayback = () => {
    const position = Math.max(0, playback?.positionMs ?? 0);
    webViewRef.current?.injectJavaScript(
      `window.zoffInitialize?.(${position}, ${playback?.isPlaying ? 'true' : 'false'}); true;`,
    );
  };

  return (
    <View
      className="overflow-hidden rounded-2xl border border-mobile-border bg-black dark:border-mobile-dark-border"
      style={{
        height: playerHeight,
        marginHorizontal: playerHorizontalMargin,
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
        onLoadEnd={initializePlayback}
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
        player.bind(SC.Widget.Events.READY, () => {
          player.seekTo(initialPosition);
          if (shouldPlay) player.play();
        });
        window.zoffInitialize = (position, playing) => {
          initialPosition = position;
          shouldPlay = playing;
        };
        window.zoffSetPlaying = (playing) => {
          shouldPlay = playing;
          if (playing) player.play();
          else player.pause();
        };
        window.zoffSeek = (position) => player.seekTo(position);
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
      window.onSpotifyIframeApiReady = (IFrameAPI) => {
        IFrameAPI.createController(
          document.getElementById('player'),
          { uri: 'spotify:track:' + ${serializedSourceId}, height: '100%', width: '100%' },
          (nextController) => {
            controller = nextController;
            controller.seek(initialPosition);
            if (shouldPlay) controller.resume();
          }
        );
      };
      window.zoffInitialize = (position, playing) => {
        initialPosition = position;
        shouldPlay = playing;
      };
      window.zoffSetPlaying = (playing) => {
        shouldPlay = playing;
        if (!controller) return;
        if (playing) controller.resume();
        else controller.pause();
      };
      window.zoffSeek = (position) => controller?.seek(position);
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
