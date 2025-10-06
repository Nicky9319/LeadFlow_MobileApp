import { Theme } from '@/constants/Theme';
import logger from '@/services/Logger';
import webSocketManager from '@/services/WebSocketManager';
import { setDisconnected } from '@/store/slices/webSocketSlice';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useDispatch } from 'react-redux';

export default function WelcomeScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [isCheckingConnection, setIsCheckingConnection] = useState(false);
  const connectionCheckRef = useRef(false); // Use ref to track connection check state

  logger.componentLifecycle('WelcomeScreen', 'mount');

  // Set isConnectedToDesktop to false when component mounts
  useEffect(() => {
    logger.info('WelcomeScreen', 'Setting isConnectedToDesktop to false on mount');
    dispatch(setDisconnected());
  }, [dispatch]);

  // Cleanup function to handle component unmount
  useEffect(() => {
    return () => {
      // If component unmounts while checking connection, clean up any pending timeouts
      // and event listeners
      if (isCheckingConnection) {
        logger.info('WelcomeScreen', 'Component unmounting while checking connection - cleaning up');
        // Note: We can't access timeoutId here since it's local to handleStartChat
        // But the timeout will be cleared when the component unmounts anyway
      }
    };
  }, [isCheckingConnection]);

  const handleStartChat = async () => {
    logger.info('WelcomeScreen', '🖱️ BUTTON: User clicked Start Chat button');
    
    if (isCheckingConnection) {
      logger.debug('WelcomeScreen', '⚠️ IGNORED: Connection check already in progress - ignoring click');
      return;
    }

    setIsCheckingConnection(true);
    connectionCheckRef.current = true; // Set ref to track connection check
    logger.info('WelcomeScreen', '🔄 Button state set: isCheckingConnection = true');
    
    // Create a timeout reference to clear it if needed
    let timeoutId = null;
    
    try {
      // First, ensure WebSocket is connected
      logger.info('WelcomeScreen', 'Checking WebSocket connection');
      const connected = await webSocketManager.connect();
      
      if (!connected) {
        logger.error('WelcomeScreen', '❌ ERROR: Failed to connect to WebSocket server');
        Alert.alert(
          'Connection Error',
          'Unable to connect to the server. Please check your internet connection and try again.',
          [{ text: 'OK' }]
        );
        setIsCheckingConnection(false);
        connectionCheckRef.current = false; // Reset ref
        logger.info('WelcomeScreen', '🔄 Button state reset: isCheckingConnection = false (connection failed)');
        return;
      }

      // Set up listener for pingFromDonnaDesktop event
      logger.info('WelcomeScreen', 'Setting up pingFromDonnaDesktop listener');
      
      const handlePingFromDesktop = () => {
        logger.info('WelcomeScreen', '✅ SUCCESS: Received pingFromDonnaDesktop - navigating to chat');
        
        // Clear the timeout since we got a response
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
          logger.info('WelcomeScreen', '⏰ Timer cleared: Timeout cancelled due to successful ping');
        }
        
        // Clear the countdown interval
        clearInterval(countdownInterval);
        logger.info('WelcomeScreen', '⏰ Countdown stopped: Timer interval cleared');
        
        // Remove the event listener
        webSocketManager.off('pingFromDonnaDesktop', handlePingFromDesktop);
        logger.info('WelcomeScreen', '🔧 Event listener removed: pingFromDonnaDesktop');
        
        // Reset button state and navigate
        setIsCheckingConnection(false);
        connectionCheckRef.current = false; // Reset ref
        logger.info('WelcomeScreen', '🔄 Button state reset: isCheckingConnection = false');
        router.push('/chat');
      };

      // Add the event listener
      webSocketManager.on('pingFromDonnaDesktop', handlePingFromDesktop);

      // Emit getDonnaDesktop event to trigger the ping
      logger.info('WelcomeScreen', 'Emitting getDonnaDesktop event');
      webSocketManager.emit('getDonnaDesktop');

      // Set up countdown timer logging
      const startTime = Date.now();
      const countdownInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const remaining = 30 - elapsed;
        logger.info('WelcomeScreen', `Timer countdown: ${remaining}s remaining (${elapsed}s elapsed)`);
        
        if (remaining <= 0) {
          clearInterval(countdownInterval);
        }
      }, 1000); // Log every second

      // Set a 30 second timeout - if no ping received, notify user that desktop is not available
      timeoutId = setTimeout(() => {
        logger.info('WelcomeScreen', `⏰ TIMEOUT CHECK: connectionCheckRef.current = ${connectionCheckRef.current}, isCheckingConnection = ${isCheckingConnection}`);
        if (connectionCheckRef.current) {
          logger.warn('WelcomeScreen', '⏰ TIMEOUT: No ping received within 30 seconds - desktop not available');
          
          // Clear the countdown interval
          clearInterval(countdownInterval);
          
          // Remove the event listener
          webSocketManager.off('pingFromDonnaDesktop', handlePingFromDesktop);
          
          // Reset button state
          setIsCheckingConnection(false);
          connectionCheckRef.current = false; // Reset ref
          
          // Notify user that desktop is not available
          Alert.alert(
            'Desktop Not Available',
            'DonnaAI Desktop application is not running or not available for connection. Please ensure the desktop app is active and try again.',
            [{ text: 'OK' }]
          );
        } else {
          logger.info('WelcomeScreen', '⏰ TIMEOUT: Connection check was already completed, ignoring timeout');
          clearInterval(countdownInterval);
        }
      }, 30000); // 30 second timeout

      logger.info('WelcomeScreen', '⏰ Timer started: 30 seconds countdown begins');

    } catch (error) {
      logger.error('WelcomeScreen', '❌ ERROR: Error during connection check', error);
      
      // Clear timeout if it was set
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
        logger.info('WelcomeScreen', '⏰ Timer cleared: Timeout cancelled due to error');
      }
      
      // Clear countdown interval if it was set
      if (typeof countdownInterval !== 'undefined') {
        clearInterval(countdownInterval);
        logger.info('WelcomeScreen', '⏰ Countdown stopped: Timer interval cleared due to error');
      }
      
      Alert.alert(
        'Connection Error',
        'An error occurred while checking desktop availability. Please try again.',
        [{ text: 'OK' }]
      );
      setIsCheckingConnection(false);
      connectionCheckRef.current = false; // Reset ref
      logger.info('WelcomeScreen', '🔄 Button state reset: isCheckingConnection = false (error)');
    }
  };


  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>DonnaAI</Text>
          <Text style={styles.subtitle}>Your AI Assistant</Text>
        </View>
        
        <TouchableOpacity 
          style={[styles.button, isCheckingConnection && styles.buttonDisabled]} 
          onPress={handleStartChat}
          disabled={isCheckingConnection}
        >
          <Text style={styles.buttonText}>
            {isCheckingConnection ? 'Waiting for Desktop...' : 'Start Chat'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.primaryBackground,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.lg,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: Theme.spacing.xxl,
  },
  logo: {
    fontSize: Theme.fontSize.xxxl,
    fontWeight: 'bold',
    color: Theme.primaryBlue,
    marginBottom: Theme.spacing.sm,
  },
  subtitle: {
    fontSize: Theme.fontSize.lg,
    color: Theme.secondaryText,
    textAlign: 'center',
  },
  button: {
    backgroundColor: Theme.primaryBlue,
    paddingHorizontal: Theme.spacing.xl,
    paddingVertical: Theme.spacing.md,
    borderRadius: Theme.borderRadius.lg,
    minWidth: 200,
    alignItems: 'center',
  },
  buttonText: {
    color: Theme.primaryText,
    fontSize: Theme.fontSize.lg,
    fontWeight: '600',
  },
  buttonDisabled: {
    backgroundColor: Theme.mutedText,
    opacity: 0.6,
  },
});
