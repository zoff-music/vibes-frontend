import { Link } from '@kasperrt/smolter/preact';
import { classNames } from '@vibes/shared';
import { Component, createRef, type ReactNode } from 'react';
import { CloseIcon } from '../icons';
import { IconButton } from './IconButton';

interface PersistentPlayerFrameProps {
  children: ReactNode;
  minimized: boolean;
  persistent?: boolean;
  roomName: string;
  roomHref: string;
  onClose: () => void;
}

export class PersistentPlayerFrame extends Component<
  PersistentPlayerFrameProps,
  { hydrated: boolean }
> {
  override state = { hydrated: false };
  private frame = createRef<HTMLDivElement>();
  private motion?: Animation;

  private motionPreference?: MediaQueryList;
  private onMotionChange = () => {
    if (this.motionPreference?.matches) {
      this.motion?.cancel();
      this.motion = undefined;
      this.frame.current?.removeAttribute('data-player-in-flight');
    }
  };

  override componentDidMount() {
    this.motionPreference = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    );
    this.motionPreference.addEventListener('change', this.onMotionChange);
    this.setState({ hydrated: true });
  }

  override getSnapshotBeforeUpdate(previous: PersistentPlayerFrameProps) {
    if (
      previous.minimized === this.props.minimized ||
      previous.roomHref !== this.props.roomHref ||
      this.motionPreference?.matches
    )
      return null;
    // Read the visible bounds before the route swaps layouts, including any
    // in-flight transform when the listener reverses direction.
    return (
      this.frame.current
        ?.querySelector('[data-player-viewport]')
        ?.getBoundingClientRect() ?? null
    );
  }

  override componentDidUpdate(
    _previous: PersistentPlayerFrameProps,
    _state: { hydrated: boolean },
    from: DOMRect | null,
  ) {
    const frame = this.frame.current;
    if (!from || !frame) return;
    this.motion?.cancel();
    frame.removeAttribute('data-player-in-flight');
    const viewport = frame.querySelector<HTMLElement>('[data-player-viewport]');
    if (!viewport) return;
    const to = viewport.getBoundingClientRect();
    if (!from.width || !from.height || !to.width || !to.height) return;

    // The iframe takes its destination layout once. Only its ancestor's
    // compositor transform changes during flight.
    const target = this.props.minimized ? frame : viewport;
    const origin = target === viewport ? to : target.getBoundingClientRect();
    // Align video centers, allowing the letterbox height to change without
    // stretching the picture or the compact player's title.
    const scale = from.width / to.width;
    const x = from.left - origin.left - (to.left - origin.left) * scale;
    const y =
      from.top +
      from.height / 2 -
      origin.top -
      (to.top + to.height / 2 - origin.top) * scale;
    const transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
    const root = document.documentElement;
    if (root.classList.contains('scene-player')) {
      // The live destination image travels independently above the circular reveal.
      root.style.setProperty('--player-flight-from', transform);
      return;
    }
    const motion = target.animate([{ transform }, { transform: 'none' }], {
      duration: 260,
      easing: 'cubic-bezier(0.22, 0.75, 0.25, 1)',
    });
    this.motion = motion;
    frame.setAttribute('data-player-in-flight', '');
    motion.onfinish = () => {
      if (this.motion === motion) {
        frame.removeAttribute('data-player-in-flight');
        this.motion = undefined;
      }
    };
  }

  override componentWillUnmount() {
    this.motionPreference?.removeEventListener('change', this.onMotionChange);
    this.motion?.cancel();
  }

  override render() {
    const {
      children,
      minimized,
      persistent = false,
      roomName,
      roomHref,
      onClose,
    } = this.props;
    return (
      <div
        ref={this.frame}
        className={classNames(
          'group/player origin-top-left',
          minimized &&
            'fixed right-4 bottom-4 z-40 w-96 max-w-[calc(100vw-2rem)] overflow-hidden rounded-3xl border border-theme bg-theme-surface p-2 shadow-2xl [view-transition-name:persistent-player] sm:right-6 sm:bottom-6',
        )}
        data-player-persistent={this.state.hydrated && persistent}
        data-minimized={minimized}
      >
        {minimized && (
          <div
            data-room-player-header
            className="flex min-h-11 items-center gap-2 pr-0.5 pb-1.5 pl-2"
          >
            <span
              aria-hidden="true"
              className="bg-secondary shadow-secondary-strong size-2 shrink-0 rounded-full motion-safe:animate-pulse"
            />
            <Link
              className="text-theme hover:text-secondary focus-visible:ring-secondary flex min-h-11 min-w-0 flex-1 items-center rounded-md px-1 text-left text-base font-bold transition-colors focus-visible:ring-2 focus-visible:outline-none"
              title={roomName}
              to={roomHref}
              prefetch="intent"
            >
              <span className="truncate">{roomName}</span>
            </Link>
            <IconButton
              aria-label="Close persistent player and leave room"
              onClick={onClose}
              variant="ghost"
            >
              <CloseIcon className="h-4 w-4" />
            </IconButton>
          </div>
        )}
        <div className="relative">{children}</div>
      </div>
    );
  }
}
