import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import '@/i18n';
import '@/index.css';
import { App } from '@/app/App';
import { ReactQueryProvider } from '@/app/ReactQueryProvider';
import { ErrorBoundary } from '@/app/ErrorBoundary';
import { ToastProvider } from '@/components/ui';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ReactQueryProvider>
        <BrowserRouter>
          <ToastProvider>
            <App />
          </ToastProvider>
        </BrowserRouter>
      </ReactQueryProvider>
    </ErrorBoundary>
  </React.StrictMode>,
);
