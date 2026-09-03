import type { SessionProfile } from '@vibes/models';
import { useRouteLoaderData } from '@vibes/native-router';
import { classNames } from '@vibes/shared';
import Constants from 'expo-constants';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Linking,
  Pressable,
  ScrollView,
  Switch,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Card,
  ContentColumn,
  Copy,
  Heading,
  Screen,
} from '@/components/native';
import {
  NativeTerminalSection,
  NativeTerminalShell,
  NativeTerminalToolbar,
} from '@/components/native-terminal-shell';
import { ProfileSettingsSheet } from '@/components/profile-settings-sheet';
import { RoomSettingsSheet } from '@/components/room-settings-sheet';
import {
  ScrollEdgeFades,
  useScrollEdgeFades,
} from '@/components/scroll-edge-fades';
import { Toast, useToast } from '@/components/toast';
import { ZoffIcon, type ZoffIconName } from '@/components/zoff-icon';
import { useAppTheme } from '@/hooks/use-app-theme';
import {
  usePlaybackActions,
  usePlaybackSession,
  useRoomActions,
  useRoomSession,
} from '@/providers/app-provider';
import { useKonamiMode } from '@/providers/konami-mode-provider';
import { useThemePreference } from '@/providers/theme-provider';
import { DeviceRemoteSettings } from './device-remote-settings';

