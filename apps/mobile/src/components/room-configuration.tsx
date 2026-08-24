import type { Providers, RoomSettings, SourceType } from '@vibes/models';
import { classNames } from '@vibes/shared';
import { Pressable, Switch, Text, View } from 'react-native';

import { Card, Copy } from '@/components/native';
import { useAppTheme } from '@/hooks/use-app-theme';

interface RoomConfigurationProps {
  disabled?: boolean;
  hasPassword: boolean;
  mode: 'host' | 'server';
  onModeChange: (mode: 'host' | 'server') => void;
  onSettingsChange: (settings: RoomSettings) => void;
  providers: Providers;
  settings: RoomSettings;
}

interface SettingsSwitchProps {
  description: string;
  disabled?: boolean;
  label: string;
  onValueChange: (value: boolean) => void;
  value: boolean;
}

function SettingsSwitch({
  description,
  disabled,
  label,
  onValueChange,
  value,
}: SettingsSwitchProps) {
  const theme = useAppTheme();
  return (
    <View className="min-h-16 flex-row items-center justify-between gap-4 py-1">
      <View className="min-w-0 flex-1 gap-1">
        <Text className="font-heading text-base text-mobile-text dark:text-mobile-dark-text">
          {label}
        </Text>
        <Copy muted>{description}</Copy>
      </View>
      <Switch
        disabled={disabled}
        ios_backgroundColor={theme.surface}
        trackColor={{ false: theme.surface, true: theme.accent }}
        value={value}
        onValueChange={onValueChange}
      />
    </View>
  );
}

export function RoomConfiguration({
  disabled = false,
  hasPassword,
  mode,
  onModeChange,
  onSettingsChange,
  providers,
  settings,
}: RoomConfigurationProps) {
  const updateSetting = <Key extends keyof RoomSettings>(
    key: Key,
    value: RoomSettings[Key],
  ) => onSettingsChange({ ...settings, [key]: value });

  const toggleProvider = (provider: SourceType, enabled: boolean) => {
    let enabledSources = settings.enabledSources.filter(
      (source) => source !== provider,
    );
    if (enabled) {
      enabledSources = [...enabledSources, provider];
    }
    updateSetting('enabledSources', enabledSources);
  };

  let publicDescription = 'Requires an admin password.';
  if (hasPassword) {
    publicDescription = 'Show this room while listeners are active.';
  }

  return (
    <View className="gap-4">
      <View className="gap-2">
        <Copy muted>ROOM MODE</Copy>
        <View className="flex-row gap-3">
          <ModeButton
            active={mode === 'server'}
            description="Automatic shared playback"
            disabled={disabled}
            label="Server mode"
            mode="server"
            onPress={() => onModeChange('server')}
          />
          <ModeButton
            active={mode === 'host'}
            description="One host controls playback"
            disabled={disabled}
            label="Host mode"
            mode="host"
            onPress={() => onModeChange('host')}
          />
        </View>
      </View>

      <View className="gap-2">
        <Copy muted>PLAYBACK</Copy>
        <Card>
          <SettingsSwitch
            description="Anyone can request the next song."
            disabled={disabled}
            label="Allow skip"
            value={settings.skipAllowed}
            onValueChange={(value) => updateSetting('skipAllowed', value)}
          />
          <Divider />
          <SettingsSwitch
            description="Require votes before skipping."
            disabled={disabled || !settings.skipAllowed || mode === 'host'}
            label="Democratic skip"
            value={settings.democraticSkip}
            onValueChange={(value) => updateSetting('democraticSkip', value)}
          />
          <Divider />
          <SettingsSwitch
            description="Restart from the first song when the queue ends."
            disabled={disabled}
            label="Loop queue"
            value={settings.loopQueue}
            onValueChange={(value) => updateSetting('loopQueue', value)}
          />
          <Divider />
          <SettingsSwitch
            description="Remove each song after it plays."
            disabled={disabled}
            label="Remove played"
            value={settings.removeOnPlay}
            onValueChange={(value) => updateSetting('removeOnPlay', value)}
          />
          <Divider />
          <SettingsSwitch
            description="Allow the same song more than once."
            disabled={disabled}
            label="Allow duplicates"
            value={settings.allowDuplicates}
            onValueChange={(value) => updateSetting('allowDuplicates', value)}
          />
          <Divider />
          <SettingsSwitch
            description="Only authenticated room admins may add songs."
            disabled={disabled}
            label="Admins only add"
            value={settings.onlyAdminAddSongs ?? false}
            onValueChange={(value) => updateSetting('onlyAdminAddSongs', value)}
          />
          <Divider />
          <SettingsSwitch
            description="Allow adding playlists from provider links."
            disabled={disabled}
            label="Playlist import"
            value={settings.playlistImport}
            onValueChange={(value) => updateSetting('playlistImport', value)}
          />
          <Divider />
          <SettingsSwitch
            description={publicDescription}
            disabled={disabled || !hasPassword}
            label="Public while active"
            value={settings.public}
            onValueChange={(value) => updateSetting('public', value)}
          />
        </Card>
      </View>

      <View className="gap-2">
        <Copy muted>MUSIC PROVIDERS</Copy>
        <Card>
          {providers.map((provider, index) => (
            <View key={provider}>
              {index > 0 && <Divider />}
              <SettingsSwitch
                description={`Allow ${provider} songs in this room.`}
                disabled={disabled}
                label={provider}
                value={settings.enabledSources.includes(provider)}
                onValueChange={(enabled) => toggleProvider(provider, enabled)}
              />
            </View>
          ))}
          {providers.length === 0 && (
            <Copy muted>No music providers are currently enabled.</Copy>
          )}
        </Card>
      </View>
    </View>
  );
}

interface ModeButtonProps {
  active: boolean;
  description: string;
  disabled: boolean;
  label: string;
  mode: 'host' | 'server';
  onPress: () => void;
}

function ModeButton({
  active,
  description,
  disabled,
  label,
  mode,
  onPress,
}: ModeButtonProps) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: active, disabled }}
      className={classNames(
        'min-h-24 flex-1 gap-2 rounded-2xl border p-4',
        !active &&
          'border-mobile-border bg-mobile-card dark:border-mobile-dark-border dark:bg-mobile-dark-card',
        active && mode === 'server' && 'border-accent bg-accent',
        active && mode === 'host' && 'border-primary bg-primary',
        disabled && 'opacity-75',
      )}
      disabled={disabled}
      onPress={onPress}
    >
      <Text
        className={classNames(
          'font-heading text-base',
          active && mode === 'server' && 'text-mobile-dark-background',
          active && mode === 'host' && 'text-white',
          !active && 'text-mobile-text dark:text-mobile-dark-text',
        )}
      >
        {label}
      </Text>
      <Text
        className={classNames(
          'font-heading text-sm leading-5',
          active && mode === 'server' && 'text-mobile-dark-background/75',
          active && mode === 'host' && 'text-white/75',
          !active && 'text-mobile-muted dark:text-mobile-dark-muted',
        )}
      >
        {description}
      </Text>
    </Pressable>
  );
}

function Divider() {
  return <View className="h-px bg-mobile-border dark:bg-mobile-dark-border" />;
}
