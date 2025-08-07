import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

const container = document.getElementById('root');
const root = createRoot(container!); // The ! tells TypeScript we're sure container exists

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you're keeping web vitals, uncomment this:
// import reportWebVitals from './reportWebVitals';
// reportWebVitals();