import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import { CaseProvider } from './contexts/CaseContext';
import { ClientRequestProvider } from './contexts/ClientRequestContext';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <AuthProvider>
      <CaseProvider>
        <ClientRequestProvider>
          <App />
        </ClientRequestProvider>
      </CaseProvider>
    </AuthProvider>
  </React.StrictMode>
);