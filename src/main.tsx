import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ToastProvider } from './contexts/ToastContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <ToastProvider>
      <NotificationProvider>
        <App />
      </NotificationProvider>
    </ToastProvider>
  </ErrorBoundary>
);
