import {
  type CastDevice,
  type CastError,
  type CastRoomInfo,
  type CastSession,
  type CastSessionState,
  type CastManager as ICastManager,
  type MediaInfo,
  type PlaybackStateV2,
  type PlaylistItem,
} from '@vibes/models';
import {
  browserDebugLog,
  isBrowserDebugEnabled,
  type ResolvedColorScheme,
  safeWrap,
  safeWrapAsync,
  useRoomStore,
} from '@vibes/shared';
import { useThemeStore } from '@vibes/shared/themeStore';

import {
  CAST_APPLICATION_ID,
  CAST_DEVICE_PICKER_ID,
  CUSTOM_RECEIVER_URL,
  DEVELOPMENT_MODE,
  LOCAL_EMULATOR_ENABLED,
} from './constants';
import { CastEventBus } from './EventBus';
import { LocalEmulator } from './LocalEmulator';
import type { LocalCastMessage } from './types';

const CUSTOM_NAMESPACE = 'urn:x-cast:com.vibez.cast';

/**
 * Google Cast SDK Manager - orchestrates all casting functionality.
 * Implements the CastManager interface from @vibes/models.
 */
class GoogleCastManager implements ICastManager {
  private devices: CastDevice[] = [];
  private currentSession: CastSession | null = null;
  private actualCastSession: chrome.cast.Session | null = null;

  private isInitialized = false;
  private initializationPromise: Promise<void> | null = null;
  private castContext: cast.framework.CastContext | null = null;
  private roomCredentials: { castToken: string; roomId: string } | null = null;

  private eventBus: CastEventBus;
  private localEmulator: LocalEmulator;

  constructor() {
    this.eventBus = new CastEventBus();
    this.localEmulator = new LocalEmulator({
      notifyDeviceAvailable: this.notifyDeviceAvailable.bind(this),
      getDevices: () => this.devices,
      setDevices: (devices) => {
        this.devices = devices;
      },
      getColorScheme: () => useThemeStore.getState().resolvedTheme,
    });
  }

  // ============================================================
  // SDK Initialization
  // ============================================================

  private async initializeCastSDK(): Promise<void> {
    if (typeof window === 'undefined' || this.isInitialized) return;
    if (this.initializationPromise) return this.initializationPromise;

    this.initializationPromise = (async () => {
      const [error] = await safeWrapAsync(
        new Promise<void>((resolve, reject) => {
          if (typeof cast !== 'undefined' && cast.framework?.CastContext) {
            resolve();
            return;
          }

          const previousCallback = window.__onGCastApiAvailable;
          const existing = document.querySelector<HTMLScriptElement>(
            `script[src="${castSenderScriptUrl}"]`,
          );
          const script = existing ?? document.createElement('script');
          const finish = (error?: Error) => {
            clearTimeout(timeout);
            script.removeEventListener('error', onError);
            window.__onGCastApiAvailable = previousCallback;

            if (error && !existing) script.remove();

            if (error) reject(error);
            else resolve();
          };
          const onError = () =>
            finish(new Error('Failed to load Google Cast SDK'));
          const timeout = setTimeout(
            () => finish(new Error('Google Cast SDK availability timed out')),
            10000,
          );

          window.__onGCastApiAvailable = (available, reason) => {
            previousCallback?.(available, reason);
            if (!available) {
              finish(new Error(reason || 'Google Cast SDK unavailable'));
              return;
            }
            finish();
          };
          script.addEventListener('error', onError, { once: true });
          if (!existing) {
            script.dataset.smolterPreserve = '';
            script.src = castSenderScriptUrl;
            document.head.appendChild(script);
          }
        }),
      );

      if (error) {
        this.initializationPromise = null;
        throw error;
      }

      const [setupError] = await safeWrapAsync(this.setupCastAPI());
      if (setupError) {
        this.initializationPromise = null;
        throw setupError;
      }
      this.isInitialized = true;
    })();

    return this.initializationPromise;
  }

