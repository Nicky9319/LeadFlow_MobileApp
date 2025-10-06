import { Theme } from '@/constants/Theme';
import logger from '@/services/Logger';
import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function ChatInput({ inputText, setInputText, onSendMessage }) {
  const handleTextChange = (text) => {
    logger.trace('ChatInput', 'Text input changed', { 
      textLength: text.length, 
      previousLength: inputText.length 
    });
    setInputText(text);
  };

  const handleSendPress = () => {
    logger.debug('ChatInput', 'Send button pressed', { 
      textLength: inputText.length, 
      hasText: inputText.trim() !== '' 
    });
    onSendMessage();
  };

  const handleSubmitEditing = () => {
    logger.debug('ChatInput', 'Submit editing triggered (Enter key)');
    onSendMessage();
  };

  const isSendDisabled = inputText.trim() === '';

  return (
    <View style={styles.inputContainer}>
      <TextInput
        style={[
          styles.textInput,
          inputText.trim() !== '' && styles.textInputGlowing
        ]}
        value={inputText}
        onChangeText={handleTextChange}
        placeholder="Type your message..."
        placeholderTextColor={Theme.mutedText}
        multiline
        maxLength={500}
        onSubmitEditing={handleSubmitEditing}
        onFocus={() => logger.trace('ChatInput', 'Text input focused')}
        onBlur={() => logger.trace('ChatInput', 'Text input blurred')}
      />
      <TouchableOpacity 
        style={[styles.sendButton, isSendDisabled && styles.sendButtonDisabled]} 
        onPress={handleSendPress}
        disabled={isSendDisabled}
        onPressIn={() => logger.trace('ChatInput', 'Send button pressed in')}
        onPressOut={() => logger.trace('ChatInput', 'Send button pressed out')}
      >
        <Text style={styles.sendButtonText}>Send</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    padding: Theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: Theme.borderColors,
    alignItems: 'flex-end',
  },
  textInput: {
    flex: 1,
    backgroundColor: Theme.secondaryBackground,
    borderRadius: Theme.borderRadius.lg,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    color: Theme.primaryText,
    fontSize: Theme.fontSize.md,
    maxHeight: 100,
    marginRight: Theme.spacing.sm,
    borderWidth: 1,
    borderColor: Theme.borderColors,
  },
  textInputGlowing: {
    borderColor: Theme.primaryBlue,
    borderWidth: 2,
    shadowColor: Theme.primaryBlue,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  sendButton: {
    backgroundColor: Theme.primaryBlue,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.lg,
    minWidth: 60,
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: Theme.mutedText,
  },
  sendButtonText: {
    color: Theme.primaryText,
    fontSize: Theme.fontSize.md,
    fontWeight: '600',
  },
});
