import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/globals.css';
import App from './App';

// Apply saved theme before first render to prevent flash
try {
  const saved = JSON.parse(localStorage.getItem('admin-theme') || '{}');
  if (saved?.state?.isDark) document.documentElement.classList.add('dark');
} catch {}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