  private setupCastAPI(): Promise<void> {
    const [error] = safeWrap(() => {
      const context = cast.framework.CastContext.getInstance();
      this.castContext = context;
      context.addEventListener(
        cast.framework.CastContextEventType.CAST_STATE_CHANGED,
        this.handleCastState,
      );
      context.addEventListener(
        cast.framework.CastContextEventType.SESSION_STATE_CHANGED,
        this.handleSessionState,
      );
      context.setOptions({
        receiverApplicationId: CAST_APPLICATION_ID,
        autoJoinPolicy: chrome.cast.AutoJoinPolicy.TAB_AND_ORIGIN_SCOPED,
        resumeSavedSession: true,
      });
      this.refreshCastState();
      const session = context.getCurrentSession();
      if (session) this.onSessionListener(session.getSessionObj());
    });

    if (error) return Promise.reject(error);

    return Promise.resolve();
  }

  private handleCastState = (): void => {
    this.refreshCastState();
  };

  private refreshCastState(): void {
    const state = this.castContext?.getCastState();
    this.onReceiverListener(
      state && state !== cast.framework.CastState.NO_DEVICES_AVAILABLE
        ? 'available'
        : 'unavailable',
    );
  }

  private handleSessionState = (
    event: cast.framework.SessionStateEventData,
  ): void => {
    if (
      event.sessionState === cast.framework.SessionState.SESSION_STARTED ||
      event.sessionState === cast.framework.SessionState.SESSION_RESUMED
    ) {
      const session = this.castContext?.getCurrentSession();
      if (session) this.onSessionListener(session.getSessionObj());

      return;
    }

    if (event.sessionState !== cast.framework.SessionState.SESSION_ENDED)
      return;

    this.detachSessionMessages();
    if (this.currentSession) {
      this.notifySessionStateChange({
        ...this.currentSession,
        state: 'disconnected',
      });
    }
    this.currentSession = null;
  };

  private handleCustomMessage = (namespace: string, message: string): void => {
    this.onCustomMessage(namespace, message);
  };

  private detachSessionMessages(): void {
    this.actualCastSession?.removeMessageListener(
      CUSTOM_NAMESPACE,
      this.handleCustomMessage,
    );
    this.actualCastSession = null;
  }

  private onSessionListener(session: chrome.cast.Session): void {
    if (this.actualCastSession === session) return;

    this.detachSessionMessages();
    this.actualCastSession = session;
    this.currentSession = {
      id: session.sessionId,
      deviceId: session.receiver.label,
      deviceName: session.receiver.friendlyName,
      deviceType: 'chromecast',
      state: 'connected',
      startedAt: new Date(),
      lastSyncAt: new Date(),
    };
    session.addMessageListener(CUSTOM_NAMESPACE, this.handleCustomMessage);
    this.notifySessionStateChange(this.currentSession);
  }

  private onReceiverListener(availability: string): void {
    browserDebugLog('Cast receiver availability changed:', availability);

    const [err] = safeWrap(() => {
      const isAvailable =
        availability === 'available' ||
        availability === window.chrome?.cast?.ReceiverAvailability?.AVAILABLE;

      if (!isAvailable) {
        browserDebugLog('No Chromecast devices available');
        this.devices = [];

        if (LOCAL_EMULATOR_ENABLED) {
          this.localEmulator.ensureLocalEmulatorDevice();
        } else {
          browserDebugLog('[Cast] cleared device list');
        }

        return;
      }

      browserDebugLog('Chromecast devices are available on the network');
      const device: CastDevice = {
        id: CAST_DEVICE_PICKER_ID,
        name: 'Cast to TV',
        type: 'chromecast',
        capabilities: ['video_out', 'audio_out'],
        isAvailable: true,
        lastSeen: new Date(),
      };

      this.devices = [device];

      if (LOCAL_EMULATOR_ENABLED) {
        this.localEmulator.ensureLocalEmulatorDevice();
      }

      browserDebugLog('[Cast] device available', device);
      this.notifyDeviceAvailable(device);
    });

    if (err) {
      console.error('Error handling receiver availability:', err);
      this.notifyError({
        code: 'RECEIVER_HANDLER_ERROR',
        description: 'Error processing receiver availability',
        details: err,
      });
    }
  }

