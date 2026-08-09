import type { PropsWithChildren, ReactNode } from 'react';
import { forwardRef } from 'react';
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { ZoffIcon, type ZoffIconName } from '@/components/zoff-icon';
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

export function Card({ children }: PropsWithChildren) {
  return (
    <View className="gap-4 rounded-2xl border border-mobile-border bg-mobile-card/95 p-4 shadow-black/10 shadow-md dark:border-mobile-dark-border dark:bg-mobile-dark-card/95 dark:shadow-black/30">
      {children}
    </View>
  );
}

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

export function Heading({ children }: PropsWithChildren) {
  return (
    <Text className="font-heading text-3xl text-mobile-text dark:text-mobile-dark-text">
      {children}
    </Text>
  );
}

export function Copy({
  children,
  muted = false,
}: PropsWithChildren<{ muted?: boolean }>) {
  const className = muted
    ? 'font-heading text-sm leading-5 text-mobile-muted dark:text-mobile-dark-muted'
    : 'font-heading text-sm leading-5 text-mobile-text dark:text-mobile-dark-text';
  return <Text className={className}>{children}</Text>;
}

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
  onPress: () => void;
}

export function IconButton({
  accessibilityLabel,
  disabled,
  icon,
  onPress,
}: IconButtonProps) {
  const theme = useAppTheme();
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      className={`size-12 items-center justify-center rounded-xl border border-mobile-border bg-mobile-surface active:opacity-70 dark:border-mobile-dark-border dark:bg-mobile-dark-surface ${disabled ? 'opacity-45' : ''}`}
      disabled={disabled}
      onPress={onPress}
    >
      <ZoffIcon color={theme.text} name={icon} size={20} />
    </Pressable>
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
  const toneClassName =
    tone === 'primary'
      ? 'border-primary bg-primary'
      : tone === 'danger'
        ? 'border-error bg-mobile-surface dark:bg-mobile-dark-surface'
        : 'border-mobile-border bg-mobile-surface dark:border-mobile-dark-border dark:bg-mobile-dark-surface';
  const labelClassName =
    tone === 'primary'
      ? 'text-white'
      : tone === 'danger'
        ? 'text-error'
        : 'text-mobile-text dark:text-mobile-dark-text';
  let iconColor: string = theme.text;
  if (tone === 'primary') {
    iconColor = '#ffffff';
  }
  if (tone === 'danger') {
    iconColor = theme.danger;
  }
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityRole="button"
      className={`min-h-13 flex-row items-center justify-center gap-2 rounded-xl border px-4 shadow-sm active:opacity-70 ${disabled ? 'opacity-45' : ''} ${toneClassName}`}
      disabled={disabled}
      onPress={onPress}
    >
      {icon && <ZoffIcon color={iconColor} name={icon} size={18} />}
      <Text className={`font-heading text-base ${labelClassName}`}>
        {label}
      </Text>
    </Pressable>
  );
}

interface FieldProps {
  accessibilityLabel?: string;
  autoCapitalize?: 'none' | 'sentences';
  onChangeText: (value: string) => void;
  onSubmitEditing?: () => void;
  placeholder: string;
  secureTextEntry?: boolean;
  trailingAction?: ReactNode;
  testID?: string;
  value: string;
}

export const Field = forwardRef<TextInput, FieldProps>(function Field(
  { trailingAction, ...props },
  ref,
) {
  const theme = useAppTheme();
  return (
    <View className="relative">
      <TextInput
        {...props}
        ref={ref}
        autoCorrect={false}
        className={`min-h-13 rounded-xl border border-mobile-border bg-mobile-surface px-4 font-heading text-base text-mobile-text dark:border-mobile-dark-border dark:bg-mobile-dark-surface dark:text-mobile-dark-text ${trailingAction ? 'pr-16' : ''}`}
        placeholderTextColor={theme.muted}
        returnKeyType="go"
      />
      {trailingAction && (
        <View className="absolute top-0 right-1 bottom-0 justify-center">
          {trailingAction}
        </View>
      )}
    </View>
  );
});

export function Empty({
  children,
  loading,
}: {
  children: ReactNode;
  loading?: boolean;
}) {
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
