import logger from '@/services/Logger';
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isConnectedToDesktop: false,
};

logger.info('WebSocketSlice', 'Initializing WebSocket slice with initial state', initialState);

const webSocketSlice = createSlice({
  name: 'webSocket',
  initialState,
  reducers: {
    setConnected: (state) => {
      state.isConnectedToDesktop = true;
      logger.info('WebSocketSlice', 'Successfully connected to desktop app');
    },
    setDisconnected: (state) => {
      state.isConnectedToDesktop = false;
      logger.info('WebSocketSlice', 'Disconnected from desktop app');
    },
    resetConnection: (state) => {
      state.isConnectedToDesktop = false;
      logger.info('WebSocketSlice', 'Connection state reset');
    }
  }
});

export const { 
  setConnected, 
  setDisconnected,
  resetConnection 
} = webSocketSlice.actions;

export default webSocketSlice.reducer;