  private onCustomMessage(_namespace: string, message: string): void {
    const [err] = safeWrap(() => {
      const data = JSON.parse(message);

      if (data.action === 'receiverReady') {
        const roomId = this.localEmulator.getRoomIdFromContext();

        if (!roomId) {
          console.warn('[Cast] receiverReady but roomId missing');

          return;
        }

        const castToken = this.roomCredentials?.castToken;

        if (!castToken || this.roomCredentials?.roomId !== roomId) {
          console.warn('[Cast] receiverReady before room credentials loaded');

          return;
        }

        const [joinErr] = safeWrap(() => {
          void this.joinRoom(roomId, castToken);
        });

        if (joinErr) {
          console.error(
            'Failed to send joinRoom after receiverReady:',
            joinErr,
          );
        }

        return;
      }

      if (data.action === 'LOG') {
        const { level, args } = data;
        const prefix = '%c[RECEIVER]';
        const style =
          'background: #222; color: #bada55; font-weight: bold; padding: 2px 4px; border-radius: 2px;';

        const logArgs = args.map((arg: string) => {
          const [parseErr, parsed] = safeWrap(() => JSON.parse(arg));

          return parseErr ? arg : parsed;
        });

        switch (level) {
          case 'error':
            console.error(prefix, style, ...logArgs);
            break;
          case 'warn':
            console.warn(prefix, style, ...logArgs);
            break;
          case 'debug':
            if (isBrowserDebugEnabled()) {
              console.debug(prefix, style, ...logArgs);
            }
            break;
          default:
            browserDebugLog(prefix, style, ...logArgs);
        }
      }
    });

    if (err) {
      console.error('Failed to process custom cast message', err);
    }
  }

  // ============================================================
  // Public API - Device Discovery
  // ============================================================

  async discoverDevices(): Promise<CastDevice[]> {
    if (LOCAL_EMULATOR_ENABLED) {
      this.localEmulator.ensureLocalEmulatorDevice();
    }

    if (!this.isInitialized) {
      const [initErr] = await safeWrapAsync(this.initializeCastSDK());

      if (initErr) {
        if (
          typeof initErr === 'object' &&
          initErr !== null &&
          'code' in initErr &&
          (initErr as { code: string }).code === 'API_TIMEOUT_INTERNAL'
        ) {
          console.warn(
            'Cast initialization timed out - likely unsupported browser. Skipping discovery error.',
          );

          return LOCAL_EMULATOR_ENABLED ? [...this.devices] : [];
        }

        console.error('Failed to discover devices:', initErr);
        this.notifyError({
          code: 'DISCOVERY_FAILED',
          description: 'Failed to discover casting devices',
          details: initErr,
        });

        return LOCAL_EMULATOR_ENABLED ? [...this.devices] : [];
      }
    }

    return [...this.devices];
  }

  getAvailableDevices(): CastDevice[] {
    if (LOCAL_EMULATOR_ENABLED) {
      this.localEmulator.ensureLocalEmulatorDevice();
    }

    return [...this.devices];
  }

  prepareLocalReceiverWindow(): boolean {
    if (!LOCAL_EMULATOR_ENABLED) {
      return false;
    }

    const success = this.localEmulator.prepareLocalReceiverWindow();

    if (!success) {
      this.notifyError({
        code: 'LOCAL_RECEIVER_BLOCKED',
        description: 'Failed to open local cast receiver window',
        details: new Error('Local cast receiver window could not be opened'),
      });
    }

    return success;
  }

  // ============================================================
  // Public API - Session Management
  // ============================================================

