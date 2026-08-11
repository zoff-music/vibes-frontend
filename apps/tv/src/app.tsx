import {
  PixelifySans_700Bold,
  useFonts,
} from '@expo-google-fonts/pixelify-sans';
import { useEffect, useState } from 'react';
import { BackHandler, StatusBar, View } from 'react-native';
import { useTvSession } from '@/hooks/use-tv-session';
import { tvApi } from '@/lib/api';
import { LandingScreen } from '@/screens/landing-screen';
import { RoomScreen } from '@/screens/room-screen';
import '@/global.css';

export function App() {
  const [fontsLoaded] = useFonts({
    'Pixelify Sans Bold': PixelifySans_700Bold,
  });
  const session = useTvSession(tvApi);
  const [isAIMode, setIsAIMode] = useState(false);

  useEffect(() => {
    if (!session.roomId) return;
    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        session.leaveRoom();
        return true;
      },
    );
    return () => subscription.remove();
  }, [session.leaveRoom, session.roomId]);

  if (!fontsLoaded) return null;

  let screen = (
    <LandingScreen
      isAIMode={isAIMode}
      session={session}
      onToggleAIMode={() => setIsAIMode((current) => !current)}
    />
  );
  if (session.room && session.roomId) {
    screen = <RoomScreen session={session} />;
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