export function SettingsScreen() {
  const { playerEnabled, playerPreferenceLoaded } = usePlaybackSession();
  const { providers, room } = useRoomSession();
  const { setPlayerEnabled } = usePlaybackActions();
  const { forgetRoomAdminPassword, refresh, rememberRoomAdminPassword } =
    useRoomActions();
  const [roomSettingsVisible, setRoomSettingsVisible] = useState(false);
  const [profileSettingsVisible, setProfileSettingsVisible] = useState(false);
  const loadedProfile = useRouteLoaderData<SessionProfile>('sessions.profile');
  const [profile, setProfile] = useState(loadedProfile);
  const { showToast } = useToast();

  useEffect(() => {
    if (!loadedProfile) return;
    setProfile(loadedProfile);
  }, [loadedProfile]);

  const handleProfileSaved = useCallback(
    (savedProfile: SessionProfile) => {
      setProfile(savedProfile);
      showToast('Display name saved.', 'success');
    },
    [showToast],
  );

  const versionTapCount = useRef(0);
  const [{ preference, warning: themeWarning }, setPreference] =
    useThemePreference();
  const theme = useAppTheme();
  const scrollEdgeFades = useScrollEdgeFades();
  const {
    enabled: konamiEnabled,
    toggle: toggleKonamiMode,
    warning: konamiWarning,
  } = useKonamiMode();
  const handleVersionPress = useCallback(() => {
    versionTapCount.current += 1;
    if (versionTapCount.current < konamiTapCount) return;
    versionTapCount.current = 0;
    void toggleKonamiMode();
  }, [toggleKonamiMode]);
  const settingsContent = (
    <>
      <NativeTerminalSection label="DEVICE CONTROL" status="ONLINE">
        <Card>
          <SettingsRow
            description="Choose how your song additions are credited."
            label={profile?.name ?? 'Display name'}
            onPress={() => setProfileSettingsVisible(true)}
          />
          <View className="h-px bg-[#71f5ad]/20" />
          <Copy muted>APPEARANCE PROTOCOL</Copy>
          <View className="flex-row gap-2">
            <View className="flex-1">
              <ThemeButton
                active={preference === 'auto'}
                icon="auto"
                label="Auto"
                onPress={() => void setPreference('auto')}
              />
            </View>
            <View className="flex-1">
              <ThemeButton
                active={preference === 'light'}
                icon="sun"
                label="Light"
                onPress={() => void setPreference('light')}
              />
            </View>
            <View className="flex-1">
              <ThemeButton
                active={preference === 'dark'}
                icon="moon"
                label="Dark"
                onPress={() => void setPreference('dark')}
              />
            </View>
          </View>
          <View className="h-px bg-[#71f5ad]/20" />
          <View className="min-h-16 flex-row items-center justify-between gap-4 py-1">
            <View className="min-w-0 flex-1 gap-1">
              <Text className="font-heading text-[#dffff0] text-base uppercase">
                Player enabled
              </Text>
              <Copy muted>
                Load music and video players on this device while in a room.
              </Copy>
            </View>
            <Switch
              disabled={!playerPreferenceLoaded}
              ios_backgroundColor={theme.surface}
              trackColor={{ false: theme.surface, true: theme.accent }}
              value={playerEnabled}
              onValueChange={(enabled) => void setPlayerEnabled(enabled)}
            />
          </View>
        </Card>
      </NativeTerminalSection>
      <Toast message={themeWarning} />
      <Toast message={konamiWarning} />
      <NativeTerminalSection label="REMOTE CONTROL" status="STANDBY">
        <DeviceRemoteSettings hideLabel />
      </NativeTerminalSection>
      <NativeTerminalSection
        label="ROOM CHANNEL"
        status={room ? 'MOUNTED' : 'NO SIGNAL'}
      >
        <Card>
          <SettingsRow
            description={
              room
                ? `${room.mode} mode · ${room.settings.enabledSources.join(', ')}`
                : 'Join a room to configure it.'
            }
            disabled={!room}
            label={room?.name ?? 'No active room'}
            onPress={() => setRoomSettingsVisible(true)}
          />
        </Card>
      </NativeTerminalSection>
      <NativeTerminalSection
        label="MUSIC ADAPTERS"
        status={`${providers.length.toString().padStart(2, '0')} ONLINE`}
      >
        <Card>
          <Copy>
            {providers.length ? providers.join(' · ') : 'No providers enabled'}
          </Copy>
          <Copy muted>
            Playback uses each provider’s official embedded player and controls.
          </Copy>
        </Card>
      </NativeTerminalSection>
      <NativeTerminalSection label="SYSTEM INFORMATION" status="VERIFIED">
        <Card>
          <SettingsRow
            label="Privacy policy"
            onPress={() =>
              void Linking.openURL('https://zoff.me/privacy-policy')
            }
          />
          <View className="h-px bg-[#71f5ad]/20" />
          <SettingsRow
            label="Terms of service"
            onPress={() =>
              void Linking.openURL('https://zoff.me/terms-of-service')
            }
          />
          <View className="h-px bg-[#71f5ad]/20" />
          <SettingsRow
            description={Constants.expoConfig?.version ?? 'development'}
            label="Zoff Mobile"
            onPress={handleVersionPress}
            showDisclosure={false}
            testID="app-version-card"
          />
        </Card>
      </NativeTerminalSection>
    </>
  );

  if (konamiEnabled) {
    return (
      <Screen>
        <SafeAreaView edges={['top']} style={safeAreaStyle}>
          <View className="flex-1">
            <ScrollView
              contentContainerClassName="p-3 pb-28"
              key="terminal-settings"
              onContentSizeChange={scrollEdgeFades.onContentSizeChange}
              onLayout={scrollEdgeFades.onLayout}
              onScroll={scrollEdgeFades.onScroll}
              scrollEventThrottle={16}
            >
              <ContentColumn>
                <NativeTerminalShell
                  channel="SYSTEM CONFIG"
                  title="SETTINGS"
                  footer={
                    <>
                      <Text className="font-heading text-[#a6ffd0]/65 text-xs uppercase tracking-widest">
                        SIGNAL LOCKED
                      </Text>
                      <Text className="font-heading text-[#a6ffd0]/65 text-xs uppercase tracking-widest">
                        KONAMI LINK ACTIVE
                      </Text>
                    </>
                  }
                >
                  <NativeTerminalToolbar
                    description="LOCAL DEVICE / ROOM / LINK PARAMETERS"
                    title="ZOFF / SYSTEM CONFIG"
                  />
                  {settingsContent}
                </NativeTerminalShell>
              </ContentColumn>
            </ScrollView>
            <ScrollEdgeFades
              backgroundColor={theme.background}
              bottomVisible={scrollEdgeFades.bottomVisible}
              topVisible={scrollEdgeFades.topVisible}
            />
          </View>
          {room && (
            <RoomSettingsSheet
              providers={providers}
              room={room}
              visible={roomSettingsVisible}
              onAuthenticated={rememberRoomAdminPassword}
              onClose={() => setRoomSettingsVisible(false)}
              onLoggedOut={forgetRoomAdminPassword}
              onUpdated={refresh}
            />
          )}
          <ProfileSettingsSheet
            initialProfile={profile}
            visible={profileSettingsVisible}
            onClose={() => setProfileSettingsVisible(false)}
            onSaved={handleProfileSaved}
          />
        </SafeAreaView>
      </Screen>
    );
  }
  return (
    <Screen>
      <SafeAreaView edges={['top']} style={safeAreaStyle}>
        <View className="flex-1">
          <ScrollView
            contentContainerClassName="gap-4 p-4 pb-28"
            onContentSizeChange={scrollEdgeFades.onContentSizeChange}
            onLayout={scrollEdgeFades.onLayout}
            onScroll={scrollEdgeFades.onScroll}
            scrollEventThrottle={16}
          >
            <ContentColumn>
              <View className="gap-4">
                <Heading>Settings</Heading>
                <View className="gap-2">
                  <Copy muted>DEVICE</Copy>
                  <Card>
                    <SettingsRow
                      description="Choose how your song additions are credited."
                      label={profile?.name ?? 'Display name'}
                      onPress={() => setProfileSettingsVisible(true)}
                    />
                    <View className="h-px bg-mobile-border dark:bg-mobile-dark-border" />
                    <Copy muted>APPEARANCE</Copy>
                    <View className="flex-row gap-2">
                      <View className="flex-1">
                        <ThemeButton
                          active={preference === 'auto'}
                          icon="auto"
                          label="Auto"
                          onPress={() => void setPreference('auto')}
                        />
                      </View>
                      <View className="flex-1">
                        <ThemeButton
                          active={preference === 'light'}
                          icon="sun"
                          label="Light"
                          onPress={() => void setPreference('light')}
                        />
                      </View>
                      <View className="flex-1">
                        <ThemeButton
                          active={preference === 'dark'}
                          icon="moon"
                          label="Dark"
                          onPress={() => void setPreference('dark')}
                        />
                      </View>
                    </View>
                    <View className="h-px bg-mobile-border dark:bg-mobile-dark-border" />
                    <View className="min-h-16 flex-row items-center justify-between gap-4 py-1">
                      <View className="min-w-0 flex-1 gap-1">
                        <Text className="font-heading text-base text-mobile-text dark:text-mobile-dark-text">
                          Player enabled
                        </Text>
                        <Copy muted>
                          Load music and video players on this device while in a
                          room.
                        </Copy>
                      </View>
                      <Switch
                        disabled={!playerPreferenceLoaded}
                        ios_backgroundColor={theme.surface}
                        trackColor={{
                          false: theme.surface,
                          true: theme.accent,
                        }}
                        value={playerEnabled}
                        onValueChange={(enabled) =>
                          void setPlayerEnabled(enabled)
                        }
                      />
                    </View>
                  </Card>
                  <Toast message={themeWarning} />
                  <Toast message={konamiWarning} />
                </View>
                <DeviceRemoteSettings />
                <View className="gap-2">
                  <Copy muted>ROOM</Copy>
                  <Card>
                    <SettingsRow
                      description={
                        room
                          ? `${room.mode} mode · ${room.settings.enabledSources.join(', ')}`
                          : 'Join a room to configure it.'
                      }
                      disabled={!room}
                      label={room?.name ?? 'No active room'}
                      onPress={() => setRoomSettingsVisible(true)}
                    />
                  </Card>
                </View>
                <View className="gap-2">
                  <Copy muted>MUSIC PROVIDERS</Copy>
                  <Card>
                    <Copy>
                      {providers.length
                        ? providers.join(' · ')
                        : 'No providers enabled'}
                    </Copy>
                    <Copy muted>
                      Playback uses each provider’s official embedded player and
                      controls.
                    </Copy>
                  </Card>
                </View>
                <View className="gap-2">
                  <Copy muted>ABOUT</Copy>
                  <Card>
                    <SettingsRow
                      label="Privacy policy"
                      onPress={() =>
                        void Linking.openURL('https://zoff.me/privacy-policy')
                      }
                    />
                    <View className="h-px bg-mobile-border dark:bg-mobile-dark-border" />
                    <SettingsRow
                      label="Terms of service"
                      onPress={() =>
                        void Linking.openURL('https://zoff.me/terms-of-service')
                      }
                    />
                    <View className="h-px bg-mobile-border dark:bg-mobile-dark-border" />
                    <SettingsRow
                      description={
                        Constants.expoConfig?.version ?? 'development'
                      }
                      label="Zoff Mobile"
                      onPress={handleVersionPress}
                      showDisclosure={false}
                      testID="app-version-card"
                    />
                  </Card>
                </View>
                {room && (
                  <RoomSettingsSheet
                    providers={providers}
                    room={room}
                    visible={roomSettingsVisible}
                    onAuthenticated={rememberRoomAdminPassword}
                    onClose={() => setRoomSettingsVisible(false)}
                    onLoggedOut={forgetRoomAdminPassword}
                    onUpdated={refresh}
                  />
                )}
                <ProfileSettingsSheet
                  initialProfile={profile}
                  visible={profileSettingsVisible}
                  onClose={() => setProfileSettingsVisible(false)}
                  onSaved={handleProfileSaved}
                />
              </View>
            </ContentColumn>
          </ScrollView>
          <ScrollEdgeFades
            backgroundColor={theme.background}
            bottomVisible={scrollEdgeFades.bottomVisible}
            topVisible={scrollEdgeFades.topVisible}
          />
        </View>
      </SafeAreaView>
    </Screen>
  );
}

