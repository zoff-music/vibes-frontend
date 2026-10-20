import { classNames } from '@vibes/shared';
import { GlassView } from 'expo-glass-effect';
import { styled } from 'nativewind';
import type { PropsWithChildren } from 'react';
import { View } from 'react-native';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useThemePreference } from '@/providers/theme-provider';

interface GlassSurfaceProps extends PropsWithChildren {
  colorScheme: 'light' | 'dark';
  tintColor: string;
  style?: { borderRadius?: number };
}

function GlassSurface({ children, ...props }: GlassSurfaceProps) {
  return (
    <GlassView {...props} glassEffectStyle="regular" isInteractive>
      {children}
    </GlassView>
  );
}

const ControlGlass = styled(GlassSurface, { className: 'style' });

interface MobileControlSurfaceProps extends PropsWithChildren {
  enabled: boolean;
  tone?: 'primary' | 'secondary' | 'danger';
}

export function MobileControlSurface({
  children,
  enabled,
  tone = 'secondary',
}: MobileControlSurfaceProps) {
  const [{ resolvedScheme }] = useThemePreference();
  const theme = useAppTheme();
  if (!enabled) return children;
  return (
    <View
      className={classNames(
        'rounded-full',
        tone === 'primary' && 'bg-mobile-primary',
        tone !== 'primary' && 'bg-mobile-surface dark:bg-mobile-dark-surface',
      )}
    >
      <ControlGlass
        className="rounded-full"
        colorScheme={resolvedScheme}
        tintColor={tone === 'primary' ? theme.pink : theme.surface}
      >
        {children}
      </ControlGlass>
    </View>
  );
}