  async connectToDevice(deviceId: string): Promise<CastSession> {
    if (
      LOCAL_EMULATOR_ENABLED &&
      this.localEmulator.isLocalEmulator(deviceId)
    ) {
      const receiverWindow = this.localEmulator.openLocalReceiver();

      if (!receiverWindow) {
        const error = new Error(
          'Local cast receiver window could not be opened',
        );
        this.notifyError({
          code: 'LOCAL_RECEIVER_BLOCKED',
          description: 'Failed to open local cast receiver window',
          details: error,
        });
        throw error;
      }

      const castSession = this.localEmulator.createLocalSession();
      this.currentSession = castSession;
      this.actualCastSession = null;
      this.notifySessionStateChange(castSession);

      return castSession;
    }

    if (!this.isInitialized) throw new Error('Cast SDK not initialized');

    const device = this.devices.find((d) => d.id === deviceId);

    if (!device && deviceId !== CAST_DEVICE_PICKER_ID) {
      throw new Error(`Device ${deviceId} not found`);
    }

    if (this.currentSession && this.currentSession.deviceId === deviceId) {
      browserDebugLog('[Cast] already connected to device', deviceId);

      return this.currentSession;
    }

    const context = this.castContext;
    if (!context) throw new Error('Cast SDK not initialized');

    await context.requestSession();
    const session = context.getCurrentSession();
    if (!session) throw new Error('No Cast session selected');

    this.onSessionListener(session.getSessionObj());
    const [muteError] = await safeWrapAsync(session.setMute(false));
    if (muteError)
      console.error('Failed to unmute Cast receiver output:', muteError);

    if (!this.currentSession) throw new Error('Cast session not available');

    return this.currentSession;
  }

  async disconnectFromDevice(deviceId: string): Promise<void> {
    if (!this.currentSession || this.currentSession.deviceId !== deviceId) {
      return;
    }

    if (this.localEmulator.isLocalEmulator(deviceId)) {
      this.localEmulator.disconnectLocal();
      this.currentSession.state = 'disconnected';
      this.currentSession.lastSyncAt = new Date();
      this.notifySessionStateChange(this.currentSession);
      this.currentSession = null;
      this.actualCastSession = null;

      return;
    }

    this.castContext?.endCurrentSession(true);
  }

  // ============================================================
  // Public API - Media Control
  // ============================================================

  async castMedia(
    mediaInfo: MediaInfo,
    playlistItem: PlaylistItem,
  ): Promise<void> {
    if (!this.currentSession) throw new Error('No active cast session');

    if (this.currentSession.state !== 'connected') {
      throw new Error(`Cast session not ready: ${this.currentSession.state}`);
    }

    if (this.localEmulator.isLocalEmulator(this.currentSession.deviceId)) {
      this.sendLocalPlaybackState(playlistItem);

      return;
    }

    const session = this.actualCastSession;

    if (!session) {
      console.error('No actual cast session stored');
      throw new Error('Cast session not found');
    }

    browserDebugLog('🎬 Using stored cast session for media loading:', session);
    browserDebugLog('[Cast] castMedia payload', {
      contentId: mediaInfo.contentId,
      contentType: mediaInfo.contentType,
      title: mediaInfo.metadata.title,
      sourceType: mediaInfo.metadata.artist ? 'audio' : 'unknown',
    });

    return new Promise((resolve, reject) => {
      const roomState = useRoomStore.getState();
      const roomId = roomState.room?.id || '';

      if (DEVELOPMENT_MODE || this.isYouTubeUrl(mediaInfo.contentId)) {
        browserDebugLog('🎵 Preparing custom Zoff receiver session');

        const url = new URL(CUSTOM_RECEIVER_URL, window.location.origin);

        if (roomId) url.searchParams.set('roomId', roomId);

        if (
          new URLSearchParams(window.location.search).get('debug') === 'true'
        ) {
          url.searchParams.set('debug', 'true');
        }

        const receiverUrl = url.toString();

        browserDebugLog('[Cast] Custom context ready', { receiverUrl });

        setTimeout(() => {
          this.sendMediaToReceiver(playlistItem, session);
        }, 1000);

        if (this.currentSession) {
          this.currentSession.state = 'connected';
          this.currentSession.lastSyncAt = new Date();
          this.notifySessionStateChange(this.currentSession);
        }

        resolve();
      } else {
        this.loadStandardMedia(mediaInfo, session, resolve, reject);
      }
    });
  }

