import { Theme } from '@/constants/Theme';
import logger from '@/services/Logger';
import { usePathname } from 'expo-router';
import React, { useCallback, useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { useDispatch } from 'react-redux';

import { addMessage, setMessages } from '@/store/slices/chatSlice';
import ChatScreen from '../../chatInterface/components/ChatScreen';
import ChatHistoryService from '../../chatInterface/utils/chatHistoryService';
import WelcomeScreen from '../../home/components/WelcomeScreen';

import webSocketManager from '../../../../services/WebSocketManager';

// MODULE-LEVEL singleton to prevent React Strict Mode double execution
let _moduleInitialized = false;

export default function MainPage() {
    const pathname = usePathname();
    const dispatch = useDispatch();
    const hasTriggeredGetConversation = useRef(false);
    const hasSetupEventListeners = useRef(false);
    const processedMessageIds = useRef(new Set());
    

    // Create stable callback functions with useCallback
    const handleMsgFromDonnaDesktop = useCallback((messages) => {
        console.log("Handling Messages from Donna Desktop")
        console.log('Donna messages received:', messages);

        // Since we receive an array of messages, process and add each one to the chat
        messages.forEach(rawMessage => {
            // Process the raw message through the same service used for chat history
            const processedMessage = ChatHistoryService.processSingleMessage(rawMessage);
            console.log('Adding processed message:', processedMessage);
            dispatch(addMessage(processedMessage));
        });
    }, [dispatch]);

    // Handle conversation history received from desktop app
    const handleConversationWithDonna = useCallback((conversational_history) => {
        logger.info('MainPage', 'Received conversationWithDonna from desktop:', conversational_history);

        try {
            // Check if the response has an error
            if (conversational_history && conversational_history.error) {
                logger.error('MainPage', 'Error in conversationWithDonna response:', conversational_history);
                return;
            }

            // Process and set the conversation history in Redux
            if (Array.isArray(conversational_history) && conversational_history.length > 0) {
                logger.info('MainPage', `Processing ${conversational_history.length} messages from desktop history`);

                // Process each message through ChatHistoryService to ensure proper formatting
                const processedMessages = conversational_history.map((message, index) => {
                    logger.debug('MainPage', `Processing message ${index + 1}/${conversational_history.length}`, message);
                    return ChatHistoryService.processSingleMessage(message);
                });

                logger.info('MainPage', `Setting ${processedMessages.length} processed messages to Redux`);
                dispatch(setMessages(processedMessages));
            } else {
                logger.info('MainPage', 'No conversation history received from desktop');
            }
        } catch (error) {
            logger.error('MainPage', 'Error processing conversationWithDonna:', error);
        }
    }, [dispatch]);

    // FIXED: Use MODULE-LEVEL singleton to prevent React Strict Mode double execution
    useEffect(() => {
        // DOUBLE PROTECTION: Module-level AND component-level
        if (_moduleInitialized || hasSetupEventListeners.current) {
            logger.warn('MainPage', '🚫 Event listeners already initialized - BLOCKING React Strict Mode duplicate');
            return;
        }

        logger.info('MainPage', '🔧 FIRST AND ONLY WebSocket setup - MODULE SINGLETON PROTECTION');
        
        // Clear any existing listeners first
        webSocketManager.off('msgFromDonnaDesktop');
        webSocketManager.off('conversationWithDonna');
        
        webSocketManager.connect();

        // Debug current listeners before adding
        webSocketManager.debugListeners();
        
        // Add listeners with explicit logging
        logger.info('MainPage', '➕ Adding msgFromDonnaDesktop listener');
        webSocketManager.on('msgFromDonnaDesktop', handleMsgFromDonnaDesktop);
        
        logger.info('MainPage', '➕ Adding conversationWithDonna listener');
        webSocketManager.on('conversationWithDonna', handleConversationWithDonna);

        // Debug current listeners after adding
        webSocketManager.debugListeners();

        // Set both flags to prevent any future execution
        _moduleInitialized = true;
        hasSetupEventListeners.current = true;
        logger.info('MainPage', '✅ MODULE SINGLETON - WebSocket listeners LOCKED IN');

        return () => {
            logger.info('MainPage', '🧹 Cleaning up WebSocket event listeners');
            webSocketManager.off('msgFromDonnaDesktop', handleMsgFromDonnaDesktop);
            webSocketManager.off('conversationWithDonna', handleConversationWithDonna);
            webSocketManager.disconnect();
            // NOTE: NOT resetting _moduleInitialized to prevent re-initialization
            hasSetupEventListeners.current = false;
            processedMessageIds.current.clear();
            logger.info('MainPage', '🗑️ Cleanup complete - MODULE SINGLETON REMAINS ACTIVE');
        }
    }, []); // EMPTY dependency array - this effect should only run once

    // Trigger getConversationWithDonna when chat interface loads for the first time
    useEffect(() => {
        if (currentScreen === 'chat' && !hasTriggeredGetConversation.current) {
            logger.info('MainPage', '🔄 Chat interface loaded for the first time - triggering getConversationWithDonna');

            const triggerGetConversation = () => {
                if (webSocketManager.getIsConnected()) {
                    logger.info('MainPage', '📡 WebSocket connected, sending getConversationWithDonna event');
                    webSocketManager.emit('getConversationWithDonna');
                    hasTriggeredGetConversation.current = true;
                    logger.info('MainPage', '✅ getConversationWithDonna event sent successfully');
                } else {
                    logger.warn('MainPage', '⚠️ WebSocket not connected, retrying in 1 second...');
                    // Retry after 1 second if WebSocket is not connected
                    setTimeout(triggerGetConversation, 1000);
                }
            };

            triggerGetConversation();
        }
    }, [currentScreen]);

    // Determine current screen based on pathname
    const currentScreen = pathname === '/chat' ? 'chat' : 'home';

    logger.componentLifecycle('MainPage', 'mount', { currentScreen, pathname });

    // Render the appropriate screen based on current route
    const renderCurrentScreen = () => {
        switch (currentScreen) {
            case 'chat':
                return <ChatScreen />;
            case 'home':
            default:
                return <WelcomeScreen />;
        }
    };

    return (
        <View style={styles.container}>
            {renderCurrentScreen()}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Theme.primaryBackground,
    },
});
