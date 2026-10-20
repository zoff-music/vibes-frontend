import { classNames } from '@vibes/shared';
import {
  NativeButton,
  NativeCard,
  NativeCopy,
  NativeField,
  NativeHeading,
  NativeIconButton,
} from '@vibes/ui/native';
import {
  type ComponentProps,
  forwardRef,
  type PropsWithChildren,
  type ReactNode,
} from 'react';
import {
  ActivityIndicator,
  Platform,
  type TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { MobileControlSurface } from '@/components/mobile-control-surface';
import { NativeRetroGrid } from '@/components/native-retro-grid';
import type { ZoffIconName } from '@/components/zoff-icon';
import { useAppTheme } from '@/hooks/use-app-theme';
import {
  tabletNavigationHeight,
  useTabletLandscapeLayout,
} from '@/hooks/use-tablet-landscape-layout';
import { useControlMaterial } from '@/providers/control-material-provider';

interface ScreenProps extends PropsWithChildren {
  gridPaused?: boolean;
  showGrid?: boolean;
}

export function Screen({
  children,
  gridPaused = false,
  showGrid = true,
}: ScreenProps) {
  const tabletLayout = useTabletLandscapeLayout();
  const reservesTabletNavigation =
    Platform.OS === 'android' && tabletLayout.isTablet;

  return (
    <View className="flex-1 overflow-hidden bg-mobile-background dark:bg-mobile-dark-background">
      {showGrid && <NativeRetroGrid paused={gridPaused} />}

      <View
        className="z-20 flex-1"
        {...(reservesTabletNavigation && {
          style: {
            paddingTop: tabletNavigationHeight,
          },
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
      className={classNames(
        'w-full',
        width >= tabletWidth && 'max-w-190 self-center',
      )}
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
  feedback?: boolean;
  icon?: ZoffIconName;
  label: string;
  onPress: () => void;
  tone?: 'primary' | 'secondary' | 'danger';
}

interface IconButtonProps {
  accessibilityLabel: string;
  disabled?: boolean;
  feedback?: boolean;
  icon: ZoffIconName;
  size?: 'default' | 'large';
  onPress: () => void;
}

export function IconButton({
  accessibilityLabel,
  disabled,
  feedback = true,
  icon,
  size = 'default',
  onPress,
}: IconButtonProps) {
  const theme = useAppTheme();
  const glass = useControlMaterial() && !disabled;

  return (
    <MobileControlSurface enabled={glass}>
      <NativeIconButton
        surface={glass ? 'glass' : 'solid'}
        shape="circle"
        accessibilityLabel={accessibilityLabel}
        disabled={disabled}
        icon={icon}
        iconColor={theme.text}
        onPress={onPress}
        pressFeedback={feedback && !glass}
        size={size}
      />
    </MobileControlSurface>
  );
}

export function Button({
  accessibilityLabel,
  disabled,
  feedback = true,
  icon,
  label,
  onPress,
  tone = 'primary',
}: ButtonProps) {
  const theme = useAppTheme();
  const glass = useControlMaterial() && !disabled;
  let iconColor: string = theme.text;

  if (tone === 'primary') {
    iconColor = '#120b1e';
  }

  if (tone === 'danger') {
    iconColor = theme.danger;
  }

  return (
    <MobileControlSurface enabled={glass} tone={tone}>
      <NativeButton
        surface={glass ? 'glass' : 'solid'}
        shape="pill"
        accessibilityLabel={accessibilityLabel ?? label}
        disabled={disabled}
        icon={icon}
        iconColor={iconColor}
        label={label}
        onPress={onPress}
        pressFeedback={feedback && !glass}
        tone={tone}
      />
    </MobileControlSurface>
  );
}

export const Field = forwardRef<TextInput, ComponentProps<typeof NativeField>>(
  function Field(props, ref) {
    return <NativeField {...props} shape="pill" ref={ref} />;
  },
);

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
