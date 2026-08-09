import { SymbolView } from 'expo-symbols';
import type { PropsWithChildren, ReactNode } from 'react';
import { forwardRef } from 'react';
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useAppTheme } from '@/hooks/use-app-theme';

export function Screen({ children }: PropsWithChildren) {
  return (
    <View className="flex-1 bg-mobile-background dark:bg-mobile-dark-background">
      {children}
    </View>
  );
}

export function Card({ children }: PropsWithChildren) {
  return (
    <View className="gap-3 rounded-3xl border border-mobile-border bg-mobile-card p-4 dark:border-mobile-dark-border dark:bg-mobile-dark-card">
      {children}
    </View>
  );
}

export function Heading({ children }: PropsWithChildren) {
  return (
    <Text className="font-extrabold font-mono text-3xl text-mobile-text dark:text-mobile-dark-text">
      {children}
    </Text>
  );
}

export function Copy({
  children,
  muted = false,
}: PropsWithChildren<{ muted?: boolean }>) {
  const className = muted
    ? 'font-mono text-sm leading-5 text-mobile-muted dark:text-mobile-dark-muted'
    : 'font-mono text-sm leading-5 text-mobile-text dark:text-mobile-dark-text';
  return <Text className={className}>{children}</Text>;
}

interface ButtonProps {
  disabled?: boolean;
  icon?:
    | 'forward.end.fill'
    | 'pause.fill'
    | 'play.fill'
    | 'plus'
    | 'viewfinder';
  label: string;
  onPress: () => void;
  tone?: 'primary' | 'secondary' | 'danger';
}

export function Button({
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
  return (
    <Pressable
      accessibilityRole="button"
      className={`min-h-12 flex-row items-center justify-center gap-2 rounded-2xl border px-4 active:opacity-70 ${disabled ? 'opacity-45' : ''} ${toneClassName}`}
      disabled={disabled}
      onPress={onPress}
    >
      {icon && <SymbolView name={icon} size={18} tintColor={theme.text} />}
      <Text className="font-bold font-mono text-mobile-text text-sm dark:text-mobile-dark-text">
        {label}
      </Text>
    </Pressable>
  );
}

interface FieldProps {
  autoCapitalize?: 'none' | 'sentences';
  onChangeText: (value: string) => void;
  onSubmitEditing?: () => void;
  placeholder: string;
  secureTextEntry?: boolean;
  value: string;
}

export const Field = forwardRef<TextInput, FieldProps>(
  function Field(props, ref) {
    const theme = useAppTheme();
    return (
      <TextInput
        {...props}
        ref={ref}
        autoCorrect={false}
        className="min-h-13 rounded-2xl border border-mobile-border bg-mobile-surface px-4 font-mono text-base text-mobile-text dark:border-mobile-dark-border dark:bg-mobile-dark-surface dark:text-mobile-dark-text"
        placeholderTextColor={theme.muted}
        returnKeyType="go"
      />
    );
  },
);

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
      {loading ? <ActivityIndicator color={theme.accent} /> : null}
      <Copy muted>{children}</Copy>
    </View>
  );
}
