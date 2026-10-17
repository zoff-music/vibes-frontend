import { classNames } from '@vibes/shared';

import {
  forwardRef,
  type PropsWithChildren,
  type ReactNode,
  useState,
} from 'react';

import {
  type ImageSourcePropType,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';

import { type ZoffIconName, zoffIconDefinitions } from '../../shared';
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
        size === 'default' && 'gap-4 border p-4',
        size === 'default' && 'rounded-2xl',
        size === 'large' && 'gap-8 border-2 p-10',
        size === 'large' && 'rounded-3xl',
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

  if (tone === 'primary') resolvedIconColor = '#ffffff';

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
        'flex-row items-center justify-center border active:opacity-70',
        pressFeedback && 'active:scale-95',
        size === 'default' && 'min-h-13 gap-2 px-4',
        size === 'default' && 'rounded-xl',
        size === 'large' && 'min-h-24 gap-5 border-2 px-10 py-5',
        size === 'large' && 'rounded-2xl',
        tone === 'primary' && 'border-primary bg-primary',
        tone === 'danger' &&
          'border-error bg-native-surface dark:bg-native-dark-surface',
        tone === 'secondary' &&
          !selected &&
          'border-native-border bg-native-surface dark:border-native-dark-border dark:bg-native-dark-surface',
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
  accessibilityLabel: string;
  disabled?: boolean;
  icon: ZoffIconName;
  iconColor?: string;
  onPress: () => void;
  pressFeedback?: boolean;
  size?: NativeControlSize;
}

export function NativeIconButton({
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
        'items-center justify-center border active:opacity-70',
        'border-native-border bg-native-surface dark:border-native-dark-border dark:bg-native-dark-surface',
        pressFeedback && 'active:scale-90',
        size === 'default' && 'size-13',
        size === 'default' && 'rounded-xl',
        size === 'large' && 'size-24 border-2',
        size === 'large' && 'rounded-2xl',
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
            size === 'default' && 'rounded-xl',
            size === 'large' && 'min-h-24 border-2 px-8 text-3xl',
            size === 'large' && 'rounded-2xl',
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
