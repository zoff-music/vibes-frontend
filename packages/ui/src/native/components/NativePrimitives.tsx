import { classNames } from '@vibes/shared';
import type { PropsWithChildren, ReactNode } from 'react';
import { forwardRef, useState } from 'react';
import type { ImageSourcePropType } from 'react-native';
import { Pressable, Text, TextInput, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import type { ZoffIconName } from '../../shared';
import { zoffIconDefinitions } from '../../shared';
import { NativeIcon } from '../icons/NativeIcon';
import { useNativePresentation } from './NativePresentationContext';

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
  const presentation = useNativePresentation();
  const terminal = presentation === 'terminal';
  return (
    <View
      className={classNames(
        !terminal &&
          'border-native-border bg-native-card/95 dark:border-native-dark-border dark:bg-native-dark-card/95',
        terminal &&
          'border-[#55ffad] bg-[#010c08]/95 shadow-[#31ff9a]/15 shadow-lg',
        size === 'default' && 'gap-4 border p-4',
        size === 'default' && !terminal && 'rounded-2xl',
        size === 'large' && 'gap-8 border-2 p-10',
        size === 'large' && !terminal && 'rounded-3xl',
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
  const terminal = useNativePresentation() === 'terminal';
  return (
    <Text
      className={classNames(
        'font-heading',
        size === 'default' && 'text-sm leading-5',
        size === 'large' && 'text-xl leading-7',
        !terminal && muted && 'text-native-muted dark:text-native-dark-muted',
        !terminal && !muted && 'text-native-text dark:text-native-dark-text',
        terminal && muted && 'text-[#a6ffd0]/65',
        terminal && !muted && 'text-[#dffff0]',
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
  const terminal = useNativePresentation() === 'terminal';
  return (
    <Text
      className={classNames(
        'font-heading',
        !terminal && 'text-native-text dark:text-native-dark-text',
        terminal && 'text-[#dffff0] uppercase tracking-widest',
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
  size = 'default',
  tone = 'primary',
}: NativeButtonProps) {
  const terminal = useNativePresentation() === 'terminal';
  const [focused, setFocused] = useState(false);
  const resolvedAccessibilityLabel = accessibilityLabel ?? label;
  let resolvedIconColor = iconColor ?? '#e8dff5';
  if (tone === 'primary') resolvedIconColor = '#ffffff';
  if (tone === 'danger') resolvedIconColor = '#d91465';
  if (terminal && tone === 'primary') resolvedIconColor = '#03150d';

  return (
    <Pressable
      {...(resolvedAccessibilityLabel && {
        accessibilityLabel: resolvedAccessibilityLabel,
      })}
      accessibilityRole="button"
      className={classNames(
        'flex-row items-center justify-center border active:opacity-70',
        pressFeedback && 'active:scale-95',
        size === 'default' && 'min-h-13 gap-2 px-4',
        size === 'default' && !terminal && 'rounded-xl',
        size === 'large' && 'min-h-24 gap-5 border-2 px-10 py-5',
        size === 'large' && !terminal && 'rounded-2xl',
        !terminal && tone === 'primary' && 'border-primary bg-primary',
        !terminal &&
          tone === 'danger' &&
          'border-error bg-native-surface dark:bg-native-dark-surface',
        !terminal &&
          tone === 'secondary' &&
          'border-native-border bg-native-surface dark:border-native-dark-border dark:bg-native-dark-surface',
        terminal && 'border-[#55ffad] bg-[#010c08]',
        terminal && tone === 'primary' && 'bg-[#71f5ad]',
        focused && 'border-accent bg-accent',
        disabled && 'opacity-40',
        className,
      )}
      disabled={disabled}
      hasTVPreferredFocus={preferred}
      onBlur={() => setFocused(false)}
      onFocus={() => setFocused(true)}
      onPress={onPress}
      {...(focused && { style: focusedControlStyle })}
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
            !terminal && tone === 'primary' && 'text-white',
            !terminal && tone === 'danger' && 'text-error',
            !terminal &&
              tone === 'secondary' &&
              'text-native-text dark:text-native-dark-text',
            terminal && tone !== 'primary' && 'text-[#dffff0]',
            terminal && tone === 'primary' && 'text-[#03150d]',
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
  const terminal = useNativePresentation() === 'terminal';
  const [focused, setFocused] = useState(false);
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      className={classNames(
        'items-center justify-center border active:opacity-70',
        !terminal &&
          'border-native-border bg-native-surface dark:border-native-dark-border dark:bg-native-dark-surface',
        terminal && 'rounded-none border-[#55ffad] bg-[#010c08]',
        pressFeedback && 'active:scale-90',
        size === 'default' && 'size-13',
        size === 'default' && !terminal && 'rounded-xl',
        size === 'large' && 'size-24 border-2',
        size === 'large' && !terminal && 'rounded-2xl',
        focused && 'border-accent bg-accent',
        disabled && 'opacity-40',
      )}
      disabled={disabled}
      onBlur={() => setFocused(false)}
      onFocus={() => setFocused(true)}
      onPress={onPress}
      {...(focused && { style: focusedControlStyle })}
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
    const terminal = useNativePresentation() === 'terminal';
    return (
      <View className={classNames('relative', wrapperClassName)}>
        <TextInput
          {...props}
          ref={ref}
          autoCorrect={false}
          className={classNames(
            'font-heading',
            !terminal &&
              'border-native-border bg-native-surface text-native-text dark:border-native-dark-border dark:bg-native-dark-surface dark:text-native-dark-text',
            terminal && 'border-[#55ffad] bg-[#010c08] text-[#dffff0]',
            size === 'default' && 'min-h-13 px-4 text-base',
            size === 'default' && !terminal && 'rounded-xl',
            size === 'large' && 'min-h-24 border-2 px-8 text-3xl',
            size === 'large' && !terminal && 'rounded-2xl',
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
        {...(logo && { logo })}
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
