import logger from '@/services/Logger';

export class ChatHistoryService {
  
  /**
   * Process a single message for consistent formatting
   * @param {Object} rawMessage - Raw message data
   * @returns {Object} Processed message
   */
  static processSingleMessage(rawMessage) {
    logger.debug('ChatHistoryService', 'Processing single message', { rawMessage });
    
    const messageData = rawMessage.data || rawMessage;
    
    // Better timestamp handling with validation
    let timestamp = messageData.additional_kwargs?.time_stamp || messageData.timestamp;
    
    // Validate the timestamp format
    if (timestamp) {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) {
        // Invalid timestamp format, use fallback
        logger.warn('ChatHistoryService', 'Invalid timestamp format, using fallback', { timestamp });
        timestamp = null;
      }
    }
    
    // If no valid timestamp, use current time
    if (!timestamp) {
      timestamp = new Date().toISOString();
      logger.debug('ChatHistoryService', 'Using current timestamp as fallback');
    }
    
    const sender = this.determineSender(rawMessage);
    // Extract text content with fallback
    let textContent = messageData.content || messageData.text;
    
    // If text is undefined, null, or empty, provide a fallback
    if (!textContent || textContent === undefined || textContent === null) {
      logger.warn('ChatHistoryService', 'Message has no text content, using fallback', { messageData });
      textContent = sender === 'user' ? '[User message]' : '[Assistant response]';
    }
    
    const processedMessage = {
      id: messageData.id || `msg-${Date.now()}-${Math.random()}`,
      text: textContent,
      sender: sender,
      timestamp: timestamp,
      metadata: {
        modelName: messageData.response_metadata?.model_name || messageData.metadata?.modelName || 'donna-ai',
        tokenUsage: messageData.response_metadata?.token_usage || messageData.metadata?.tokenUsage || null,
        finishReason: messageData.response_metadata?.finish_reason || messageData.metadata?.finishReason || null,
        originalId: messageData.id || messageData.metadata?.originalId || null
      }
    };

    logger.info('ChatHistoryService', 'Message processed successfully', { 
      messageId: processedMessage.id, 
      sender: processedMessage.sender,
      textLength: processedMessage.text?.length 
    });

    return processedMessage;
  }

  /**
   * Determine the sender type based on message structure
   * @param {Object} message - Message object
   * @returns {string} 'user' or 'assistant'
   */
  static determineSender(message) {
    logger.debug('ChatHistoryService', 'Determining sender type', { message });
    
    // Handle different message formats
    if (message.type === 'human' || message.sender === 'user') {
      logger.debug('ChatHistoryService', 'Sender determined as user');
      return 'user';
    }
    if (message.type === 'ai' || message.type === 'assistant' || message.sender === 'assistant') {
      logger.debug('ChatHistoryService', 'Sender determined as assistant');
      return 'assistant';
    }
    
    // Default fallback
    const defaultSender = message.sender || 'assistant';
    logger.debug('ChatHistoryService', `Using default sender: ${defaultSender}`);
    return defaultSender;
  }

  /**
   * Process raw chat data into a format suitable for the UI
   * @param {Array} rawData - Raw chat data
   * @returns {Array} Processed messages
   */
  static processChatData(rawData) {
    logger.info('ChatHistoryService', 'Processing chat data', { messageCount: rawData.length });
    
    const processedMessages = rawData.map((item, index) => {
      logger.debug('ChatHistoryService', `Processing message ${index + 1}/${rawData.length}`);
      return this.processSingleMessage(item);
    });

    // Add a welcome message if no messages exist
    if (processedMessages.length === 0) {
      logger.info('ChatHistoryService', 'No messages found, adding welcome message');
      processedMessages.unshift({
        id: 'welcome-message',
        text: "Hello! How can I help you today?",
        sender: 'assistant',
        timestamp: new Date().toISOString(),
        metadata: {
          modelName: 'donna-ai',
          tokenUsage: null,
          finishReason: null,
          originalId: 'welcome-message'
        }
      });
    }

    logger.info('ChatHistoryService', 'Chat data processing completed', { 
      processedCount: processedMessages.length 
    });

    return processedMessages;
  }

  /**
   * Create a user message with proper formatting
   * @param {string} text - Message text
   * @param {Object} metadata - Optional metadata
   * @returns {Object} Formatted user message
   */
  static createUserMessage(text, metadata = {}) {
    logger.debug('ChatHistoryService', 'Creating user message', { text, metadata });
    
    const message = {
      text: text,
      sender: 'user',
      metadata: {
        modelName: 'user-input',
        tokenUsage: null,
        finishReason: null,
        originalId: null,
        ...metadata
      }
    };

    logger.debug('ChatHistoryService', 'User message created', { message });
    return message;
  }

  /**
   * Create an assistant message with proper formatting
   * @param {string} text - Message text
   * @param {Object} metadata - Optional metadata
   * @returns {Object} Formatted assistant message
   */
  static createAssistantMessage(text, metadata = {}) {
    logger.debug('ChatHistoryService', 'Creating assistant message', { text, metadata });
    
    const message = {
      text: text,
      sender: 'assistant',
      metadata: {
        modelName: 'donna-ai',
        tokenUsage: { total: 150, prompt: 50, completion: 100 },
        finishReason: 'stop',
        originalId: `ai-response-${Date.now()}`,
        ...metadata
      }
    };

    logger.debug('ChatHistoryService', 'Assistant message created', { message });
    return message;
  }
}

export default ChatHistoryService;
