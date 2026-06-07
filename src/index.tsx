import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AppProvider } from './contexts/AppContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';
import './pwa-register';
import './index.css';
import '@fontsource-variable/geist';
import '@fontsource/geist-mono';
import ErrorBoundary from './components/ErrorBoundary';

// Force cache clearing for stubborn browsers
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
      registration.unregister();
    }
  });
}
if (!localStorage.getItem('force_cache_clear_v4')) {
  localStorage.setItem('force_cache_clear_v4', 'true');
  // Clear caches API
  if ('caches' in window) {
    caches.keys().then((names) => {
      names.forEach(name => {
        caches.delete(name);
      });
    });
  }
  // Hard reload
  window.location.href = window.location.href + (window.location.href.includes('?') ? '&' : '?') + 'nocache=' + new Date().getTime();
}

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <ToastProvider>
          <AppProvider>
            <App />
          </AppProvider>
        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </React.StrictMode>
);