  private sendMediaToReceiver(
    playlistItem: PlaylistItem,
    session: chrome.cast.Session,
  ): void {
    const [err] = safeWrap(() => {
      const message = {
        action: 'updatePlayback',
        currentSong: playlistItem,
        isPlaying: true,
        positionMs: 0,
        queue: [],
        roomInfo: {
          name: 'Cast Session',
          participantCount: 1,
        },
      };

      browserDebugLog('🎵 Sending playback state to receiver:', {
        action: message.action,
        title: message.currentSong.title,
        sourceType: message.currentSong.sourceType,
        sourceId: message.currentSong.sourceId,
      });

      session.sendMessage(
        CUSTOM_NAMESPACE,
        message,
        () => browserDebugLog('✅ Playback state sent to receiver'),
        (error: chrome.cast.Error) =>
          console.error('❌ Failed to send playback state:', error),
      );
    });

    if (err) console.error('Error sending media to receiver:', err);
  }

  private sendLocalPlaybackState(playlistItem: PlaylistItem): void {
    const [err] = safeWrap(() => {
      const message: LocalCastMessage = {
        action: 'updatePlayback',
        currentSong: playlistItem,
        isPlaying: true,
        positionMs: 0,
        queue: [],
        roomInfo: {
          name: 'Local Cast',
          participantCount: 1,
        },
        timestamp: Date.now(),
      };

      browserDebugLog('[Local Cast] sending playback state', {
        title: message.currentSong.title,
        sourceType: message.currentSong.sourceType,
      });
      this.localEmulator.sendLocalMessage(message);
    });

    if (err) {
      console.error('Error sending local playback state:', err);
    }
  }

  private loadStandardMedia(
    mediaInfo: MediaInfo,
    session: chrome.cast.Session,
    resolve: () => void,
    reject: (error: Error) => void,
  ): void {
    const [err] = safeWrap(() => {
      browserDebugLog('[Cast] loadStandardMedia:start', {
        contentId: mediaInfo.contentId,
        contentType: mediaInfo.contentType,
      });

      const castMediaInfo = new window.chrome.cast.media.MediaInfo(
        mediaInfo.contentId,
        mediaInfo.contentType,
      );

      const metadata = new window.chrome.cast.media.GenericMediaMetadata();
      metadata.title = mediaInfo.metadata.title;
      metadata.subtitle = mediaInfo.metadata.artist || '';

      if (mediaInfo.metadata.images && mediaInfo.metadata.images.length > 0) {
        metadata.images = mediaInfo.metadata.images.map((img) => ({
          url: img.url,
          height: img.height || 480,
          width: img.width || 640,
        }));
      }

      castMediaInfo.metadata = metadata;
      castMediaInfo.streamType =
        mediaInfo.streamType === 'LIVE'
          ? window.chrome.cast.media.StreamType.LIVE
          : window.chrome.cast.media.StreamType.BUFFERED;

      if (mediaInfo.duration) {
        castMediaInfo.duration = mediaInfo.duration;
      }

      const request = new window.chrome.cast.media.LoadRequest(castMediaInfo);

      browserDebugLog('🎬 Loading standard media:', {
        contentId: mediaInfo.contentId,
        contentType: mediaInfo.contentType,
        title: mediaInfo.metadata.title,
      });

      session.loadMedia(
        request,
        (media: chrome.cast.media.Media) => {
          browserDebugLog('✅ Standard media loaded successfully:', media);

          if (this.currentSession) {
            this.currentSession.mediaSessionId = media.sessionId;
            this.currentSession.state = 'connected';
            this.currentSession.lastSyncAt = new Date();
            this.notifySessionStateChange(this.currentSession);
          }

          resolve();
        },
        (error: chrome.cast.Error) => {
          const errorMessage = error?.description || 'Unknown error';
          console.error('❌ Failed to load standard media:', error);

          this.notifyError({
            code: error?.code || 'MEDIA_LOAD_FAILED',
            description: `Failed to cast media: ${errorMessage}`,
            details: error,
          });

          reject(new Error(`Failed to cast media: ${errorMessage}`));
        },
      );
    });

    if (err) {
      console.error('Error loading standard media:', err);
      reject(err);
    }
  }

