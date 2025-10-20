import React, { useState } from 'react';
import { 
  Alert, 
  Dimensions, 
  Modal, 
  ScrollView, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  View 
} from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const BucketSelector = ({ 
  buckets = [], 
  currentBucketId, 
  onBucketChange, 
  leadId, 
  disabled = false,
  style = {}
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Filter out the current bucket from the list
  const availableBuckets = buckets.filter(bucket => bucket.id !== currentBucketId);

  const handleBucketSelect = async (targetBucketId) => {
    if (disabled || isLoading || !onBucketChange) return;
    
    setIsLoading(true);
    try {
      await onBucketChange(leadId, targetBucketId, currentBucketId);
      setIsModalVisible(false);
    } catch (error) {
      console.error('Error moving lead to bucket:', error);
      Alert.alert('Error', 'Failed to move lead to bucket. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentBucketName = () => {
    const currentBucket = buckets.find(bucket => bucket.id === currentBucketId);
    return currentBucket ? currentBucket.name : 'Unknown Bucket';
  };

  const openModal = () => {
    if (!disabled && availableBuckets.length > 0) {
      setIsModalVisible(true);
    }
  };

  const closeModal = () => {
    if (!isLoading) {
      setIsModalVisible(false);
    }
  };

  if (availableBuckets.length === 0) {
    return (
      <View style={[styles.container, style]}>
        <Text style={styles.noBucketsText}>No other buckets available</Text>
      </View>
    );
  }

  return (
    <>
      {/* Current Bucket Display with Switch Button */}
      <View style={[styles.container, style]}>
        <View style={styles.bucketInfo}>
          <Text style={styles.bucketLabel}>Bucket:</Text>
          <View style={styles.bucketNameContainer}>
            <Text style={styles.bucketName}>{getCurrentBucketName()}</Text>
            {!disabled && (
              <TouchableOpacity
                style={[styles.switchButton, isLoading && styles.switchButtonLoading]}
                onPress={openModal}
                disabled={isLoading}
                activeOpacity={0.7}
              >
                <Text style={styles.switchButtonText}>
                  {isLoading ? '⏳' : '🔄'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* Modal for Bucket Selection */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeModal}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={closeModal}
        >
          <View style={styles.modalContainer}>
            <TouchableOpacity activeOpacity={1} onPress={() => {}}>
              <View style={styles.modalContent}>
                {/* Header */}
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Move Lead</Text>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={closeModal}
                    disabled={isLoading}
                  >
                    <Text style={styles.closeButtonText}>✕</Text>
                  </TouchableOpacity>
                </View>

                {/* Bucket List */}
                <ScrollView 
                  style={styles.bucketList}
                  showsVerticalScrollIndicator={true}
                  contentContainerStyle={styles.bucketListContent}
                >
                  {availableBuckets.map((bucket) => (
                    <TouchableOpacity
                      key={bucket.id}
                      style={[styles.bucketItem, isLoading && styles.bucketItemDisabled]}
                      onPress={() => handleBucketSelect(bucket.id)}
                      disabled={isLoading}
                      activeOpacity={0.7}
                    >
                      <View style={styles.bucketItemContent}>
                        <View style={styles.bucketIcon}>
                          <Text style={styles.bucketIconText}>📁</Text>
                        </View>
                        <View style={styles.bucketDetails}>
                          <Text style={styles.bucketItemName}>{bucket.name}</Text>
                        </View>
                        {isLoading && (
                          <View style={styles.loadingIndicator}>
                            <Text style={styles.loadingText}>⏳</Text>
                          </View>
                        )}
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {/* Footer */}
                <View style={styles.modalFooter}>
                  <Text style={styles.footerText}>
                    {availableBuckets.length} bucket{availableBuckets.length !== 1 ? 's' : ''} available
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bucketInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  bucketLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#8E8E93',
    marginRight: 6,
  },
  bucketNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#2D2D2F',
  },
  bucketName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#E5E5E7',
    marginRight: 6,
  },
  switchButton: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: '#007AFF',
    borderRadius: 4,
    minWidth: 24,
    minHeight: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  switchButtonLoading: {
    backgroundColor: '#4A90E2',
  },
  switchButtonText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  noBucketsText: {
    fontSize: 12,
    color: '#8E8E93',
    fontStyle: 'italic',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 320,
    maxHeight: screenHeight * 0.7,
  },
  modalContent: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2D2D2F',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2D2D2F',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E5E5E7',
  },
  closeButton: {
    padding: 4,
    borderRadius: 4,
    minWidth: 24,
    minHeight: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '600',
  },
  bucketList: {
    maxHeight: screenHeight * 0.4,
  },
  bucketListContent: {
    paddingVertical: 8,
  },
  bucketItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2D2D2F',
  },
  bucketItemDisabled: {
    opacity: 0.5,
  },
  bucketItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bucketIcon: {
    width: 32,
    height: 32,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  bucketIconText: {
    fontSize: 16,
  },
  bucketDetails: {
    flex: 1,
  },
  bucketItemName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#E5E5E7',
  },
  loadingIndicator: {
    marginLeft: 8,
  },
  loadingText: {
    fontSize: 14,
    color: '#007AFF',
  },
  modalFooter: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#2D2D2F',
    backgroundColor: '#111111',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  footerText: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
  },
});

export default BucketSelector;
