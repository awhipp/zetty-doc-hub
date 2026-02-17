import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import AppRouter from './AppRouter';
import './index.css';

async function bootstrap() {
  // Start MSW service worker — this intercepts all /api/docs/* calls
  // and serves content from the build-time manifest.
  //
  // To migrate to a real backend: remove this block and point
  // the API_BASE in docsApi.ts to your Lambda / API Gateway.
  const { worker } = await import('./mocks/browser');
  await worker.start({
    onUnhandledRequest: 'bypass',
    serviceWorker: {
      url: `${import.meta.env.BASE_URL}mockServiceWorker.js`,
    },
  });

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <AppRouter />
    </StrictMode>,
  );
}

bootstrap();
