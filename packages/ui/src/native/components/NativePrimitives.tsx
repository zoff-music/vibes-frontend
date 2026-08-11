import { classNames } from '@vibes/shared';
import type { PropsWithChildren, ReactNode } from 'react';
import { forwardRef, useState } from 'react';
import type { ImageSourcePropType } from 'react-native';
import { Pressable, Text, TextInput, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import type { ZoffIconName } from '../../shared';
import { zoffIconDefinitions } from '../../shared';
import { NativeIcon } from '../icons/NativeIcon';

export type NativeControlSize = 'default' | 'large';

export type NativeControlTone = 'primary' | 'secondary' | 'danger';

interface NativeCardProps extends PropsWithChildren {
  className?: string;
  size?: NativeControlSize;
}

export function NativeCard({
  children,
  className,
  size = 'default',
}: NativeCardProps) {
  return (
    <View
      className={classNames(
        'border-native-border bg-native-card/95 dark:border-native-dark-border dark:bg-native-dark-card/95',
        size === 'default' && 'gap-4 rounded-2xl border p-4',
        size === 'large' && 'gap-8 rounded-3xl border-2 p-10',
        className,
      )}
    >
      {children}
    </View>
  );
}

interface NativeCopyProps extends PropsWithChildren {
  muted?: boolean;
  size?: NativeControlSize;
}

export function NativeCopy({
  children,
  muted = false,
  size = 'default',
}: NativeCopyProps) {
  return (
    <Text
      className={classNames(
        'font-heading',
        size === 'default' && 'text-sm leading-5',
        size === 'large' && 'text-xl leading-7',
        muted && 'text-native-muted dark:text-native-dark-muted',
        !muted && 'text-native-text dark:text-native-dark-text',
      )}
    >
      {children}
    </Text>
  );
}

interface NativeHeadingProps extends PropsWithChildren {
  size?: NativeControlSize;
}

export function NativeHeading({
  children,
  size = 'default',
}: NativeHeadingProps) {
  return (
    <Text
      className={classNames(
        'font-heading text-native-text dark:text-native-dark-text',
        size === 'default' && 'text-3xl',
        size === 'large' && 'text-5xl',
      )}
    >
      {children}
    </Text>
  );
}

interface NativeButtonProps extends PropsWithChildren {
  accessibilityLabel?: string;
  className?: string;
  disabled?: boolean;
  icon?: ZoffIconName;
  iconColor?: string;
  label?: string;
  onPress: () => void;
  preferred?: boolean;
  size?: NativeControlSize;
  tone?: NativeControlTone;
}

export function NativeButton({
  accessibilityLabel,
  children,
  className,
  disabled,
  icon,
  iconColor,
  label,
  onPress,
  preferred,
  size = 'default',
  tone = 'primary',
}: NativeButtonProps) {
  const [focused, setFocused] = useState(false);
  let resolvedIconColor = iconColor ?? '#e8dff5';
  if (tone === 'primary') resolvedIconColor = '#ffffff';
  if (tone === 'danger') resolvedIconColor = '#d91465';

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityRole="button"
      className={classNames(
        'flex-row items-center justify-center border active:opacity-70',
        size === 'default' && 'min-h-13 gap-2 rounded-xl px-4',
        size === 'large' && 'min-h-24 gap-5 rounded-2xl border-2 px-10 py-5',
        tone === 'primary' && 'border-primary bg-primary',
        tone === 'danger' &&
          'border-error bg-native-surface dark:bg-native-dark-surface',
        tone === 'secondary' &&
          'border-native-border bg-native-surface dark:border-native-dark-border dark:bg-native-dark-surface',
        focused && 'border-accent bg-accent',
        disabled && 'opacity-40',
        className,
      )}
      disabled={disabled}
      hasTVPreferredFocus={preferred}
      onBlur={() => setFocused(false)}
      onFocus={() => setFocused(true)}
      onPress={onPress}
      style={focused ? focusedControlStyle : undefined}
    >
      {icon && (
        <NativeIcon
          color={resolvedIconColor}
          definition={zoffIconDefinitions[icon]}
          size={size === 'large' ? largeIconSize : defaultIconSize}
        />
      )}
      {children}
      {label && (
        <Text
          className={classNames(
            'font-heading',
            size === 'default' && 'text-base',
            size === 'large' && 'text-2xl',
            tone === 'primary' && 'text-white',
            tone === 'danger' && 'text-error',
            tone === 'secondary' &&
              'text-native-text dark:text-native-dark-text',
            focused && 'text-native-dark-text',
          )}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}

interface NativeFieldProps {
  accessibilityLabel?: string;
  autoCapitalize?: 'none' | 'sentences';
  inputClassName?: string;
  onChangeText: (value: string) => void;
  onSubmitEditing?: () => void;
  placeholder: string;
  secureTextEntry?: boolean;
  size?: NativeControlSize;
  testID?: string;
  trailingAction?: ReactNode;
  value: string;
  wrapperClassName?: string;
}

interface NativeIconButtonProps {
  accessibilityLabel: string;
  disabled?: boolean;
  icon: ZoffIconName;
  iconColor?: string;
  onPress: () => void;
  size?: NativeControlSize;
}

export function NativeIconButton({
  accessibilityLabel,
  disabled,
  icon,
  iconColor = '#e8dff5',
  onPress,
  size = 'default',
}: NativeIconButtonProps) {
  const [focused, setFocused] = useState(false);
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      className={classNames(
        'items-center justify-center border border-native-border bg-native-surface active:opacity-70 dark:border-native-dark-border dark:bg-native-dark-surface',
        size === 'default' && 'size-13 rounded-xl',
        size === 'large' && 'size-24 rounded-2xl border-2',
        focused && 'border-accent bg-accent',
        disabled && 'opacity-40',
      )}
      disabled={disabled}
      onBlur={() => setFocused(false)}
      onFocus={() => setFocused(true)}
      onPress={onPress}
      style={focused ? focusedControlStyle : undefined}
    >
      <NativeIcon
        color={iconColor}
        definition={zoffIconDefinitions[icon]}
        size={size === 'large' ? largeIconSize : defaultIconSize}
      />
    </Pressable>
  );
}

export const NativeField = forwardRef<TextInput, NativeFieldProps>(
  function NativeField(
    {
      inputClassName,
      size = 'default',
      trailingAction,
      wrapperClassName,
      ...props
    },
    ref,
  ) {
    return (
      <View className={classNames('relative', wrapperClassName)}>
        <TextInput
          {...props}
          ref={ref}
          autoCorrect={false}
          className={classNames(
            'border-native-border bg-native-surface font-heading text-native-text dark:border-native-dark-border dark:bg-native-dark-surface dark:text-native-dark-text',
            size === 'default' && 'min-h-13 rounded-xl px-4 text-base',
            size === 'large' && 'min-h-24 rounded-2xl border-2 px-8 text-3xl',
            Boolean(trailingAction) && (size === 'large' ? 'pr-24' : 'pr-16'),
            inputClassName,
          )}
          placeholderTextColor="#826b9a"
          returnKeyType="go"
        />
        {trailingAction && (
          <View className="absolute top-0 right-1 bottom-0 justify-center">
            {trailingAction}
          </View>
        )}
      </View>
    );
  },
);

interface NativeQrCodeProps {
  logo?: ImageSourcePropType;
  size: number;
  value: string;
}

export function NativeQrCode({ logo, size, value }: NativeQrCodeProps) {
  return (
    <View className="rounded-2xl bg-white p-2">
      <QRCode
        backgroundColor="#ffffff"
        color="#000000"
        ecl="H"
        logo={logo}
        logoBackgroundColor="#120b1e"
        logoBorderRadius={8}
        logoMargin={3}
        logoSize={size * qrLogoRatio}
        size={size}
        value={value}
      />
    </View>
  );
}

const defaultIconSize = 18;

const largeIconSize = 28;

const qrLogoRatio = 0.3;

const focusedControlStyle = { transform: [{ scale: 1.04 }] };
