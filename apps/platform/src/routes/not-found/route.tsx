import {
  TerminalFeedback,
  TerminalSection,
  terminalButtonClassName,
} from '@vibes/ui/konami';
import { NotFoundView } from '@vibes/ui/web';
import { lazy, Suspense } from 'react';
import { Link } from 'react-router';
import { useKonamiMode } from '../../components/konami/KonamiModeContext';
import { notFoundLoader } from './loader';
import { notFoundMeta } from './meta';

const LazyTerminalShell = lazy(() =>
  import('@vibes/ui/konami').then((module) => ({
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
          <TerminalSection
            className="flex flex-1 flex-col justify-center text-center"
            contentClassName="flex flex-col items-center p-8"
            label="FAULT REPORT"
            status="404"
          >
            <TerminalFeedback tone="error">
              FATAL: REQUESTED CHANNEL DOES NOT EXIST
            </TerminalFeedback>
            <pre className="my-8 text-[#71f5ad] text-sm leading-6" aria-hidden>
              {'[ 404 ]\nNO CARRIER\nSIGNAL TERMINATED'}
            </pre>
            <Link
              className={terminalButtonClassName({
                className: 'px-4 py-2.5',
              })}
              to="/"
            >
              [ RETURN TO DIRECTORY ]
            </Link>
          </TerminalSection>
        </LazyTerminalShell>
      </Suspense>
    );
  }

  return <NotFoundView />;
}
