import { Buffer } from 'buffer';
import process from 'process';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { LanguageProvider } from './components/LanguageProvider';

// Make Buffer and process available globally
window.Buffer = Buffer;
window.process = process;
window.global = window;
ReactDOM.createRoot(document.getElementById('root')).render(
  <LanguageProvider>
    <App />
  </LanguageProvider>
);



