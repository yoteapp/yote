import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from 'redux'

import * as resourceReducers from './resourceReducers';

import logger from 'redux-logger';

import { 
  FLUSH,
  PAUSE,
  PERSIST,
  persistReducer,
  persistStore,
  PURGE,
  REGISTER,
  REHYDRATE,
} from 'redux-persist'; 
import AsyncStorage from '@react-native-community/async-storage'; 

// More info: https://redux-toolkit.js.org/usage/usage-guide
// redux thunk is included with getDefaultMiddleware. More info on that: https://redux-toolkit.js.org/api/getDefaultMiddleware

// Mobile: 
// Needs to persist the store in case user kills the app - combine reducers is the only way to do this

const rootReducer = (state, action) => {
  // clear store on logout, also on login so any previous rejected queries are cleared out.
  // adapted from https://stackoverflow.com/a/61943631
  if(action.type === 'auth/sendLogout/fulfilled' || action.type === 'auth/sendLogin/fulfilled') {
    state = undefined
  }
  return combinedReducers(state, action)
}

const combinedReducers = combineReducers({
  ...resourceReducers
})

let persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  // blacklist: ['wallet'] // reducers you don't want to persist (whitelist will do the opposite)
}

const persistedReducer = persistReducer(persistConfig, rootReducer);

export default function store() {
  let store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      }
    }).concat(logger),
  });

  let persistor = persistStore(store)
  window.store = store; 

  return { store, persistor }
}

module.exports = store;
