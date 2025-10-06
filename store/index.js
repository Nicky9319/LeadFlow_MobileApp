import logger from '@/services/Logger';
import { configureStore } from '@reduxjs/toolkit';
import loggingMiddleware from './middleware/loggingMiddleware';
import chatReducer from './slices/chatSlice';
import webSocketReducer from './slices/webSocketSlice';

logger.info('Store', 'Configuring Redux store');

export const store = configureStore({
  reducer: {
    chat: chatReducer,
    webSocket: webSocketReducer,
  },
  middleware: (getDefaultMiddleware) => {
    const defaultMiddleware = getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types for serialization checks
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['payload.timestamp'],
        // Ignore these paths in the state
        ignoredPaths: ['chat.messages'],
      },
    });
    
    // Add custom logging middleware
    return defaultMiddleware.concat(loggingMiddleware);
  },
  devTools: process.env.NODE_ENV !== 'production',
});

logger.info('Store', 'Redux store configured successfully', {
  reducers: Object.keys(store.getState()),
  middleware: store.getState ? 'configured' : 'not configured'
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
