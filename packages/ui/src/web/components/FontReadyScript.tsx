interface FontReadyScriptProps {
  nonce?: string;
}

// Paint once the preloaded pixel font is ready (or after 3 s) so text never re-flows when it swaps in;
// a swap after first paint registers as layout shift. Place after the stylesheet that declares the face.
const fontReady =
  "(()=>{const d=document.documentElement,f=document.fonts;if(!f?.load)return;d.style.visibility='hidden';const s=()=>{d.style.visibility=''};setTimeout(s,3000);f.load('1em MSW98UI').then(s,s)})()";

export function FontReadyScript({ nonce }: FontReadyScriptProps) {
  return (
    <script
      {...(nonce && { nonce })}
      // biome-ignore lint/security/noDangerouslySetInnerHtml: static, build-owned font gate; never user content
      dangerouslySetInnerHTML={{ __html: fontReady }}
    />
  );
}
