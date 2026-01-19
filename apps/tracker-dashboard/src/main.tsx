import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import '@repo/ui-kit/styles.css';

import App from './components/App.tsx';
import './styles/index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
