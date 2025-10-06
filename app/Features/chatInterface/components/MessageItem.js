import { Theme } from '@/constants/Theme';
import logger from '@/services/Logger';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { getMessageDisplayInfo } from '../utils/messageUtils';

export default function MessageItem({ message }) {
  const displayInfo = getMessageDisplayInfo(message);
  const isUser = displayInfo.isUser;

  logger.trace('MessageItem', 'Rendering message', { 
    messageId: message.id, 
    sender: message.sender, 
    textLength: message.text?.length 
  });

  return (
    <View style={[
      styles.messageContainer,
      isUser ? styles.userMessage : styles.aiMessage
    ]}>
      <Text style={[
        styles.messageText,
        isUser ? styles.userMessageText : styles.aiMessageText
      ]}>
        {message.text}
      </Text>
      <Text style={styles.timestamp}>
        {displayInfo.timeString}
      </Text>
      {/* Optional: Display metadata if available */}
      {displayInfo.modelInfo && (
        <Text style={styles.metadata}>
          {displayInfo.modelInfo}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  messageContainer: {
    marginBottom: Theme.spacing.md,
    maxWidth: '80%',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: Theme.primaryBlue,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.md,
  },
  aiMessage: {
    alignSelf: 'flex-start',
    backgroundColor: Theme.secondaryBackground,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.md,
  },
  messageText: {
    fontSize: Theme.fontSize.md,
    lineHeight: 22,
  },
  userMessageText: {
    color: Theme.primaryText,
  },
  aiMessageText: {
    color: Theme.secondaryText,
  },
  timestamp: {
    fontSize: Theme.fontSize.xs,
    color: Theme.mutedText,
    marginTop: Theme.spacing.xs,
    alignSelf: 'flex-end',
  },
  metadata: {
    fontSize: Theme.fontSize.xs,
    color: Theme.mutedText,
    marginTop: Theme.spacing.xs,
    alignSelf: 'flex-end',
  },
});
