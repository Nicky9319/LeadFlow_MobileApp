import React, { useState } from 'react';
import { Alert, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const AddBucketModal = ({ isVisible, onClose, onCreateBucket }) => {
  const [bucketName, setBucketName] = useState('');

  const handleCreate = () => {
    if (bucketName.trim() !== '') {
      onCreateBucket(bucketName.trim());
      setBucketName('');
      onClose();
    } else {
      Alert.alert('Error', 'Please enter a bucket name');
    }
  };

  const handleCancel = () => {
    setBucketName('');
    onClose();
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>Add New Bucket</Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={handleCancel}
            >
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.content}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Bucket Name</Text>
              <TextInput
                style={styles.input}
                value={bucketName}
                onChangeText={setBucketName}
                placeholder="Enter bucket name..."
                placeholderTextColor="#8E8E93"
                autoFocus
                returnKeyType="done"
                onSubmitEditing={handleCreate}
              />
            </View>
          </View>
          
          <View style={styles.footer}>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={handleCancel}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.createButton, bucketName.trim() === '' && styles.createButtonDisabled]}
              onPress={handleCreate}
              disabled={bucketName.trim() === ''}
            >
              <Text style={[styles.createButtonText, bucketName.trim() === '' && styles.createButtonTextDisabled]}>
                Create Bucket
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modal: {
    backgroundColor: '#111111',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1C1C1E',
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.8,
    shadowRadius: 25,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1C1C1E',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 24,
    color: '#8E8E93',
    fontWeight: '300',
  },
  content: {
    padding: 24,
  },
  inputContainer: {
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#E5E5E7',
    marginBottom: 8,
  },
  input: {
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: '#1C1C1E',
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: '#1C1C1E',
    color: '#FFFFFF',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#1C1C1E',
  },
  cancelButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#1C1C1E',
    borderRadius: 8,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#E5E5E7',
  },
  createButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  createButtonDisabled: {
    backgroundColor: '#1C1C1E',
  },
  createButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  createButtonTextDisabled: {
    color: '#8E8E93',
  },
});

export default AddBucketModal;
