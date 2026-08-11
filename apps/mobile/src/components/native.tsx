import {
  NativeButton,
  NativeCard,
  NativeCopy,
  NativeField,
  NativeHeading,
  NativeIconButton,
} from '@vibes/ui/native';
import type { PropsWithChildren, ReactNode } from 'react';
import { ActivityIndicator, useWindowDimensions, View } from 'react-native';
import type { ZoffIconName } from '@/components/zoff-icon';
import { useAppTheme } from '@/hooks/use-app-theme';

export function Screen({ children }: PropsWithChildren) {
  return (
    <View className="flex-1 overflow-hidden bg-mobile-background dark:bg-mobile-dark-background">
      <View className="absolute inset-0 opacity-35" pointerEvents="none">
        {backgroundGridColumns.map((position) => (
          <View
            className="absolute inset-y-0 w-px bg-primary/15 dark:bg-primary/20"
            key={`column-${position}`}
            style={{ left: `${position}%` }}
          />
        ))}
        {backgroundGridRows.map((position) => (
          <View
            className="absolute inset-x-0 h-px bg-primary/15 dark:bg-primary/20"
            key={`row-${position}`}
            style={{ top: `${position}%` }}
          />
        ))}
        <View className="absolute top-0 right-0 left-0 h-40 bg-primary/5" />
      </View>
      <View className="flex-1">{children}</View>
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

const backgroundGridColumns = [12, 25, 38, 50, 62, 75, 88];
const backgroundGridRows = [18, 30, 42, 54, 66, 78, 90];
const tabletWidth = 768;
const tabletContentColumnStyle = {
  alignSelf: 'center' as const,
  maxWidth: 760,
};
