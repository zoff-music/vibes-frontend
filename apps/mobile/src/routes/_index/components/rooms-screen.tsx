import type { PublicRoom, PublicRoomResult } from '@vibes/models';
import {
  generatedPlaylistPromptMaxLength,
  roomNameMaxLength,
} from '@vibes/models';
import { useFetcher, useRouteLoaderData } from '@vibes/native-router';
import { classNames } from '@vibes/shared';
import { NativeLandingSun } from '@vibes/ui/native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Image,
  Keyboard,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import zoffLogo from '@/assets/images/splash-icon.png';
import {
  Button,
  Card,
  Copy,
  Field,
  Heading,
  Screen,
} from '@/components/native';
import {
  ScrollEdgeFades,
  useScrollEdgeFades,
} from '@/components/scroll-edge-fades';
import { ZoffIcon } from '@/components/zoff-icon';
import { mobileRoomPageSize } from '@/constants/public-rooms';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useLandingPlaceholder } from '@/hooks/use-landing-placeholder';
import { useRoomActions, useRoomSession } from '@/providers/app-provider';
import { useKonamiMode } from '@/providers/konami-mode-provider';
import type { DiscoveryData } from '@/routes/_index/loader';
import type { CreateRoomActionData } from '@/routes/rooms.create/action';
import { CreateRoomSheet } from './create-room-sheet';
import { RoomScreen } from './room-screen';
import { TerminalRoomsHome } from './terminal-rooms-home';

