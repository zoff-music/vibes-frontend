/// <reference path="../../shared/assets.d.ts" />
import themeScriptUrl from '../theme-init.js?no-inline&url';

interface ThemeScriptProps {
  nonce?: string;
}

export function ThemeScript({ nonce }: ThemeScriptProps) {
  return <script src={themeScriptUrl} {...(nonce && { nonce })} />;
}