interface ThemeButtonProps {
  active: boolean;
  icon: ZoffIconName;
  label: string;
  onPress: () => void;
}

function ThemeButton({ active, icon, label, onPress }: ThemeButtonProps) {
  const theme = useAppTheme();
  const { enabled: konamiEnabled } = useKonamiMode();
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: active }}
      className={classNames(
        'min-h-12 flex-row items-center justify-center gap-2 rounded-xl border px-2',
        !konamiEnabled && active && 'border-accent bg-accent/15',
        !konamiEnabled &&
          !active &&
          'border-mobile-border bg-mobile-surface dark:border-mobile-dark-border dark:bg-mobile-dark-surface',
        konamiEnabled &&
          !active &&
          'rounded-none border-[#71f5ad]/40 bg-[#010705]',
        konamiEnabled &&
          active &&
          'rounded-none border-[#71f5ad] bg-[#71f5ad]/15',
      )}
      onPress={onPress}
    >
      <View className="size-5 items-center justify-center">
        <ZoffIcon
          color={konamiEnabled ? '#71f5ad' : active ? theme.accent : theme.text}
          name={icon}
          size={18}
        />
      </View>
      <Text
        className={classNames(
          'font-heading text-sm',
          !konamiEnabled && 'text-mobile-text dark:text-mobile-dark-text',
          konamiEnabled && 'text-[#dffff0] dark:text-[#dffff0]',
          konamiEnabled && active && 'text-[#71f5ad]',
        )}
      >
        {label}
      </Text>
    </Pressable>
  );
}

