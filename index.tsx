import React from 'react';
import ReactDOM from 'react-dom/client';
// FIX: The error "Module has no default export" indicates that the App component is not exported as a default. Changed to a named import.
import { App } from './App';
import { LanguageProvider } from './i18n';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </React.StrictMode>
);