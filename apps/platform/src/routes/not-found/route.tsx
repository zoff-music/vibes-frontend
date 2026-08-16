import { NotFoundView } from '@vibes/ui/web';
import { lazy, Suspense } from 'react';
import { Link } from 'react-router';
import { useKonamiMode } from '../../components/konami/KonamiModeContext';
import { notFoundLoader } from './loader';
import { notFoundMeta } from './meta';

const LazyTerminalShell = lazy(() =>
  import('../../components/konami/TerminalShell').then((module) => ({
    default: module.TerminalShell,
  })),
);

export const loader = notFoundLoader;

export const meta = notFoundMeta;

export default function NotFound() {
  const terminalMode = useKonamiMode();

  if (terminalMode) {
    return (
      <Suspense fallback={null}>
        <LazyTerminalShell channel="FAULT MONITOR" title="404 / SIGNAL LOST">
          <section className="flex flex-1 flex-col items-center justify-center border border-[#71f5ad]/30 bg-[#020e09]/80 p-8 text-center">
            <p className="font-mono text-[#ff8e8e] text-xs uppercase tracking-[0.18em]">
              FATAL: REQUESTED CHANNEL DOES NOT EXIST
            </p>
            <pre className="my-8 text-[#71f5ad] text-sm leading-6" aria-hidden>
              {'[ 404 ]\nNO CARRIER\nSIGNAL TERMINATED'}
            </pre>
            <Link
              className="border border-[#71f5ad]/55 bg-[#071b12] px-4 py-2.5 font-mono text-[#b9ffda] text-xs uppercase hover:border-[#a6ffd0]"
              to="/"
            >
              [ RETURN TO DIRECTORY ]
            </Link>
          </section>
        </LazyTerminalShell>
      </Suspense>
    );
  }

  return <NotFoundView />;
}
