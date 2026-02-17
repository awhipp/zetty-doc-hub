import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SiteConfigProvider } from '@/contexts/SiteConfigContext';
import App from '@/App';

export default function AppRouter() {
  const basePath = import.meta.env.VITE_BASE_PATH || '/';

  return (
    <BrowserRouter basename={basePath}>
      <SiteConfigProvider>
        <Routes>
          <Route path="/*" element={<App />} />
        </Routes>
      </SiteConfigProvider>
    </BrowserRouter>
  );
}
