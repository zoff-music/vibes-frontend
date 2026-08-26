import { msw98uiBoldFontFamily, msw98uiFontFamily } from '@vibes/ui/shared';
import { useFonts } from 'expo-font';
import { useEffect, useState } from 'react';
import { BackHandler, StatusBar, View } from 'react-native';
import { TvHydrateFallback } from '@/components/tv-hydrate-fallback';
import { useTvSession } from '@/hooks/use-tv-session';
import { LandingScreen } from '@/screens/landing-screen';
import { RoomScreen } from '@/screens/room-screen';
import '@/global.css';

export { TvRouteError as ErrorBoundary } from '@/components/tv-error-boundary';
export { TvHydrateFallback as HydrateFallback } from '@/components/tv-hydrate-fallback';
export { loader } from './loader';

export default function TvIndexRoute() {
  const [fontsLoaded] = useFonts({
    [msw98uiFontFamily]: require('../../../../../packages/ui/src/shared/assets/fonts/MSW98UI-Regular.ttf'),
    [msw98uiBoldFontFamily]: require('../../../../../packages/ui/src/shared/assets/fonts/MSW98UI-Bold.ttf'),
  });
  const [session, sessionActions] = useTvSession();
  const [isAIMode, setIsAIMode] = useState(false);

  useEffect(() => {
    if (!session.roomId) return;
    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        sessionActions.leaveRoom();
        return true;
      },
    );
    return () => subscription.remove();
  }, [session.roomId, sessionActions.leaveRoom]);

  if (!fontsLoaded || session.hydrating) return <TvHydrateFallback />;

  let screen = (
    <LandingScreen
      isAIMode={isAIMode}
      sessionActions={sessionActions}
      session={session}
      onToggleAIMode={() => setIsAIMode((current) => !current)}
    />
  );
  if (session.room && session.roomId) {
    screen = <RoomScreen session={session} sessionActions={sessionActions} />;
  }

  return (
    <View className="flex-1 bg-tv-background">
      <StatusBar hidden />
      <View className="absolute inset-0 opacity-40">
        <View className="absolute inset-x-0 bottom-0 h-1/3 bg-primary/10" />
        <View className="absolute top-0 right-0 h-80 w-80 rounded-full bg-accent/5" />
        <View className="absolute bottom-0 left-1/4 h-96 w-96 rounded-full bg-primary/10" />
      </View>
      {screen}
    </View>
  );
}
