import { NativeAnimatedLogo } from '@vibes/ui/native';

import { useAppTheme } from '@/hooks/use-app-theme';

export function AnimatedLogo() {
  const theme = useAppTheme();

  return (
    <NativeAnimatedLogo
      accentColor={theme.accent}
      baseColor={theme.text}
      pinkColor={theme.pink}
    />
  );
}
