import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import ProjectApp from './ProjectApp.tsx';
import { ErrorBoundary } from './ErrorBoundary.tsx';
import './index.css';

const isLegacy = typeof window !== 'undefined' && window.location.search.includes('app=legacy');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      {isLegacy ? <App /> : <ProjectApp />}
    </ErrorBoundary>
  </StrictMode>,
);
