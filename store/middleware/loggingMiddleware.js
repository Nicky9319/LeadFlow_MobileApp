import logger from '@/services/Logger';

/**
 * Redux middleware for comprehensive logging of actions and state changes
 */
export const loggingMiddleware = store => next => action => {
  const prevState = store.getState();
  
  // Log the action being dispatched
  logger.reduxAction(
    action.type, 
    `Dispatching action`, 
    { 
      payload: action.payload,
      timestamp: new Date().toISOString()
    }
  );

  // Call the next middleware or reducer
  const result = next(action);

  // Get the new state after the action
  const nextState = store.getState();

  // Log state changes for specific slices
  if (action.type.startsWith('chat/')) {
    const prevChatState = prevState.chat;
    const nextChatState = nextState.chat;
    
    logger.debug('ReduxMiddleware', 'Chat state changed', {
      action: action.type,
      prevMessagesCount: prevChatState.messages.length,
      nextMessagesCount: nextChatState.messages.length,
      prevLoading: prevChatState.isLoading,
      nextLoading: nextChatState.isLoading,
      stateDiff: {
        messagesAdded: nextChatState.messages.length - prevChatState.messages.length,
        loadingChanged: prevChatState.isLoading !== nextChatState.isLoading
      }
    });
  }

  // Log any errors that occurred during action processing
  if (result && result.error) {
    logger.error('ReduxMiddleware', 'Error in action processing', {
      action: action.type,
      error: result.error
    });
  }

  return result;
};

export default loggingMiddleware;
