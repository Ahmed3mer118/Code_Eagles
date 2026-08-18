import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './shared/i18n';
import './index.css';

const storedTheme = localStorage.getItem('ce-theme');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
const darkEnabled = storedTheme ? storedTheme === 'dark' : prefersDark;
document.documentElement.classList.toggle('dark', darkEnabled);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
