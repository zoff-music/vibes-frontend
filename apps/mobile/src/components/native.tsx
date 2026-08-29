import {
  NativeButton,
  NativeCard,
  NativeCopy,
  NativeField,
  NativeHeading,
  NativeIconButton,
  useNativePresentation,
} from '@vibes/ui/native';
import { vars } from 'nativewind';
import type { PropsWithChildren, ReactNode } from 'react';
import {
  ActivityIndicator,
  Platform,
  useWindowDimensions,
  View,
} from 'react-native';
import { NativeRetroGrid } from '@/components/native-retro-grid';
import type { ZoffIconName } from '@/components/zoff-icon';
import { terminalThemeVariables } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';
import {
  tabletNavigationHeight,
  useTabletLandscapeLayout,
} from '@/hooks/use-tablet-landscape-layout';
import { triggerSelectionFeedback } from '@/lib/interaction-feedback';

interface ScreenProps extends PropsWithChildren {
  gridPaused?: boolean;
}

export function Screen({ children, gridPaused = false }: ScreenProps) {
  const terminal = useNativePresentation() === 'terminal';
  const terminalVariables = vars(terminalThemeVariables);
  const tabletLayout = useTabletLandscapeLayout();
  const reservesTabletNavigation =
    Platform.OS === 'android' && tabletLayout.isTablet;
  return (
    <View
      className={
        terminal
          ? 'flex-1 overflow-hidden bg-[#010705]'
          : 'flex-1 overflow-hidden bg-mobile-background dark:bg-mobile-dark-background'
      }
      {...(terminal
        ? {
            style: [terminalVariables, terminalScreenBackgroundStyle],
          }
        : {})}
    >
      <NativeRetroGrid paused={gridPaused} />
      {terminal && (
        <View
          className="pointer-events-none absolute inset-0 z-10 opacity-20"
          pointerEvents="none"
        >
          {terminalScanLines.map((top) => (
            <View
              className="absolute inset-x-0 h-px bg-[#8cffc5]/20"
              key={top}
              style={{ top }}
            />
          ))}
        </View>
      )}
      <View
        className="z-20 flex-1"
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
  feedback = false,
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
      onPress={() => {
        if (feedback) void triggerSelectionFeedback();
        onPress();
      }}
      pressFeedback={feedback}
      size={size}
    />
  );
}

export function Button({
  accessibilityLabel,
  disabled,
  feedback = false,
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
      onPress={() => {
        if (feedback) void triggerSelectionFeedback();
        onPress();
      }}
      pressFeedback={feedback}
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

const terminalScreenBackgroundStyle = { backgroundColor: '#010705' };

const tabletWidth = 768;
const tabletContentColumnStyle = {
  alignSelf: 'center' as const,
  maxWidth: 760,
};

const terminalScanLines = Array.from({ length: 260 }, (_, index) => index * 4);
