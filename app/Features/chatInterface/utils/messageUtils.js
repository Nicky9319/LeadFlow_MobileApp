import logger from '@/services/Logger';
import ChatHistoryService from './chatHistoryService';

/**
 * Utility functions for message handling in the chat interface
 */

/**
 * Validate if a message object has the correct format
 * @param {Object} message - Message object to validate
 * @returns {boolean} True if valid, false otherwise
 */
export const isValidMessage = (message) => {
  // Check basic structure
  if (!message || typeof message !== 'object') {
    logger.warn('MessageUtils', 'Message is not a valid object', { message });
    return false;
  }
  
  // Check required fields
  const requiredFields = ['id', 'text', 'sender', 'timestamp', 'metadata'];
  const missingFields = requiredFields.filter(field => !message[field]);
  
  if (missingFields.length > 0) {
    logger.warn('MessageUtils', 'Message missing required fields', { 
      message, 
      missingFields,
      textValue: message.text,
      textType: typeof message.text
    });
    return false;
  }
  
  // Check if text is valid (not undefined, null, or empty string)
  if (!message.text || message.text === undefined || message.text === null) {
    logger.warn('MessageUtils', 'Message text is invalid', { 
      message, 
      textValue: message.text,
      textType: typeof message.text
    });
    return false;
  }

  return true;
};

/**
 * Format a raw message from external sources (API, WebSocket, etc.)
 * @param {Object} rawMessage - Raw message data
 * @returns {Object} Formatted message object
 */
export const formatMessage = (rawMessage) => {
  logger.debug('MessageUtils', 'Formatting raw message', { rawMessage });
  return ChatHistoryService.processSingleMessage(rawMessage);
};

/**
 * Create a user message with proper formatting
 * @param {string} text - Message text
 * @param {Object} options - Additional options
 * @returns {Object} Formatted user message
 */
export const createUserMessage = (text, options = {}) => {
  logger.debug('MessageUtils', 'Creating user message via utility', { text, options });
  return ChatHistoryService.createUserMessage(text, options);
};

/**
 * Create an assistant message with proper formatting
 * @param {string} text - Message text
 * @param {Object} options - Additional options
 * @returns {Object} Formatted assistant message
 */
export const createAssistantMessage = (text, options = {}) => {
  logger.debug('MessageUtils', 'Creating assistant message via utility', { text, options });
  return ChatHistoryService.createAssistantMessage(text, options);
};

/**
 * Get message display info for UI components
 * @param {Object} message - Message object
 * @returns {Object} Display information
 */
export const getMessageDisplayInfo = (message) => {
  if (!isValidMessage(message)) {
    logger.warn('MessageUtils', 'Getting display info for invalid message', { message });
    return {
      isUser: false,
      displayName: 'Unknown',
      timeString: '--:--',
      modelInfo: null
    };
  }

  const isUser = message.sender === 'user';
  const timeString = new Date(message.timestamp).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  const displayInfo = {
    isUser,
    displayName: isUser ? 'You' : 'DonnaAI',
    timeString,
    modelInfo: message.metadata?.modelName || null
  };

  logger.trace('MessageUtils', 'Generated display info', { displayInfo });
  return displayInfo;
};

/**
 * Sort messages by timestamp
 * @param {Array} messages - Array of messages
 * @returns {Array} Sorted messages
 */
export const sortMessagesByTime = (messages) => {
  logger.debug('MessageUtils', 'Sorting messages by time', { messageCount: messages.length });
  
  const sortedMessages = [...messages].sort((a, b) => {
    const timeA = new Date(a.timestamp).getTime();
    const timeB = new Date(b.timestamp).getTime();
    return timeA - timeB;
  });

  logger.debug('MessageUtils', 'Messages sorted successfully', { 
    originalCount: messages.length, 
    sortedCount: sortedMessages.length 
  });

  return sortedMessages;
};

/**
 * Filter messages by sender type
 * @param {Array} messages - Array of messages
 * @param {string} senderType - 'user' or 'assistant'
 * @returns {Array} Filtered messages
 */
export const filterMessagesBySender = (messages, senderType) => {
  logger.debug('MessageUtils', 'Filtering messages by sender', { 
    messageCount: messages.length, 
    senderType 
  });
  
  const filteredMessages = messages.filter(message => message.sender === senderType);
  
  logger.debug('MessageUtils', 'Messages filtered successfully', { 
    originalCount: messages.length, 
    filteredCount: filteredMessages.length,
    senderType 
  });

  return filteredMessages;
};

export default {
  isValidMessage,
  formatMessage,
  createUserMessage,
  createAssistantMessage,
  getMessageDisplayInfo,
  sortMessagesByTime,
  filterMessagesBySender
};
