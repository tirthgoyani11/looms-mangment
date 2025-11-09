
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
// This needs to be imported to make Three.js available globally for the background
import 'three';


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
