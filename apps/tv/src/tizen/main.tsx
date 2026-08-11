import { createRoot } from 'react-dom/client';
import { TizenApp } from '@/tizen/tizen-app';
import '@/tizen/tizen.css';

const root = document.getElementById('root');
if (!root) throw new Error('error finding Tizen application root');
createRoot(root).render(<TizenApp />);
