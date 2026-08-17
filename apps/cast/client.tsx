import { applyConsoleLogGuard, isTruthyFlag, safeWrap } from '@vibes/shared';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './src/styles/index.css';
import { App } from './src/App';

const debugEnabled = isTruthyFlag(import.meta.env.VITE_DEBUG);
applyConsoleLogGuard(debugEnabled);

// Wrap initialization in safeWrap to report errors
const [err] = safeWrap(() => {
  const rootElement = document.getElementById('root');
  if (!rootElement) throw new Error('Cast receiver root is unavailable.');

  const loadingElement = document.getElementById('static-loading');
  if (loadingElement) loadingElement.classList.add('hidden');

  const root = createRoot(rootElement);
  root.render(
    <StrictMode>
      <div className="hidden p-4">Debug</div>
      <App />
    </StrictMode>,
  );
});

if (err) {
  console.error('The Cast receiver failed during startup.');
  const errDiv = document.createElement('div');
  errDiv.className =
    'cast-shell flex h-screen w-screen items-center justify-center px-8 text-center font-display text-3xl text-theme';
  errDiv.textContent =
    'The Zoff receiver could not start. Reload to try again.';
  document.body.replaceChildren(errDiv);
}
