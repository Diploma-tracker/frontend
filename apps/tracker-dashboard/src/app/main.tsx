// sort-imports-ignore
import './config/store/store-utils';

import ReactDOM from 'react-dom/client';

import '@repo/ui-kit/styles.css';
import './styles/index.css';
import { ProvidersWrapper } from './providers';

const rootElement = document.getElementById('root')!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<ProvidersWrapper />);
}
