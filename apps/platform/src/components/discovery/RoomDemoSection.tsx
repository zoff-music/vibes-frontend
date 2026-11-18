import { DeferredContent } from '@vibes/ui/web';
import { lazy } from 'preact/compat';
import { LiveRoomDemoPlaceholder } from '../seo/LiveRoomDemoPlaceholder';
import { GuideLink } from './FeatureSection';

const LazyLiveRoomDemo = lazy(() =>
  import('../seo/LiveRoomDemo').then((module) => ({
    default: module.LiveRoomDemo,
  })),
);

interface RoomDemoSectionProps {
  watch?: boolean;
}

// The homepage's full-width look inside a real room.
export function RoomDemoSection({ watch = false }: RoomDemoSectionProps) {
  return (
    <section
      id="inside-a-room"
      aria-labelledby="inside-a-room-heading"
      className="scroll-mt-8 py-16 sm:py-20"
    >
      <div className="grid items-end gap-6 lg:grid-cols-5 lg:gap-14">
        <div className="min-w-0 lg:col-span-3">
          <h2
            id="inside-a-room-heading"
            className="font-pixel text-3xl leading-tight tracking-tight normal-case sm:text-4xl"
          >
            {watch ? 'One video, every screen.' : 'One queue, every screen.'}
          </h2>
        </div>
        <div className="min-w-0 lg:col-span-2">
          <p className="text-theme-muted max-w-xl leading-relaxed sm:text-lg">
            {watch
              ? 'Everyone opens the same link and watches the same YouTube video at the same moment. Add videos, vote on what plays next and chat, on any screen.'
              : 'Everyone opens the same link and hears the same song at the same moment. Add from YouTube and SoundCloud, vote on what plays next, on any screen.'}
          </p>
          <GuideLink to={watch ? '/discovery/watching' : '/discovery/queue'}>
            {watch
              ? 'How watching together works'
              : 'How the shared queue works'}
          </GuideLink>
        </div>
      </div>
      <div className="mx-auto mt-10 max-w-5xl min-w-0">
        <DeferredContent fallback={<LiveRoomDemoPlaceholder />}>
          <LazyLiveRoomDemo watch={watch} />
        </DeferredContent>
      </div>
    </section>
  );
}
