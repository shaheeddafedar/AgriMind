import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

import './assets/css/style.css';
import './assets/css/dashboard.css';
import './assets/css/about.css';
import './assets/css/analytics.css';
import './assets/css/feedback.css';
import './assets/css/profile.css';
import './assets/css/recommendation.css';
import './assets/css/signup.css';
import './assets/css/smart-irrigation.css';

import './i18n/config.js';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);