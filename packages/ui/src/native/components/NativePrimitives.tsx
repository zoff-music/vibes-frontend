import { classNames } from '@vibes/shared';

import {
  forwardRef,
  type PropsWithChildren,
  type ReactNode,
  useState,
} from 'react';

import { type ImageSourcePropType, Text, TextInput, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

import { type ZoffIconName, zoffIconDefinitions } from '../../shared';
import { NativeIcon } from '../icons/NativeIcon';
import { NativePressable as Pressable } from './NativePressable';

export type NativeControlSize = 'default' | 'large';

export type NativeControlTone = 'primary' | 'secondary' | 'danger';

interface NativeCardProps extends PropsWithChildren {
  className?: string;
  radius?: 'default' | 'large';
  size?: NativeControlSize;
}

export function NativeCard({
  children,
  className,
  radius = 'default',
  size = 'default',
}: NativeCardProps) {
  return (
    <View
      className={classNames(
        'border-native-border bg-native-card/95 dark:border-native-dark-border dark:bg-native-dark-card/95',
        size === 'default' && 'gap-4 border p-4',
        size === 'default' && radius === 'default' && 'rounded-2xl',
        size === 'large' && 'gap-8 border-2 p-10',
        (size === 'large' || radius === 'large') && 'rounded-3xl',
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
        'font-heading',
        'text-native-text dark:text-native-dark-text',
        size === 'default' && 'text-3xl',
        size === 'large' && 'text-5xl',
      )}
    >
      {children}
    </Text>
  );
}

interface NativeButtonProps extends PropsWithChildren {
  surface?: 'solid' | 'glass';
  shape?: 'rounded' | 'pill';
  accessibilityLabel?: string;
  className?: string;
  disabled?: boolean;
  icon?: ZoffIconName;
  iconColor?: string;
  label?: string;
  onPress: () => void;
  pressFeedback?: boolean;
  preferred?: boolean;
  selected?: boolean;
  size?: NativeControlSize;
  tone?: NativeControlTone;
}

export function NativeButton({
  surface = 'solid',
  shape = 'rounded',
  accessibilityLabel,
  children,
  className,
  disabled = false,
  icon,
  iconColor,
  label,
  onPress,
  pressFeedback = false,
  preferred = false,
  selected = false,
  size = 'default',
  tone = 'primary',
}: NativeButtonProps) {
  const [focused, setFocused] = useState(false);
  const resolvedAccessibilityLabel = accessibilityLabel ?? label;
  let resolvedIconColor = iconColor ?? '#e8dff5';

  if (tone === 'primary' && !iconColor)
    resolvedIconColor = shape === 'pill' ? '#120b1e' : '#ffffff';

  if (tone === 'danger') resolvedIconColor = '#d91465';

  return (
    <Pressable
      {...(resolvedAccessibilityLabel && {
        accessibilityLabel: resolvedAccessibilityLabel,
      })}
      accessibilityRole="button"
      accessibilityState={{
        selected,
        disabled,
      }}
      className={classNames(
        'flex-row items-center justify-center border',
        surface === 'solid' && 'active:opacity-70',
        surface === 'glass' && 'border-transparent bg-transparent',
        pressFeedback && 'active:scale-95',
        size === 'default' && 'min-h-13 gap-2 px-4',
        shape === 'pill' && 'rounded-full px-6',
        shape === 'rounded' && size === 'default' && 'rounded-xl',
        size === 'large' && 'min-h-24 gap-5 border-2 px-10 py-5',
        shape === 'rounded' && size === 'large' && 'rounded-2xl',
        surface === 'solid' &&
          tone === 'primary' &&
          'border-primary bg-primary',
        surface === 'solid' &&
          tone === 'danger' &&
          'border-error bg-native-surface dark:bg-native-dark-surface',
        surface === 'solid' &&
          tone === 'secondary' &&
          !selected &&
          'border-native-border bg-native-surface dark:border-native-dark-border dark:bg-native-dark-surface',
        surface === 'solid' &&
          tone === 'secondary' &&
          selected &&
          'border-accent bg-native-surface dark:bg-native-dark-surface',
        focused && 'border-accent bg-accent',
        disabled && 'opacity-40',
        className,
      )}
      disabled={disabled}
      hasTVPreferredFocus={preferred}
      onBlur={() => setFocused(false)}
      onFocus={() => setFocused(true)}
      onPress={onPress}
      {...(focused && {
        style: focusedControlStyle,
      })}
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
            size === 'default' && (shape === 'pill' ? 'text-lg' : 'text-base'),
            size === 'large' && 'text-2xl',
            tone === 'primary' &&
              (shape === 'pill' ? 'text-native-dark-background' : 'text-white'),
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
  shape?: 'rounded' | 'pill';
  accessibilityLabel?: string;
  autoCapitalize?: 'none' | 'sentences' | 'words';
  editable?: boolean;
  inputClassName?: string;
  maxLength?: number;
  multiline?: boolean;
  numberOfLines?: number;
  onChangeText: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
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
  surface?: 'solid' | 'glass';
  shape?: 'rounded' | 'circle';
  accessibilityLabel: string;
  disabled?: boolean;
  icon: ZoffIconName;
  iconColor?: string;
  onPress: () => void;
  pressFeedback?: boolean;
  size?: NativeControlSize;
}

export function NativeIconButton({
  surface = 'solid',
  shape = 'rounded',
  accessibilityLabel,
  disabled = false,
  icon,
  iconColor = '#e8dff5',
  onPress,
  pressFeedback = false,
  size = 'default',
}: NativeIconButtonProps) {
  const [focused, setFocused] = useState(false);

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      className={classNames(
        'items-center justify-center border',
        surface === 'solid' &&
          'border-native-border bg-native-surface active:opacity-70 dark:border-native-dark-border dark:bg-native-dark-surface',
        surface === 'glass' && 'border-transparent bg-transparent',
        pressFeedback && 'active:scale-90',
        size === 'default' && 'size-13',
        shape === 'circle' && 'rounded-full',
        shape === 'rounded' && size === 'default' && 'rounded-xl',
        size === 'large' && 'size-24 border-2',
        shape === 'rounded' && size === 'large' && 'rounded-2xl',
        focused && 'border-accent bg-accent',
        disabled && 'opacity-40',
      )}
      disabled={disabled}
      onBlur={() => setFocused(false)}
      onFocus={() => setFocused(true)}
      onPress={onPress}
      {...(focused && {
        style: focusedControlStyle,
      })}
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
      shape = 'rounded',
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
            'font-heading',
            'border-native-border bg-native-surface text-native-text dark:border-native-dark-border dark:bg-native-dark-surface dark:text-native-dark-text',
            size === 'default' && 'min-h-13 px-4 text-base',
            shape === 'pill' &&
              !props.multiline &&
              'rounded-full border px-5 focus:border-accent',
            shape === 'pill' &&
              props.multiline &&
              'rounded-3xl border px-5 focus:border-accent',
            shape === 'rounded' && size === 'default' && 'rounded-xl',
            size === 'large' && 'min-h-24 border-2 px-8 text-3xl',
            shape === 'rounded' && size === 'large' && 'rounded-2xl',
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
        {...(logo && {
          logo,
        })}
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
const focusedControlStyle = {
  transform: [
    {
      scale: 1.04,
    },
  ],
};
