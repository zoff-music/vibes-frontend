import {
  generatedPlaylistPromptMaxLength,
  type PublicRoomResultV3,
  type PublicRoomV3,
  type RoomType,
  roomNameMaxLength,
} from '@vibes/models';
import { classNames } from '@vibes/shared';
import { useMutation, useRequest } from '@vibes/shared/use-request';
import {
  NativeButton,
  NativeGenerativeFrame,
  NativeGenerativeInvitation,
  NativeLandingSun,
  NativePressable as Pressable,
} from '@vibes/ui/native';
import { getRoomLabels } from '@vibes/ui/shared';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Image,
  Keyboard,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  RefreshControl,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedRef,
  useAnimatedStyle,
  useScrollOffset,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import zoffLogo from '@/assets/images/splash-icon.png';
import { Button, Copy, Field, Screen } from '@/components/native';
import { ScreenSafeArea as SafeAreaView } from '@/components/screen-safe-area';
import {
  ScrollEdgeFades,
  useScrollEdgeFades,
} from '@/components/scroll-edge-fades';
import { ZoffIcon } from '@/components/zoff-icon';
import { mobileRoomPageSize } from '@/constants/public-rooms';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useGenerativeMotion } from '@/hooks/use-generative-motion';
import { useLandingPlaceholder } from '@/hooks/use-landing-placeholder';
import { useRoomActions, useRoomSession } from '@/providers/app-provider';
import { useInitialData } from '@/providers/initial-data-provider';
import { loadDiscovery } from '@/requests/load-discovery';
import { loadPublicRooms } from '@/requests/load-public-rooms';
import { updateRoomCreation } from '@/requests/update-room-creation';
import { CreateRoomSheet } from './create-room-sheet';
import { RoomScreen } from './room-screen';