export function RoomsScreen() {
  const searchParams = useLocalSearchParams<{ roomId?: string | string[] }>();
  const router = useRouter();
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const { enabled: konamiEnabled } = useKonamiMode();
  const { controllerRemote, loading, providers, room, roomId } =
    useRoomSession();
  const { setError, setRoomId, startGeneratedRoom } = useRoomActions();
  const discovery = useRouteLoaderData<DiscoveryData>('_index');
  const [, discoveryFetcher] = useFetcher<DiscoveryData>({ routeId: '_index' });
  const [, createRoomFetcher] = useFetcher<CreateRoomActionData>({
    routeId: 'rooms.create',
  });
  const submitCreateRoom = createRoomFetcher.submit;
  const [value, setValue] = useState(roomId);
  const [discoveryData, setDiscoveryData] = useState(discovery);
  const [browseMode, setBrowseMode] = useState('live');
  const [browseResult, setBrowseResult] = useState<PublicRoomResult | null>(
    null,
  );
  const [browseQuery, setBrowseQuery] = useState('');
  const [browseError, setBrowseError] = useState('');
  const [browsing, setBrowsing] = useState(false);
  const browseRequest = useRef(0);
  const landingScroll = useRef<ScrollView>(null);
  const [, roomBrowser] = useFetcher<PublicRoomResult>({
    routeId: 'rooms.public',
  });
  const publicRooms =
    browseMode === 'live'
      ? (discoveryData?.publicRooms ?? [])
      : (browseResult?.rooms ?? []);
  const loadRooms = async (mode: string, from = 0, q = browseQuery) => {
    Keyboard.dismiss();
    const requestId = ++browseRequest.current;
    setBrowseMode(mode);
    landingScroll.current?.scrollTo({ y: 0, animated: false });
    setBrowseQuery(q);
    if (mode === 'live') {
      setBrowsing(false);
      setBrowseError('');
      return;
    }
    setBrowsing(true);
    const result = await roomBrowser.load({
      params: { live: String(mode === 'live'), from: String(from), q },
    });
    if (requestId !== browseRequest.current) return;
    setBrowseResult(result.data);
    landingScroll.current?.scrollTo({ y: 0, animated: false });
    setBrowseError(result.error);
    setBrowsing(false);
  };
  const [createVisible, setCreateVisible] = useState(false);
  const [isAIMode, setIsAIMode] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const placeholder = useLandingPlaceholder(
    isAIMode,
    !inputFocused &&
      !value &&
      !room &&
      !loading &&
      !konamiEnabled &&
      browseMode === 'live',
  );
  const [generationLoading, setGenerationLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const consumedRoomLinkRef = useRef('');
  const hadRoomRef = useRef(Boolean(room && roomId));
  const refreshLogoOpacity = useSharedValue(0);
  const refreshLogoRotation = useSharedValue(0);
  const refreshLogoTranslateY = useSharedValue(-56);

  useEffect(() => setValue(roomId), [roomId]);
  useEffect(() => {
    setDiscoveryData(discovery);
  }, [discovery]);

  const refreshDiscovery = useCallback(async () => {
    setRefreshing(true);
    const [result] = await Promise.all([
      discoveryFetcher.load(),
      waitForMinimumRefreshSpin(),
    ]);
    if (result.data) {
      setDiscoveryData(result.data);
      setBrowseResult(null);
      setBrowseMode('live');
      setBrowseQuery('');
    }
    setRefreshing(false);
  }, [discoveryFetcher]);

  useEffect(() => {
    const hasRoom = Boolean(room && roomId);
    const leftRoom = hadRoomRef.current && !hasRoom;
    hadRoomRef.current = hasRoom;
    if (leftRoom) void refreshDiscovery();
  }, [refreshDiscovery, room, roomId]);

  useEffect(() => {
    if (refreshing) {
      refreshLogoOpacity.value = withTiming(1, { duration: 120 });
      refreshLogoTranslateY.value = withTiming(0, { duration: 140 });
      refreshLogoRotation.value = withRepeat(
        withTiming(refreshLogoRotation.value + 360, {
          duration: refreshLogoRotationDurationMs,
          easing: Easing.linear,
        }),
        -1,
      );
      return;
    }

    cancelAnimation(refreshLogoRotation);
    refreshLogoOpacity.value = withTiming(0, { duration: 180 });
    refreshLogoTranslateY.value = withTiming(-56, { duration: 220 });
  }, [
    refreshLogoOpacity,
    refreshLogoRotation,
    refreshLogoTranslateY,
    refreshing,
  ]);

  const refreshLogoStyle = useAnimatedStyle(() => ({
    opacity: refreshLogoOpacity.value,
    transform: [
      { translateY: refreshLogoTranslateY.value },
      { rotate: `${refreshLogoRotation.value}deg` },
    ],
  }));

  const refreshLogo = (
    <View
      className="pointer-events-none absolute right-0 left-0 z-40 items-center"
      style={{ top: insets.top + refreshLogoTopSpacing }}
    >
      <Animated.Image
        className="size-12 rounded-full"
        source={zoffLogo}
        style={refreshLogoStyle}
      />
    </View>
  );

  const refreshControl = (
    <RefreshControl
      colors={['transparent']}
      progressBackgroundColor="transparent"
      refreshing={refreshing}
      tintColor="transparent"
      onRefresh={() => void refreshDiscovery()}
    />
  );

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (refreshing) return;
    const pullDistance = Math.min(
      Math.max(-event.nativeEvent.contentOffset.y, 0),
      refreshPullDistance,
    );
    const pullProgress = pullDistance / refreshPullDistance;
    refreshLogoOpacity.value = pullProgress;
    refreshLogoRotation.value = pullProgress * refreshPullRotation;
    refreshLogoTranslateY.value =
      -refreshLogoHiddenOffset + pullProgress * refreshLogoHiddenOffset;
  };

  const scrollEdgeFades = useScrollEdgeFades({ onScroll: handleScroll });

  const joinRoom = useCallback(
    async (roomName: string) => {
      if (!roomName.trim()) {
        setError('Enter a room name.');
        return;
      }
      if (controllerRemote) {
        setError(
          'Disconnect the active remote before joining a room on this device.',
        );
        return;
      }
      const result = await setRoomId(roomName);
      if (result === 'joined') {
        Keyboard.dismiss();
        return;
      }
      if (result === 'notFound') {
        setError('');
        setCreateVisible(true);
      }
    },
    [controllerRemote, setError, setRoomId],
  );

  useEffect(() => {
    const linkedRoomId = Array.isArray(searchParams.roomId)
      ? searchParams.roomId[0]
      : searchParams.roomId;
    if (!linkedRoomId || consumedRoomLinkRef.current === linkedRoomId) return;

    consumedRoomLinkRef.current = linkedRoomId;
    setValue(linkedRoomId);
    void joinRoom(linkedRoomId).finally(() => router.replace('/'));
  }, [joinRoom, router, searchParams.roomId]);

  const submitRoom = () => {
    if (controllerRemote) {
      setError(
        'Disconnect the active remote before joining or creating a room.',
      );
      return;
    }
    if (isAIMode) {
      void generateRoom();
      return;
    }
    if (!value.trim()) {
      setCreateVisible(true);
      return;
    }
    void joinRoom(value);
  };

  const generateRoom = async () => {
    if (controllerRemote) {
      setError(
        'Disconnect the active remote before generating a room on this device.',
      );
      return;
    }
    const prompt = value.trim();
    if (!prompt) {
      setError('Describe the playlist you want.');
      return;
    }
    setGenerationLoading(true);
    const result = await submitCreateRoom({
      intent: 'generate',
      prompt,
    });
    setGenerationLoading(false);
    if (result.data?.intent !== 'generated') {
      setError(result.error || 'Could not start playlist generation.');
      return;
    }
    Keyboard.dismiss();
    await startGeneratedRoom(result.data.roomId);
  };

  const toggleAIMode = () => {
    setIsAIMode((current) => !current);
    setValue('');
    setError('');
  };

  const handleCreated = async (roomName: string, roomPassword: string) => {
    const result = await setRoomId(roomName, roomPassword);
    if (result !== 'joined') return false;
    Keyboard.dismiss();
    return true;
  };

  const renderPublicRoom = (item: PublicRoom, index: number) => {
    return (
      <Animated.View
        className="w-full min-w-0"
        entering={FadeInDown.duration(180).delay(index * 35)}
        key={item.id}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Join ${item.name}`}
          className="w-full flex-row items-center gap-4 rounded-2xl border border-mobile-border bg-mobile-card p-5 active:opacity-70 dark:border-mobile-dark-border dark:bg-mobile-dark-card"
          onPress={() => {
            setValue(item.id);
            void joinRoom(item.id);
          }}
        >
          <View className="min-w-0 flex-1 gap-1">
            <Text
              numberOfLines={1}
              className="font-heading text-lg text-mobile-text dark:text-mobile-dark-text"
            >
              {item.name}
            </Text>
            <Text className="font-heading text-mobile-muted text-sm dark:text-mobile-dark-muted">
              {item.listenerCount} listening · {item.songCount} songs
            </Text>
          </View>
          <Text className="font-heading text-accent text-xl">→</Text>
        </Pressable>
      </Animated.View>
    );
  };

  if (room && roomId) {
    return <RoomScreen />;
  }

  let submitLabel = value.trim() ? 'Join room' : 'Create a room';
  if (isAIMode) {
    submitLabel = generationLoading
      ? 'Generating playlist…'
      : 'Generate playlist';
  }
  if (loading) {
    submitLabel = 'Checking room…';
  }

  if (konamiEnabled) {
    return (
      <TerminalRoomsHome
        generationLoading={generationLoading}
        isAIMode={isAIMode}
        loading={loading}
        providers={providers}
        publicRooms={publicRooms}
        refreshControl={refreshControl}
        refreshLogo={refreshLogo}
        submitLabel={submitLabel}
        value={value}
        onChangeValue={(nextValue) => {
          setValue(nextValue);
          setError('');
        }}
        onJoinRoom={(roomName) => {
          setValue(roomName);
          void joinRoom(roomName);
        }}
        onScroll={handleScroll}
        onSubmit={submitRoom}
        onToggleAIMode={toggleAIMode}
      />
    );
  }

  return (
    <Screen>
      <SafeAreaView edges={['top']} style={safeAreaStyle}>
        {refreshLogo}
        <View className="flex-1">
          <ScrollView
            ref={landingScroll}
            contentContainerClassName={classNames(
              'grow px-5 pt-5 pb-32 md:py-12',
              browseMode === 'live' && 'md:justify-center',
            )}
            keyboardShouldPersistTaps="handled"
            onContentSizeChange={scrollEdgeFades.onContentSizeChange}
            onLayout={scrollEdgeFades.onLayout}
            onScroll={scrollEdgeFades.onScroll}
            refreshControl={refreshControl}
            scrollEventThrottle={16}
          >
            <View className="mx-auto w-full max-w-3xl">
              <Animated.View className="gap-8" entering={FadeIn.duration(180)}>
                <View className="flex-row items-center gap-4 py-2">
                  <Image
                    source={zoffLogo}
                    accessibilityLabel="Zoff"
                    className="size-20"
                  />
                  <View className="gap-1">
                    <Text className="font-heading text-4xl text-mobile-text dark:text-mobile-dark-text">
                      Zoff
                    </Text>
                    <Text className="font-heading text-mobile-muted text-sm dark:text-mobile-dark-muted">
                      Your rooms. Your music.
                    </Text>
                  </View>
                </View>
                <View className="gap-8">
                  <View className="w-full">
                    <NativeLandingSun />
                    <Card className="gap-6 rounded-3xl p-6">
                      <View className="gap-1">
                        <Heading>
                          {isAIMode ? 'Set the ' : 'Listen to music '}
                          <Text className="text-primary">
                            {isAIMode ? 'mood.' : 'together.'}
                          </Text>
                        </Heading>
                      </View>
                      <View className="gap-2">
                        <Field
                          accessibilityLabel={
                            isAIMode ? 'Playlist prompt' : 'Room name'
                          }
                          autoCapitalize="none"
                          onFocus={() => setInputFocused(true)}
                          onBlur={() => setInputFocused(false)}
                          value={value}
                          onChangeText={(nextValue) => {
                            setValue(nextValue);
                            setError('');
                          }}
                          onSubmitEditing={submitRoom}
                          maxLength={
                            isAIMode
                              ? generatedPlaylistPromptMaxLength
                              : roomNameMaxLength
                          }
                          placeholder={placeholder}
                          trailingAction={
                            <Pressable
                              accessibilityLabel={
                                isAIMode
                                  ? 'Turn off AI mode'
                                  : 'Generate with AI'
                              }
                              accessibilityRole="switch"
                              accessibilityState={{ checked: isAIMode }}
                              className={classNames(
                                'size-11 items-center justify-center rounded-xl border active:opacity-70',
                                isAIMode && 'border-accent bg-accent',
                                !isAIMode &&
                                  'border-mobile-border bg-mobile-card dark:border-mobile-dark-border dark:bg-mobile-dark-card',
                              )}
                              onPress={toggleAIMode}
                            >
                              <ZoffIcon
                                color={isAIMode ? '#ffffff' : theme.text}
                                name="sparkles"
                                size={22}
                              />
                            </Pressable>
                          }
                        />
                      </View>
                      <Button
                        disabled={loading || generationLoading}
                        label={submitLabel}
                        onPress={submitRoom}
                      />
                    </Card>
                  </View>
                  <View className="w-full gap-4">
                    <View
                      accessibilityRole="tablist"
                      className="flex-row gap-2 border-mobile-border border-b pb-3 dark:border-mobile-dark-border"
                    >
                      {['live', 'public'].map((mode) => (
                        <Pressable
                          key={mode}
                          accessibilityRole="tab"
                          accessibilityState={{ selected: browseMode === mode }}
                          onPress={() => void loadRooms(mode, 0, '')}
                          className={classNames(
                            'min-h-11 flex-1 flex-row items-center justify-center gap-2 rounded-xl border bg-mobile-card dark:bg-mobile-dark-card',
                            browseMode === mode
                              ? 'border-accent'
                              : 'border-transparent',
                          )}
                        >
                          {mode === 'live' && (
                            <View className="size-2 rounded-full bg-accent" />
                          )}
                          <Text className="font-heading text-mobile-text dark:text-mobile-dark-text">
                            {mode === 'live' ? 'Live rooms' : 'Browse'}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                    {browseMode !== 'live' && (
                      <>
                        <Field
                          value={browseQuery}
                          onChangeText={setBrowseQuery}
                          placeholder="Search rooms by name"
                          accessibilityLabel="Search rooms by name"
                          onSubmitEditing={() => void loadRooms(browseMode)}
                        />
                        <Button
                          label="Search rooms"
                          tone="secondary"
                          disabled={browsing}
                          onPress={() => void loadRooms(browseMode)}
                        />
                      </>
                    )}
                    {browsing && <Copy muted>Loading rooms…</Copy>}
                    {Boolean(browseError) && <Copy muted>{browseError}</Copy>}
                    <View className="flex-row flex-wrap gap-3">
                      {publicRooms.map(renderPublicRoom)}
                      {publicRooms.length === 0 && (
                        <View className="w-full rounded-3xl border border-mobile-border bg-mobile-card/70 px-5 py-6 dark:border-mobile-dark-border dark:bg-mobile-dark-card/70">
                          <Copy muted>
                            {browseMode === 'live'
                              ? 'No rooms are live. Browse public rooms or start your own.'
                              : 'No public rooms found. Try another name.'}
                          </Copy>
                        </View>
                      )}
                    </View>
                    {browseMode !== 'live' &&
                      browseResult &&
                      browseResult.total > 0 && (
                        <View className="flex-row items-center justify-between gap-2">
                          <Button
                            label="Previous"
                            tone="secondary"
                            disabled={browsing || browseResult.from === 0}
                            onPress={() =>
                              void loadRooms(
                                browseMode,
                                Math.max(
                                  0,
                                  browseResult.from - mobileRoomPageSize,
                                ),
                              )
                            }
                          />
                          <Copy muted>
                            {Math.floor(
                              browseResult.from / mobileRoomPageSize,
                            ) + 1}{' '}
                            /{' '}
                            {Math.ceil(browseResult.total / mobileRoomPageSize)}
                          </Copy>
                          <Button
                            label="Next"
                            tone="secondary"
                            disabled={
                              browsing ||
                              browseResult.to + 1 >= browseResult.total
                            }
                            onPress={() =>
                              void loadRooms(
                                browseMode,
                                browseResult.from + mobileRoomPageSize,
                              )
                            }
                          />
                        </View>
                      )}
                  </View>
                </View>
              </Animated.View>
            </View>
          </ScrollView>
          <ScrollEdgeFades
            backgroundColor={theme.background}
            bottomVisible={scrollEdgeFades.bottomVisible}
            topVisible={scrollEdgeFades.topVisible}
          />
        </View>
        <CreateRoomSheet
          initialName={value}
          providers={providers}
          visible={createVisible}
          onClose={() => setCreateVisible(false)}
          onCreated={handleCreated}
        />
      </SafeAreaView>
    </Screen>
  );
}

const refreshLogoRotationDurationMs = 1200;
const minimumRefreshSpinDurationMs = refreshLogoRotationDurationMs + 200;

function waitForMinimumRefreshSpin(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, minimumRefreshSpinDurationMs);
  });
}
const refreshLogoHiddenOffset = 56;
const refreshLogoTopSpacing = 12;
const refreshPullDistance = 80;
const refreshPullRotation = 160;
const safeAreaStyle = { flex: 1 };
