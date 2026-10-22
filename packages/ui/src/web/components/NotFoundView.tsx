import type { ReactNode } from 'preact/compat';
import { LinkButton } from './LinkButton';
import { VinylRecord } from './VinylRecord';

interface NotFoundViewProps {
  children?: ReactNode;
}

export function NotFoundView({ children }: NotFoundViewProps) {
  return (
    <main className="relative z-10 mx-auto w-full max-w-5xl px-5 py-10 sm:px-6 sm:py-16">
      <section className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="text-center lg:text-left">
          <div
            aria-hidden="true"
            className="mb-6 flex items-center justify-center gap-2 lg:justify-start"
          >
            <span className="font-pixel text-9xl text-theme leading-none">
              4
            </span>
            <VinylRecord playing className="w-28 sm:w-36" />
            <span className="font-pixel text-9xl text-theme leading-none">
              4
            </span>
          </div>
          <p className="font-pixel text-secondary text-xs tracking-label">
            PAGE NOT FOUND
          </p>
          <h1 className="mt-4 font-pixel text-3xl text-theme normal-case sm:text-4xl">
            Lost the page.
            <br />
            Found the beat.
          </h1>
          <p className="mx-auto mt-4 max-w-sm text-theme-muted leading-relaxed lg:mx-0">
            There’s nothing at this address. Head back to the music, or make a
            little of your own.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3 lg:justify-start">
            <LinkButton to="/rooms/explore" variant="primary">
              Find a room
            </LinkButton>
            <LinkButton to="/" variant="tertiary">
              Back home
            </LinkButton>
          </div>
        </div>
        {children}
      </section>
    </main>
  );
}