interface SettingsRowProps {
  description?: string;
  disabled?: boolean;
  label: string;
  onPress?: () => void;
  showDisclosure?: boolean;
  testID?: string;
}

function SettingsRow({
  description,
  disabled,
  label,
  onPress,
  showDisclosure = true,
  testID,
}: SettingsRowProps) {
  const { enabled: konamiEnabled } = useKonamiMode();
  return (
    <Pressable
      accessibilityRole={disabled ? 'text' : 'button'}
      className={classNames(
        'min-h-14 flex-row items-center justify-between gap-4 will-change-pressable active:opacity-60',
        disabled && 'opacity-70',
      )}
      disabled={disabled}
      onPress={onPress}
      testID={testID}
    >
      <View className="min-w-0 flex-1 gap-1">
        <Text
          className={classNames(
            'font-heading text-base',
            !konamiEnabled && 'text-mobile-text dark:text-mobile-dark-text',
            konamiEnabled && 'text-[#dffff0] dark:text-[#dffff0]',
          )}
        >
          {label}
        </Text>
        {description && <Copy muted>{description}</Copy>}
      </View>
      {!disabled && showDisclosure && (
        <Text
          className={classNames(
            'font-heading text-2xl',
            !konamiEnabled && 'text-accent',
            konamiEnabled && 'text-[#71f5ad]',
          )}
        >
          ›
        </Text>
      )}
    </Pressable>
  );
}

const konamiTapCount = 29;
const safeAreaStyle = { flex: 1 };
