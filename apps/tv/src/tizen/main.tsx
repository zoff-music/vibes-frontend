import { createRoot } from 'react-dom/client';
import { TizenApp } from '@/tizen/tizen-app';
import { TizenErrorBoundary } from '@/tizen/tizen-error-boundary';
import '@/tizen/tizen.css';

let rootElement = document.getElementById('root');
if (!rootElement) {
  rootElement = document.createElement('div');
  rootElement.id = 'root';
  document.body.appendChild(rootElement);
}
createRoot(rootElement).render(
  <TizenErrorBoundary>
    <TizenApp />
  </TizenErrorBoundary>,
);