  async updateQueue(queue: PlaylistItem[]): Promise<void> {
    if (this.currentSession?.state !== 'connected') {
      return;
    }

    const queueMessage = {
      action: 'updateQueue',
      queue,
      timestamp: Date.now(),
    };

    if (this.localEmulator.isLocalEmulator(this.currentSession.deviceId)) {
      this.localEmulator.sendLocalMessage(queueMessage as LocalCastMessage);

      return;
    }

    const session = this.actualCastSession;

    if (!session) return;

    const [err] = safeWrap(() => {
      browserDebugLog('[Cast] updateQueue send', {
        count: queueMessage.queue.length,
        timestamp: queueMessage.timestamp,
      });
      session.sendMessage(
        CUSTOM_NAMESPACE,
        queueMessage,
        () => browserDebugLog('✅ Queue update sent to receiver'),
        (error: chrome.cast.Error) =>
          console.error('❌ Failed to update queue:', error),
      );
    });

    if (err) {
      console.error('Error updating queue:', err);
      this.notifyError({
        code: 'QUEUE_UPDATE_FAILED',
        description: 'Failed to update queue on cast device',
        details: err,
      });
    }
  }

  async updateRoomInfo(roomInfo: CastRoomInfo): Promise<void> {
    if (this.currentSession?.state !== 'connected') {
      return;
    }

    const message: LocalCastMessage = {
      action: 'updateRoomInfo',
      roomInfo: roomInfo,
      timestamp: Date.now(),
    };

    if (this.localEmulator.isLocalEmulator(this.currentSession.deviceId)) {
      this.localEmulator.sendLocalMessage(message);

      return;
    }

    const session = this.actualCastSession;

    if (!session) return;

    const [err] = safeWrap(() => {
      browserDebugLog('[Cast] updateRoomInfo send', message);
      session.sendMessage(
        CUSTOM_NAMESPACE,
        message,
        () => browserDebugLog('✅ Room info sent to receiver'),
        (error: chrome.cast.Error) =>
          console.error('❌ Failed to update room info:', error),
      );
    });

    if (err) {
      console.error('Error updating room info:', err);
      this.notifyError({
        code: 'ROOM_UPDATE_FAILED',
        description: 'Failed to update room info on cast device',
        details: err,
      });
    }
  }

  async syncPlaybackState(state: PlaybackStateV2): Promise<void> {
    if (this.currentSession?.state !== 'connected') {
      return;
    }

    const message = {
      action: 'syncPlayback',
      isPlaying: state.isPlaying,
      positionMs: state.positionMs,
      currentSong: state.currentPlaylistItem,
      updatedAt: state.updatedAt,
      serverTimeMs: state.serverTimeMs,
      timestamp: Date.now(),
    };

    if (this.localEmulator.isLocalEmulator(this.currentSession.deviceId)) {
      this.localEmulator.sendLocalMessage(message as LocalCastMessage);

      return;
    }

    const session = this.actualCastSession;

    if (!session) return;

    const [err] = safeWrap(() => {
      browserDebugLog('[Cast] syncPlayback send', {
        isPlaying: message.isPlaying,
        positionMs: message.positionMs,
        title: message.currentSong?.title,
        timestamp: message.timestamp,
      });
      session.sendMessage(
        CUSTOM_NAMESPACE,
        message,
        () => browserDebugLog('✅ Playback sync sent to receiver'),
        (error: chrome.cast.Error) =>
          console.error('❌ Failed to sync playback:', error),
      );
    });

    if (err) {
      console.error('Error syncing playback state:', err);
      this.notifyError({
        code: 'SYNC_FAILED',
        description: 'Failed to synchronize playback state with cast device',
        details: err,
      });
    }
  }

  async joinRoom(roomId: string, castToken: string): Promise<void> {
    if (!this.currentSession) return;

    this.roomCredentials = { castToken, roomId };

    const casterId = this.localEmulator.getCasterIdFromContext() || undefined;
    const message = {
      action: 'joinRoom',
      roomId,
      castToken,
      casterId,
      sessionId: casterId,
      theme: useThemeStore.getState().resolvedTheme,
      timestamp: Date.now(),
    };

    if (this.localEmulator.isLocalEmulator(this.currentSession.deviceId)) {
      this.localEmulator.sendLocalMessage(message as LocalCastMessage);

      return;
    }

    const session = this.actualCastSession;

    if (!session) return;

    return new Promise((resolve, reject) => {
      browserDebugLog('[Cast] sending joinRoom message', message);

      const [err] = safeWrap(() => {
        session.sendMessage(
          CUSTOM_NAMESPACE,
          message,
          () => {
            browserDebugLog('✅ joinRoom message sent');
            resolve();
          },
          (error: chrome.cast.Error) => {
            console.error('Failed to send joinRoom message:', error);
            reject(error);
          },
        );
      });

      if (err) reject(err);
    });
  }

