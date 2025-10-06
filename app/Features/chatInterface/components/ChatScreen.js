import DebugPanel from '@/components/DebugPanel';
import { Theme } from '@/constants/Theme';
import logger from '@/services/Logger';
import webSocketManager from '@/services/WebSocketManager';
import { addMessage, setLoading } from '@/store/slices/chatSlice';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import ChatHistoryService from '../utils/chatHistoryService';
import ChatInput from './ChatInput';
import MessageItem from './MessageItem';

export default function ChatScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { messages, isLoading } = useSelector((state) => state.chat);
  const [inputText, setInputText] = useState('');
  const [debugVisible, setDebugVisible] = useState(false);
  const flatListRef = useRef(null);

  logger.componentLifecycle('ChatScreen', 'mount', { messagesCount: messages.length });

  useEffect(() => {
    // Initialize WebSocket connection
    logger.info('ChatScreen', 'Initializing WebSocket connection');
    initializeWebSocket();

    // Scroll to bottom when new messages arrive
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
        logger.debug('ChatScreen', 'Scrolled to bottom of messages');
      }, 100);
    }

    return () => {
      logger.componentLifecycle('ChatScreen', 'unmount');
      // NOTE: WebSocket cleanup is now handled by MainPage component
    };
  }, []);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
        logger.debug('ChatScreen', 'Auto-scrolled to bottom due to new message');
      }, 100);
    }
  }, [messages]);

  const initializeWebSocket = async () => {
    try {
      // Check if already connected first
      if (webSocketManager.getIsConnected()) {
        logger.info('ChatScreen', 'WebSocket already connected, no additional setup needed');
        // NOTE: Event listeners are now handled by MainPage component to prevent duplicates
        return;
      }
      
      logger.info('ChatScreen', 'WebSocket not connected, but connection will be handled by MainPage');
      // NOTE: WebSocket connection and event listeners are managed by MainPage component
      
    } catch (error) {
      logger.error('ChatScreen', 'Error checking WebSocket status', error);
    }
  };



  // NOTE: handleMessageFromDesktop function removed - this is now handled by MainPage component
  // to prevent duplicate message processing

  const handleSendMessage = async () => {
    if (inputText.trim() === '') {
      logger.debug('ChatScreen', 'Attempted to send empty message - ignored');
      return;
    }

    const userMessage = inputText.trim();
    setInputText('');

    logger.chatEvent('UserMessage', 'User sending message', { text: userMessage });

    // Add user message with proper format using ChatHistoryService
    const formattedUserMessage = ChatHistoryService.createUserMessage(userMessage);
    dispatch(addMessage(formattedUserMessage));

    // Send message via WebSocket if connected
    if (webSocketManager.getIsConnected()) {
      logger.info('ChatScreen', 'Sending message via WebSocket', { text: userMessage });
      webSocketManager.emit('new-user-message', userMessage);
    } else {
      logger.warn('ChatScreen', 'WebSocket not connected - message not sent to server');
    }

    // Set loading state
    dispatch(setLoading(true));

    // Simulate AI response (replace with actual AI integration)
    setTimeout(() => {
      const formattedAiMessage = ChatHistoryService.createAssistantMessage(
        `I received your message: "${userMessage}". This is a demo response from DonnaAI.`
      );
      dispatch(addMessage(formattedAiMessage));
      dispatch(setLoading(false));
      
      logger.chatEvent('AIResponse', 'AI response generated', { 
        originalMessage: userMessage,
        response: formattedAiMessage.text 
      });
    }, 1000);
  };

  const renderMessage = ({ item }) => {
    logger.trace('ChatScreen', 'Rendering message', { messageId: item.id, sender: item.sender });
    return <MessageItem message={item} />;
  };

  const getConnectionStatus = () => {
    const status = webSocketManager.getConnectionStatus();
    return status.isConnected ? '🟢 Connected' : '🔴 Disconnected';
  };

  const toggleDebugPanel = () => {
    setDebugVisible(!debugVisible);
    logger.debug('ChatScreen', `Debug panel ${!debugVisible ? 'opened' : 'closed'}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>DonnaAI Chat</Text>
          <View style={styles.headerInfo}>
            <Text style={styles.connectionStatus}>{getConnectionStatus()}</Text>
            <TouchableOpacity style={styles.debugButton} onPress={toggleDebugPanel}>
              <Text style={styles.debugButtonText}>🐛</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id.toString()}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContent}
          onScrollBeginDrag={() => logger.debug('ChatScreen', 'User started scrolling messages')}
          onScrollEndDrag={() => logger.debug('ChatScreen', 'User stopped scrolling messages')}
        />

        {/* Loading indicator */}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>DonnaAI is typing...</Text>
          </View>
        )}

        {/* Input */}
        <ChatInput 
          inputText={inputText}
          setInputText={setInputText}
          onSendMessage={handleSendMessage}
        />

        {/* Debug Panel */}
        <DebugPanel 
          visible={debugVisible} 
          onClose={() => setDebugVisible(false)} 
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.primaryBackground,
  },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Theme.borderColors,
  },
  headerTitle: {
    color: Theme.primaryText,
    fontSize: Theme.fontSize.lg,
    fontWeight: '600',
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Theme.spacing.xs,
    gap: 10,
  },
  connectionStatus: {
    color: Theme.mutedText,
    fontSize: Theme.fontSize.sm,
  },
  debugButton: {
    padding: 5,
    borderRadius: 4,
    backgroundColor: Theme.secondaryBackground,
  },
  debugButtonText: {
    fontSize: 16,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: Theme.spacing.md,
  },
  loadingContainer: {
    padding: Theme.spacing.md,
    alignItems: 'center',
  },
  loadingText: {
    color: Theme.mutedText,
    fontSize: Theme.fontSize.sm,
    fontStyle: 'italic',
  },
});
