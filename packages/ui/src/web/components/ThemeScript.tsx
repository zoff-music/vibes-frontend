/// <reference path="../../shared/assets.d.ts" />
import themeScript from '../theme-init.js?raw';

interface ThemeScriptProps {
  nonce?: string;
}

export function ThemeScript({ nonce }: ThemeScriptProps) {
  // Resolve automatic mode, including Tailwind dark variants, before styles paint without a blocking round trip.
  // theme-init.js is inlined verbatim, so keep comments here rather than in that file.
  return (
    <script
      {...(nonce && { nonce })}
      // biome-ignore lint/security/noDangerouslySetInnerHtml: static, build-owned theme bootstrap; never user content
      dangerouslySetInnerHTML={{ __html: themeScript }}
    />
  );
}
