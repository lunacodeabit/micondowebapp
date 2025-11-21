import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './src/App';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);

// Lucide icons are now created by the Icon component's useEffect.
