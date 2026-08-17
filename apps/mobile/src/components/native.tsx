import {
  NativeButton,
  NativeCard,
  NativeCopy,
  NativeField,
  NativeHeading,
  NativeIconButton,
} from '@vibes/ui/native';
import type { PropsWithChildren, ReactNode } from 'react';
import {
  ActivityIndicator,
  Platform,
  useWindowDimensions,
  View,
} from 'react-native';
import { NativeRetroGrid } from '@/components/native-retro-grid';
import type { ZoffIconName } from '@/components/zoff-icon';
import { useAppTheme } from '@/hooks/use-app-theme';
import {
  tabletNavigationHeight,
  useTabletLandscapeLayout,
} from '@/hooks/use-tablet-landscape-layout';

interface ScreenProps extends PropsWithChildren {
  gridPaused?: boolean;
}

export function Screen({ children, gridPaused = false }: ScreenProps) {
  const tabletLayout = useTabletLandscapeLayout();
  const reservesTabletNavigation =
    Platform.OS === 'android' && tabletLayout.isTablet;
  return (
    <View className="flex-1 overflow-hidden bg-mobile-background dark:bg-mobile-dark-background">
      <NativeRetroGrid paused={gridPaused} />
      <View
        className="flex-1"
        {...(reservesTabletNavigation && {
          style: { paddingTop: tabletNavigationHeight },
        })}
      >
        {children}
      </View>
    </View>
  );
}

export const Card = NativeCard;

export function ContentColumn({ children }: PropsWithChildren) {
  const { width } = useWindowDimensions();
  return (
    <View
      className="w-full"
      style={width >= tabletWidth ? tabletContentColumnStyle : null}
    >
      {children}
    </View>
  );
}

export const Heading = NativeHeading;

export const Copy = NativeCopy;

interface ButtonProps {
  accessibilityLabel?: string;
  disabled?: boolean;
  icon?: ZoffIconName;
  label: string;
  onPress: () => void;
  tone?: 'primary' | 'secondary' | 'danger';
}

interface IconButtonProps {
  accessibilityLabel: string;
  disabled?: boolean;
  icon: ZoffIconName;
  size?: 'default' | 'large';
  onPress: () => void;
}

export function IconButton({
  accessibilityLabel,
  disabled,
  icon,
  size = 'default',
  onPress,
}: IconButtonProps) {
  const theme = useAppTheme();
  return (
    <NativeIconButton
      accessibilityLabel={accessibilityLabel}
      disabled={disabled}
      icon={icon}
      iconColor={theme.text}
      onPress={onPress}
      size={size}
    />
  );
}

export function Button({
  accessibilityLabel,
  disabled,
  icon,
  label,
  onPress,
  tone = 'primary',
}: ButtonProps) {
  const theme = useAppTheme();
  let iconColor: string = theme.text;
  if (tone === 'primary') {
    iconColor = '#ffffff';
  }
  if (tone === 'danger') {
    iconColor = theme.danger;
  }
  return (
    <NativeButton
      accessibilityLabel={accessibilityLabel ?? label}
      disabled={disabled}
      icon={icon}
      iconColor={iconColor}
      label={label}
      onPress={onPress}
      tone={tone}
    />
  );
}

export const Field = NativeField;

interface EmptyProps {
  children: ReactNode;
  loading?: boolean;
}

export function Empty({ children, loading }: EmptyProps) {
  const theme = useAppTheme();
  return (
    <View className="flex-1 items-center justify-center gap-3">
      {loading && <ActivityIndicator color={theme.accent} />}
      <Copy muted>{children}</Copy>
    </View>
  );
}

const tabletWidth = 768;
const tabletContentColumnStyle = {
  alignSelf: 'center' as const,
  maxWidth: 760,
};