  async updateTheme(theme: ResolvedColorScheme): Promise<void> {
    if (!this.currentSession) return;

    const message: LocalCastMessage = {
      action: 'updateTheme',
      theme,
      timestamp: Date.now(),
    };

    if (this.localEmulator.isLocalEmulator(this.currentSession.deviceId)) {
      this.localEmulator.sendLocalMessage(message);

      return;
    }

    const session = this.actualCastSession;

    if (!session) return;

    return new Promise((resolve, reject) => {
      const [err] = safeWrap(() => {
        session.sendMessage(
          CUSTOM_NAMESPACE,
          message,
          resolve,
          (error: chrome.cast.Error) => reject(error),
        );
      });

      if (err) reject(err);
    });
  }

  // ============================================================
  // Event Handling
  // ============================================================

  onDeviceAvailable(callback: (device: CastDevice) => void): void {
    this.eventBus.onDeviceAvailable(callback);
  }

  onSessionStateChange(callback: (session: CastSession) => void): void {
    this.eventBus.onSessionStateChange(callback);
  }

  onCastError(callback: (error: CastError) => void): void {
    this.eventBus.onCastError(callback);
  }

  private notifyDeviceAvailable(device: CastDevice): void {
    this.eventBus.notifyDeviceAvailable(device);
  }

  private notifySessionStateChange(session: CastSession): void {
    this.eventBus.notifySessionStateChange(session);
  }

  private notifyError(error: CastError): void {
    this.eventBus.notifyError(error);
  }

  // ============================================================
  // Utility Methods
  // ============================================================

  getCurrentSession(): CastSession | null {
    return this.currentSession;
  }

  isConnected(): boolean {
    return this.currentSession?.state === 'connected';
  }

  getConnectionState(): CastSessionState | null {
    return this.currentSession?.state || null;
  }

  private isYouTubeUrl(url: string): boolean {
    return url.includes('youtube.com') || url.includes('youtu.be');
  }

  getDebugInfo(): {
    sdkLoaded: boolean;
    sdkAvailable: boolean;
    apiVersion: string | undefined;
    receiverAvailability: string | undefined;
    devices: CastDevice[];
    currentSession: CastSession | null;
    isInitialized: boolean;
  } {
    return {
      sdkLoaded: !!window.chrome?.cast,
      sdkAvailable: !!window.chrome?.cast?.isAvailable,
      apiVersion: window.chrome?.cast?.VERSION?.join('.'),
      receiverAvailability: undefined,
      devices: this.devices,
      currentSession: this.currentSession,
      isInitialized: this.isInitialized,
    };
  }

  async forceDiscovery(): Promise<void> {
    browserDebugLog('🔍 Forcing device discovery...');
    const [err] = await safeWrapAsync(this.initializeCastSDK());

    if (err) {
      console.error('Failed to initialize SDK during force discovery:', err);

      return;
    }

    if (LOCAL_EMULATOR_ENABLED) {
      this.localEmulator.ensureLocalEmulatorDevice();
    }

    browserDebugLog('Current devices:', this.devices);
  }

  destroy(): void {
    this.localEmulator.destroy();
    this.eventBus.removeAllListeners();

    if (this.castContext) {
      this.castContext.endCurrentSession(true);
      this.castContext.removeEventListener(
        cast.framework.CastContextEventType.CAST_STATE_CHANGED,
        this.handleCastState,
      );
      this.castContext.removeEventListener(
        cast.framework.CastContextEventType.SESSION_STATE_CHANGED,
        this.handleSessionState,
      );
      this.castContext = null;
    }
    this.detachSessionMessages();

    this.currentSession = null;
    this.actualCastSession = null;
    this.devices = [];
    this.isInitialized = false;
    this.initializationPromise = null;
  }
}

// Export singleton instance
export const castManager = new GoogleCastManager();

const castSenderScriptUrl =
  'https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1';
