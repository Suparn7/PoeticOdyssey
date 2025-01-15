// store.js
import { configureStore  } from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist'
import storage from 'redux-persist/lib/storage'; // Default is localStorage
import authSlice from './authSlice';
import postSlice from './postSlice';
import notificationSlice from './notificationSlice';
import userSlice from './userSlice';
import chatSlice from './chatSlice'


// Persist configuration for the user slice
const persistConfig = {
  key: 'user', // The key where the persisted data will be stored
  storage, // Uses localStorage by default
  whitelist: ['userData', 'likedPosts', 'savedPosts'], // Specify which parts of the user slice to persist
};

// Persist configuration for the noti slice
const notificationConfig = {
  key: 'notifications', // The key where the persisted data will be stored
  storage, // Uses localStorage by default
  whitelist: ['notifications'], // Specify which parts of the user slice to persist
};

// Persisted reducer for the user slice
const persistedUserReducer = persistReducer(persistConfig, userSlice);
const persistedNotificationReducer = persistReducer(notificationConfig, notificationSlice);


const store = configureStore({
  reducer: {
    auth: authSlice,
    posts: postSlice,
    notifications: persistedNotificationReducer,
    user: persistedUserReducer, // Persist the user reducer
    chat: chatSlice
  },
  
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        immutableCheck: { warnAfter: 128 },
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        ignoredPaths: ['persist', 'user'], // Optional: Ignore specific parts of state if needed
        ignoredPaths: ['persist', 'notifications']
      },
    }),
});

const persistor = persistStore(store); // Create the persistor to manage the persistence

export { store, persistor };
