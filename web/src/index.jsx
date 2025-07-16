import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App.jsx';
import { initStore } from './config/store.js';
import { Provider } from 'react-redux';
import { BrowserRouter } from "react-router-dom";
import * as serviceWorker from './serviceWorker.js';

// we should know better, but just in case we navigate to the unused react dev server, show an alert.
if(window.location.origin === 'http://localhost:3000') alert("Wrong port. Go to http://localhost:3233 to load the app from the server")

// Grab the loggedInUser from the window as injected on the server-generated HTML
let loggedInUser;
try {
  loggedInUser = window.currentUser;
} catch(error) {
  // console.log('error', error);
  // this will probably never happen (loggedInUser can be undefined) but just in case
  loggedInUser = null
}
// Create Redux store with initial state
const store = initStore(loggedInUser);

// remove it from the global window object
delete window.currentUser;

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);

// Service workers can be handled differently with Vite if needed
// For now, we're removing the serviceWorker registration
serviceWorker.unregister();