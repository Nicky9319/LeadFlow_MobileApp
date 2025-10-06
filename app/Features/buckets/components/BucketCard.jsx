import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const BucketCard = ({ bucket, onUpdateBucket, onDeleteBucket }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(bucket.name);

  const handleSave = () => {
    if (editName.trim() !== bucket.name && editName.trim() !== '') {
      onUpdateBucket(bucket.id, editName.trim());
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditName(bucket.name);
    setIsEditing(false);
  };

  const handleDelete = () => {
    onDeleteBucket(bucket.id);
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <View style={styles.idSection}>
          <Text style={styles.idLabel}>ID:</Text>
          <Text style={styles.idValue}>{bucket.id}</Text>
        </View>
        
        <View style={styles.nameSection}>
          {isEditing ? (
            <View style={styles.editContainer}>
              <TextInput
                style={styles.editInput}
                value={editName}
                onChangeText={setEditName}
                autoFocus
                placeholder="Enter bucket name"
                placeholderTextColor="#8E8E93"
              />
              <View style={styles.editActions}>
                <TouchableOpacity 
                  style={styles.saveButton}
                  onPress={handleSave}
                >
                  <Text style={styles.saveButtonText}>✓</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.cancelButton}
                  onPress={handleCancel}
                >
                  <Text style={styles.cancelButtonText}>✕</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.nameContainer}>
              <Text style={styles.bucketName}>{bucket.name}</Text>
              <View style={styles.actions}>
                <TouchableOpacity 
                  style={styles.editIconButton}
                  onPress={() => setIsEditing(true)}
                >
                  <Text style={styles.editIcon}>✎</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.deleteIconButton}
                  onPress={handleDelete}
                >
                  <Text style={styles.deleteIcon}>🗑</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#111111',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1C1C1E',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    padding: 16,
  },
  idSection: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1C1C1E',
  },
  idLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8E93',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  idValue: {
    fontSize: 12,
    color: '#8E8E93',
    fontFamily: 'monospace',
    backgroundColor: '#1C1C1E',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
  },
  nameSection: {
    flex: 1,
  },
  editContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    backgroundColor: '#1C1C1E',
    borderWidth: 2,
    borderColor: '#007AFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  editActions: {
    flexDirection: 'row',
    gap: 6,
  },
  saveButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00D09C',
  },
  cancelButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF3B30',
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bucketName: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    lineHeight: 24,
  },
  actions: {
    flexDirection: 'row',
    gap: 6,
  },
  editIconButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: 'transparent',
  },
  editIcon: {
    fontSize: 16,
    color: '#8E8E93',
  },
  deleteIconButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: 'transparent',
  },
  deleteIcon: {
    fontSize: 16,
    color: '#8E8E93',
  },
});

export default BucketCard;
