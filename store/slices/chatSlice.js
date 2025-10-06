import logger from '@/services/Logger';
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  messages: [
    {
      id: 'initial-greeting',
      text: 'Hello! I\'m DonnaAI. How can I help you today?',
      sender: 'assistant',
      timestamp: new Date().toISOString(),
      metadata: {
        modelName: 'donna-ai',
        tokenUsage: null,
        finishReason: null,
        originalId: 'initial-greeting'
      }
    },
  ],
  isLoading: false,
};

logger.info('ChatSlice', 'Initializing chat slice with initial state', initialState);

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addMessage: (state, action) => {
      const { text, sender, metadata = {} } = action.payload;
      
      logger.debug('ChatSlice', `Adding message from ${sender}`, { text, sender, metadata });
      
      const newMessage = {
        id: `msg-${Date.now()}-${Math.random()}`,
        text: text,
        sender: sender, // 'user' or 'assistant'
        timestamp: new Date().toISOString(),
        metadata: {
          modelName: metadata.modelName || 'donna-ai',
          tokenUsage: metadata.tokenUsage || null,
          finishReason: metadata.finishReason || null,
          originalId: metadata.originalId || null
        }
      };
      
      state.messages.push(newMessage);
      logger.info('ChatSlice', `Message added successfully`, { 
        messageId: newMessage.id, 
        totalMessages: state.messages.length 
      });
    },
    setLoading: (state, action) => {
      const isLoading = action.payload;
      logger.debug('ChatSlice', `Setting loading state to: ${isLoading}`);
      state.isLoading = isLoading;
    },
    clearMessages: (state) => {
      logger.info('ChatSlice', 'Clearing all messages except initial greeting');
      // Keep the initial greeting message
      state.messages = [initialState.messages[0]];
    },
    setMessages: (state, action) => {
      const messages = action.payload;
      logger.info('ChatSlice', `Setting ${messages.length} messages`, { 
        messageCount: messages.length,
        firstMessage: messages[0]?.text?.substring(0, 50) + '...',
        lastMessage: messages[messages.length - 1]?.text?.substring(0, 50) + '...'
      });
      state.messages = messages;
    },
    resetChatState: (state) => {
      logger.info('ChatSlice', 'Resetting chat state to initial state');
      return initialState;
    }
  },
});

export const { addMessage, setLoading, clearMessages, setMessages, resetChatState } = chatSlice.actions;
export default chatSlice.reducer;
