import { useId, useRef, useState } from 'preact/compat';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { InfoIcon } from '../icons';

interface YouTubeErrorOverlayProps {
  code: string;
  videoId: string;
}

export function YouTubeErrorOverlay({
  code,
  videoId,
}: YouTubeErrorOverlayProps) {
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const titleId = useId();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const browserBlocked = code === '153';

  return (
    <>
      <div
        role="alert"
        className="absolute inset-0 z-20 flex items-center justify-center bg-black px-6 py-4 text-center"
      >
        <div className="flex max-w-sm flex-col items-center gap-3">
          <p className="font-mono text-sm tracking-widest text-white uppercase">
            {browserBlocked
              ? 'Browser blocked by YouTube'
              : 'This video is unavailable in the embedded player.'}
          </p>
          {browserBlocked && (
            <p className="text-sm text-white/70">
              YouTube could not identify the site embedding this player.
            </p>
          )}
          <button
            type="button"
            aria-label="About YouTube playback errors"
            aria-haspopup="dialog"
            onClick={() => setIsHelpOpen(true)}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/30 text-white/80 transition-colors hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black focus-visible:outline-none"
          >
            <InfoIcon aria-hidden="true" className="h-5 w-5" />
          </button>
        </div>
      </div>
      <Modal
        ariaLabelledBy={titleId}
        initialFocusRef={headingRef}
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      >
        <div className="text-theme space-y-5">
          <h2
            id={titleId}
            ref={headingRef}
            tabIndex={-1}
            className="font-display text-xl focus:outline-none"
          >
            YouTube playback blocked
          </h2>
          {browserBlocked && (
            <p className="text-theme-muted text-sm leading-relaxed">
              YouTube reported error 153: the request is missing the HTTP
              Referer header or equivalent information identifying this site.
              This can happen when a browser, extension, or network tool strips
              or changes request headers.
            </p>
          )}
          {!browserBlocked && (
            <p className="text-theme-muted text-sm leading-relaxed">
              The video may be unavailable or restricted from embedded playback.
              YouTube can also block playback in a particular browser or
              network. This error alone does not tell us whether a sign-in or
              bot check caused the problem.
            </p>
          )}
          <div className="space-y-2">
            <h3 className="font-medium">
              Asked to sign in to confirm you’re not a bot?
            </h3>
            <p className="text-theme-muted text-sm leading-relaxed">
              That check comes from YouTube. Browser identification, blocked
              cookies, privacy extensions, or a VPN or shared network may be
              involved. Built-in browsers and webviews—including proprietary car
              browsers—can behave differently from an up-to-date desktop or
              phone browser. We cannot confirm which cause applies here.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-medium">What you can try</h3>
            <ul className="text-theme-muted list-disc space-y-2 pl-5 text-sm leading-relaxed">
              <li>
                Open the video on YouTube and follow any sign-in prompt there.
              </li>
              <li>
                Try this room in an up-to-date browser on your phone or
                computer.
              </li>
              <li>
                Check whether privacy extensions or network tools are blocking
                YouTube cookies or removing request headers.
              </li>
            </ul>
            <p className="text-theme-muted text-sm">
              Zoff cannot bypass YouTube’s checks. You can still use the room
              controls to skip this video.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <a
              href={`https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`}
              target="_blank"
              rel="noopener"
              className="text-primary focus-visible:ring-primary rounded underline underline-offset-4 focus-visible:ring-2 focus-visible:outline-none"
            >
              Open on YouTube
            </a>
            <Button onClick={() => setIsHelpOpen(false)}>Got it</Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
