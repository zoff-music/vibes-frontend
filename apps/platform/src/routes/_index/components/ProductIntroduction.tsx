import { ArrowRightIcon } from '@vibes/ui/web';
import { Link } from 'react-router';
import { ProductLinks } from '../../../components/seo/ProductLinks';
import { ProductScreenshots } from '../../../components/seo/ProductScreenshots';

export function ProductIntroduction() {
  return (
    <div className="product-content mx-auto w-full max-w-6xl text-theme">
      <section
        id="how-it-works"
        aria-labelledby="how-it-works-heading"
        className="scroll-mt-6 py-10 sm:py-16"
      >
        <div className="mb-7 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="font-pixel text-2xs text-secondary tracking-label">
              PRESS PLAY, TOGETHER
            </p>
            <h2
              id="how-it-works-heading"
              className="mt-3 font-pixel text-2xl normal-case tracking-tight sm:text-3xl"
            >
              Three steps. Endless good finds.
            </h2>
          </div>
          <span className="text-sm text-theme-muted">
            No downloads needed to start.
          </span>
        </div>
        <ol className="grid gap-6 border-theme border-t pt-6 sm:grid-cols-3 sm:gap-8">
          {steps.map((step) => (
            <li key={step.number} className="flex gap-4">
              <span
                aria-hidden="true"
                className="pt-1 font-pixel text-primary text-sm"
              >
                {step.number}
              </span>
              <div>
                <h3 className="font-pixel text-lg normal-case tracking-normal">
                  {step.title}
                </h3>
                <p className="mt-2 max-w-sm text-sm text-theme-muted leading-relaxed">
                  {step.description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section
        aria-labelledby="shared-queue-heading"
        className="grid items-center gap-7 pb-12 sm:gap-10 sm:pb-16 lg:grid-cols-12"
      >
        <div className="min-w-0 lg:col-span-7">
          <ProductScreenshots />
        </div>
        <div className="lg:col-span-5">
          <p className="font-pixel text-2xs text-primary tracking-label">
            LESS “PASS THE AUX”
          </p>
          <h2
            id="shared-queue-heading"
            className="mt-3 font-pixel text-3xl normal-case tracking-tight"
          >
            A queue with more
            <br className="hidden sm:block" /> than one DJ.
          </h2>
          <p className="mt-4 text-theme-muted leading-relaxed">
            Add the track you cannot stop playing. Discover the one your friend
            swears by. Zoff brings everyone’s picks into one shared music queue,
            with votes to help shape what plays next.
          </p>
          <p className="mt-3 text-sm text-theme-muted leading-relaxed">
            Keep playback synchronized across devices, or let a host lead. Room
            controls decide who can add and skip, so the soundtrack stays
            collaborative, not chaotic.
          </p>
          <Link
            className={storyLinkClassName}
            to="/discover/shared-music-queue"
          >
            Explore the shared queue{' '}
            <ArrowRightIcon className="h-4 w-4 shrink-0" />
          </Link>
        </div>
      </section>

      <section
        aria-labelledby="devices-heading"
        className="panel-surface grid items-center gap-8 overflow-hidden rounded-frame border border-theme p-6 sm:p-8 lg:grid-cols-2 lg:gap-12 lg:p-10"
      >
        <div>
          <p className="font-pixel text-2xs text-secondary tracking-label">
            SAME ROOM. YOUR SCREEN.
          </p>
          <h2
            id="devices-heading"
            className="mt-3 font-pixel text-3xl normal-case tracking-tight"
          >
            From your pocket
            <br />
            to the party.
          </h2>
          <p className="mt-4 text-theme-muted leading-relaxed">
            Search for a song on your phone. Put the room on a supported TV.
            Pair a remote and leave the player by the speakers. The queue
            travels with your group, not with one person’s device.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <span className="rounded-full border border-theme px-3 py-1.5 text-theme-muted text-xs">
              Web
            </span>
            <span className="rounded-full border border-theme px-3 py-1.5 text-theme-muted text-xs">
              iOS
            </span>
            <span className="rounded-full border border-theme px-3 py-1.5 text-theme-muted text-xs">
              Android
            </span>
            <span className="rounded-full border border-theme px-3 py-1.5 text-theme-muted text-xs">
              Android TV
            </span>
          </div>
          <Link className={storyLinkClassName} to="/discover/apps">
            Find your app <ArrowRightIcon className="h-4 w-4 shrink-0" />
          </Link>
        </div>
        <div className="min-w-0">
          <ProductScreenshots kind="apps" />
        </div>
      </section>

      <section
        aria-labelledby="find-your-moment-heading"
        className="pt-12 pb-4 sm:pt-16"
      >
        <p className="font-pixel text-2xs text-primary tracking-label">
          THERE’S A ROOM FOR THAT
        </p>
        <div className="mt-3 mb-6 flex flex-wrap items-end justify-between gap-3">
          <h2
            id="find-your-moment-heading"
            className="font-pixel text-2xl normal-case tracking-tight sm:text-3xl"
          >
            Choose your setup.
          </h2>
          <p className="max-w-xl text-sm text-theme-muted leading-relaxed">
            Listening remotely, hosting a party, or setting up a TV? Start with
            the guide for your session.
          </p>
        </div>
        <ProductLinks />
      </section>
    </div>
  );
}

const storyLinkClassName =
  'mt-5 flex min-h-12 w-full cursor-pointer items-center justify-between gap-4 rounded-xl border border-theme px-4 py-3 text-sm text-theme transition-colors hover:border-secondary/60 hover:bg-theme-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary';

const steps = [
  {
    number: '01',
    title: 'Make a room',
    description:
      'Choose a name and your room controls. Start listening in your browser, without creating a Zoff account.',
  },
  {
    number: '02',
    title: 'Bring your people',
    description:
      'Share the room link. Friends can join from their own devices, whether they are beside you or miles away.',
  },
  {
    number: '03',
    title: 'Find your next track',
    description:
      'Search enabled providers like YouTube and SoundCloud, add songs and vote. Music plays through each provider’s official player.',
  },
];