export function RoomsScreen() {
  const searchParams = useLocalSearchParams<{
    roomId?: string | string[];
  }>();
  const router = useRouter();
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const { controllerRemote, loading, providers, room, roomId } =
    useRoomSession();
  const { setError, setRoomId, startGeneratedRoom } = useRoomActions();
  const discovery = useInitialData().discovery;
  const [, discoveryFetcherLoad] = useRequest(loadDiscovery);
  const [, submitCreateRoom] = useMutation(updateRoomCreation);
  const [value, setValue] = useState(roomId);
  const [roomType, setRoomType] = useState<RoomType>('MUSIC');
  const watch = roomType === 'WATCH';
  const availableProviders = useMemo(
    () => providers.filter((provider) => !watch || provider === 'youtube'),
    [providers, watch],
  );
  const [discoveryData, setDiscoveryData] = useState(discovery);
  const [browseMode, setBrowseMode] = useState('live');
  const [browseResult, setBrowseResult] = useState<PublicRoomResultV3 | null>(
    null,
  );
  const [browseQuery, setBrowseQuery] = useState('');
  const [browseError, setBrowseError] = useState('');
  const [browsing, setBrowsing] = useState(false);
  const browseRequest = useRef(0);
  const landingScroll = useAnimatedRef<ScrollView>();
  const landingContent = useRef<View>(null);
  const landingContentTop = useRef(0);
  const browseSection = useRef<View>(null);
  const browseScrollPending = useRef(false);
  const alignBrowser = () => {
    if (!browseScrollPending.current || !landingContent.current) return;
    browseSection.current?.measureLayout(landingContent.current, (_x, y) => {
      browseScrollPending.current = false;
      landingScroll.current?.scrollTo({
        y: y + landingContentTop.current,
        animated: true,
      });
    });
  };
  const landingOffset = useScrollOffset(landingScroll);
  const landingPosition = useAnimatedStyle(() => ({
    transform: [{ translateY: Math.min(landingOffset.value, 0) }],
  }));
  const [, roomBrowserLoad] = useRequest(loadPublicRooms);
  const publicRooms =
    browseMode === 'live'
      ? (discoveryData?.publicRooms ?? [])
      : (browseResult?.rooms ?? []);
  const loadRooms = async (mode: string, from = 0, q = browseQuery) => {
    Keyboard.dismiss();
    const requestId = ++browseRequest.current;
    setBrowseMode(mode);
    browseScrollPending.current = mode === 'public';
    setBrowseQuery(q);

    if (mode === 'live') {
      setBrowsing(false);
      setBrowseError('');

      return;
    }

    setBrowsing(true);
    const result = await roomBrowserLoad({
      params: {
        live: String(mode === 'live'),
        from: String(from),
        q,
        roomType,
      },
    });

    if (requestId !== browseRequest.current) return;

    setBrowseResult(result.data);
    setBrowseError(result.error);
    setBrowsing(false);
  };
  const [createVisible, setCreateVisible] = useState(false);
  const [isAIMode, setIsAIMode] = useState(false);
  const [generationDiscovered, setGenerationDiscovered] = useState(false);
  const generativeMotion = useGenerativeMotion();
  const [inputFocused, setInputFocused] = useState(false);
  const placeholder = useLandingPlaceholder(
    isAIMode,
    !inputFocused && !value && !room && !loading && browseMode === 'live',
    watch,
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
    if (roomType === 'MUSIC') setDiscoveryData(discovery);
  }, [discovery, roomType]);

  const refreshDiscovery = useCallback(async () => {
    const requestId = ++browseRequest.current;
    setRefreshing(true);
    const [result] = await Promise.all([
      discoveryFetcherLoad({
        params: {
          roomType,
        },
      }),
      waitForMinimumRefreshSpin(),
    ]);

    if (requestId !== browseRequest.current) return;

    if (result.data) {
      setDiscoveryData(result.data);
      setBrowseResult(null);
      setBrowseMode('live');
      setBrowseQuery('');
    }

    setRefreshing(false);
  }, [roomType, discoveryFetcherLoad]);

  const changeRoomType = async (nextType: RoomType) => {
    if (nextType === roomType) return;

    const requestId = ++browseRequest.current;
    setRefreshing(false);
    setRoomType(nextType);
    setValue('');
    setError('');
    setBrowseMode('live');
    setBrowseQuery('');
    setBrowseResult(null);
    setDiscoveryData(null);
    setBrowsing(true);
    const result = await discoveryFetcherLoad({
      params: {
        roomType: nextType,
      },
    });

    if (requestId !== browseRequest.current) return;

    setDiscoveryData(result.data);
    setBrowseError(result.error);
    setBrowsing(false);
  };

  useEffect(() => {
    const hasRoom = Boolean(room && roomId);
    const leftRoom = hadRoomRef.current && !hasRoom;
    hadRoomRef.current = hasRoom;

    if (leftRoom) void refreshDiscovery();
  }, [refreshDiscovery, room, roomId]);

  useEffect(() => {
    if (refreshing) {
      refreshLogoOpacity.value = withTiming(1, {
        duration: 120,
      });
      refreshLogoTranslateY.value = withTiming(0, {
        duration: 140,
      });
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
    refreshLogoOpacity.value = withTiming(0, {
      duration: 180,
    });
    refreshLogoTranslateY.value = withTiming(-56, {
      duration: 220,
    });
  }, [
    refreshLogoOpacity,
    refreshLogoRotation,
    refreshLogoTranslateY,
    refreshing,
  ]);

  const refreshLogoStyle = useAnimatedStyle(() => ({
    opacity: refreshLogoOpacity.value,
    transform: [
      {
        translateY: refreshLogoTranslateY.value,
      },
      {
        rotate: `${refreshLogoRotation.value}deg`,
      },
    ],
  }));

  const refreshLogo = (
    <View
      className="pointer-events-none absolute right-0 left-0 z-40 items-center"
      style={{
        top: insets.top + refreshLogoTopSpacing,
      }}
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
  const scrollEdgeFades = useScrollEdgeFades({
    onScroll: handleScroll,
  });
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
      roomType,
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

  const renderPublicRoom = (item: PublicRoomV3) => {
    return (
      <View className="w-full min-w-0" key={item.id}>
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
              className="font-heading text-mobile-text text-xl dark:text-mobile-dark-text"
            >
              {item.name}
            </Text>
            <Text className="font-heading text-base text-mobile-muted dark:text-mobile-dark-muted">
              {item.listenerCount} {getRoomLabels(item.roomType).activity} ·{' '}
              {item.playlistItemCount} {getRoomLabels(item.roomType).items}
            </Text>
          </View>
          <Text className="shrink-0 font-heading text-accent text-lg">
            Join →
          </Text>
        </Pressable>
      </View>
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

  return (
    <Screen>
      <SafeAreaView edges={['top']} style={safeAreaStyle}>
        {refreshLogo}
        <View className="flex-1">
          <Animated.ScrollView
            contentInsetAdjustmentBehavior="never"
            ref={landingScroll}
            contentContainerClassName={classNames(
              'grow px-6 pt-4 pb-32 md:py-12',
              browseMode === 'live' && 'md:justify-center',
            )}
            keyboardShouldPersistTaps="handled"
            onContentSizeChange={(width, contentHeight) => {
              scrollEdgeFades.onContentSizeChange(width, contentHeight);
              alignBrowser();
            }}
            onLayout={scrollEdgeFades.onLayout}
            onScroll={scrollEdgeFades.onScroll}
            refreshControl={refreshControl}
            scrollEventThrottle={16}
          >
            <Animated.View
              ref={landingContent}
              onLayout={(event) => {
                landingContentTop.current = event.nativeEvent.layout.y;
                alignBrowser();
              }}
              collapsable={false}
              className="mx-auto w-full max-w-xl"
              style={landingPosition}
            >
              <View className="gap-7">
                <View className="flex-row items-center gap-4 py-2">
                  <Image
                    source={zoffLogo}
                    accessibilityLabel="Zoff"
                    className="size-16"
                  />

                  <View className="gap-1">
                    <Text className="font-heading text-4xl text-mobile-text dark:text-mobile-dark-text">
                      Zoff
                    </Text>
                    <Text className="font-heading text-mobile-muted text-sm dark:text-mobile-dark-muted">
                      Shared rooms
                    </Text>
                  </View>
                </View>
                <View
                  accessibilityRole="tablist"
                  className="flex-row gap-2 self-center rounded-full border border-mobile-border bg-mobile-card p-1 dark:border-mobile-dark-border dark:bg-mobile-dark-card"
                >
                  {roomTypes.map((type) => (
                    <Pressable
                      key={type}
                      accessibilityRole="tab"
                      accessibilityState={{
                        selected: roomType === type,
                      }}
                      disabled={generationLoading}
                      onPress={() => void changeRoomType(type)}
                      className={classNames(
                        'min-h-12 min-w-32 flex-row items-center justify-center gap-2 rounded-full border px-5',
                        roomType === type
                          ? 'border-accent bg-mobile-background dark:bg-mobile-dark-background'
                          : 'border-transparent',
                      )}
                    >
                      {roomType === type && (
                        <View className="size-2 rounded-full bg-accent" />
                      )}
                      <Text className="font-heading text-lg text-mobile-text dark:text-mobile-dark-text">
                        {type === 'WATCH' ? 'Watch' : 'Music'}
                      </Text>
                    </Pressable>
                  ))}
                </View>
                <View className="gap-8">
                  <View className="w-full">
                    <NativeLandingSun watch={watch} />
                    <View className="gap-6">
                      <View className="gap-3">
                        <Text
                          accessibilityRole="header"
                          className="text-center font-heading text-4xl text-mobile-text leading-tight md:text-5xl dark:text-mobile-dark-text"
                        >
                          {watch ? 'Watch ' : 'Listen to music '}
                          {'\n'}
                          <Text className="text-primary">together.</Text>
                        </Text>
                        <Text className="text-center font-heading text-base text-mobile-muted dark:text-mobile-dark-muted">
                          {watch
                            ? 'One room. Everyone’s front row.'
                            : 'One room. Everyone’s favourites.'}
                        </Text>
                      </View>
                      <View className="gap-2">
                        <Text className="font-heading text-mobile-muted text-sm dark:text-mobile-dark-muted">
                          {isAIMode ? 'What’s the vibe?' : 'Room name'}
                        </Text>
                        <NativeGenerativeFrame
                          active={isAIMode}
                          animate={generativeMotion}
                        >
                          <Field
                            inputClassName="min-h-14 rounded-2xl border text-lg"
                            accessibilityLabel={
                              isAIMode ? 'What’s the vibe?' : 'Room name'
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
                              <NativeGenerativeInvitation
                                active={isAIMode}
                                animate={
                                  generativeMotion &&
                                  (isAIMode || !generationDiscovered)
                                }
                              >
                                <Pressable
                                  accessibilityLabel={
                                    isAIMode
                                      ? 'Turn off AI mode'
                                      : 'Generate with AI'
                                  }
                                  accessibilityRole="switch"
                                  accessibilityState={{
                                    checked: isAIMode,
                                  }}
                                  className={classNames(
                                    'size-11 items-center justify-center rounded-xl border active:opacity-70',
                                    isAIMode && 'border-accent bg-accent',
                                    !isAIMode &&
                                      'border-mobile-border bg-mobile-card dark:border-mobile-dark-border dark:bg-mobile-dark-card',
                                  )}
                                  onPress={() => {
                                    setGenerationDiscovered(true);
                                    toggleAIMode();
                                  }}
                                >
                                  <ZoffIcon
                                    color={isAIMode ? '#ffffff' : theme.text}
                                    name="sparkles"
                                    size={22}
                                  />
                                </Pressable>
                              </NativeGenerativeInvitation>
                            }
                          />
                        </NativeGenerativeFrame>
                      </View>
                      <NativeButton
                        accessibilityLabel={submitLabel}
                        className="min-h-14 rounded-2xl"
                        disabled={loading || generationLoading}
                        onPress={submitRoom}
                      >
                        <Text className="text-center font-heading text-mobile-dark-background text-xl">
                          {submitLabel}
                        </Text>
                      </NativeButton>
                      <Text className="text-center font-heading text-mobile-muted text-sm dark:text-mobile-dark-muted">
                        Start a room. Make it yours.
                      </Text>
                    </View>
                  </View>
                  <View
                    ref={browseSection}
                    collapsable={false}
                    onLayout={alignBrowser}
                    className="w-full gap-4"
                    {...(browseMode === 'public' && {
                      style: { minHeight: height - insets.top },
                    })}
                  >
                    <View
                      accessibilityRole="tablist"
                      className="flex-row items-center justify-between gap-3"
                    >
                      {['live', 'public'].map((mode) => (
                        <Pressable
                          key={mode}
                          accessibilityRole="tab"
                          accessibilityState={{
                            selected: browseMode === mode,
                          }}
                          onPress={() => void loadRooms(mode, 0, '')}
                          className={classNames(
                            'min-h-11 flex-row items-center gap-2 rounded-xl active:opacity-70',
                            mode === 'public' && 'px-2',
                          )}
                        >
                          {mode === 'live' && (
                            <View className="size-2 rounded-full bg-accent" />
                          )}
                          <Text
                            className={classNames(
                              'font-heading',
                              mode === 'live' &&
                                'text-mobile-text text-xl dark:text-mobile-dark-text',
                              mode === 'public' && 'text-accent text-base',
                              browseMode === mode &&
                                mode === 'public' &&
                                'underline',
                            )}
                          >
                            {mode === 'live' ? 'Live rooms' : 'Browse all →'}
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
                      {publicRooms.length === 0 && !browsing && (
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
              </View>
            </Animated.View>
          </Animated.ScrollView>
          <ScrollEdgeFades
            backgroundColor={theme.background}
            bottomVisible={scrollEdgeFades.bottomVisible}
            topVisible={scrollEdgeFades.topVisible}
          />
        </View>
        <CreateRoomSheet
          initialName={value}
          providers={availableProviders}
          roomType={roomType}
          visible={createVisible}
          onClose={() => setCreateVisible(false)}
          onCreated={handleCreated}
        />
      </SafeAreaView>
    </Screen>
  );
}

const refreshLogoRotationDurationMs = 1200;
const roomTypes: RoomType[] = ['MUSIC', 'WATCH'];
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
const safeAreaStyle = {
  flex: 1,
};
