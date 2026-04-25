// sort-imports-ignore
import './config/store/store-utils';
import './config/i18n';

import ReactDOM from 'react-dom/client';

import '@repo/ui-kit/styles.css';
import './styles/index.css';
import './api';
import { ProvidersWrapper } from './providers';

const rootElement = document.getElementById('root')!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<ProvidersWrapper />);
}
