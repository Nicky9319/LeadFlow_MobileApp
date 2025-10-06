import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { addNewBucket, deleteBucket as deleteBucketService, getAllBuckets, updateBucketName } from '../../../services/bucketsService';
import { addBucket, deleteBucket, setBuckets, setError, setLoading, updateBucket } from '../../../store/slices/bucketsSlice';
import AddBucketModal from './components/AddBucketModal';
import BucketCard from './components/BucketCard';

const BucketsPage = () => {
  const dispatch = useDispatch();
  const { buckets, loading } = useSelector((state) => state.buckets);
  const bucketsArray = Array.isArray(buckets) ? buckets : [];
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Function to fetch buckets
  const fetchBuckets = async () => {
    try {
      dispatch(setLoading(true));
      const fetchedBuckets = await getAllBuckets();
      dispatch(setBuckets(fetchedBuckets));
      console.log('Fetched buckets:', fetchedBuckets);
    } catch (error) {
      console.error('Error fetching buckets:', error);
      dispatch(setError(error.message));
    }
  };

  // Function to handle refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBuckets();
    setRefreshing(false);
  };

  // Fetch buckets on component mount
  useEffect(() => {
    fetchBuckets();
  }, []);

  // Function to handle bucket name update
  const handleUpdateBucket = async (bucketId, newName) => {
    try {
      const response = await updateBucketName(bucketId, newName);
      if (response.status_code === 200) {
        dispatch(updateBucket({ id: bucketId, name: newName }));
        console.log('Bucket updated successfully:', response.content);
      } else {
        console.error('Failed to update bucket:', response);
        Alert.alert('Error', 'Failed to update bucket name');
      }
    } catch (error) {
      console.error('Error updating bucket:', error);
      Alert.alert('Error', 'Failed to update bucket name');
    }
  };

  // Function to handle bucket creation
  const handleCreateBucket = async (bucketName) => {
    try {
      const response = await addNewBucket(bucketName);
      // treat any 2xx as success
      if (response && response.status_code >= 200 && response.status_code < 300) {
        // Normalize response content which may be nested or use different field names
        let content = response.content || {};
        if (content.content && typeof content.content === 'object') content = content.content;

        // service now returns a normalized content when possible
        const id = content.id || content.bucketId || content._id || `bucket-${Date.now()}-${Math.floor(Math.random()*1000)}`;
        const name = content.name || content.bucketName || bucketName;

        const newBucket = { id: String(id), name, ...content };

        dispatch(addBucket(newBucket));
        console.log('Bucket created successfully:', newBucket, 'raw response:', response);
      } else {
        console.error('Failed to create bucket: ', response);
        Alert.alert('Error', 'Failed to create bucket');
      }
    } catch (error) {
      console.error('Error creating bucket:', error);
      Alert.alert('Error', 'Failed to create bucket');
    }
  };

  // Function to handle bucket deletion
  const handleDeleteBucket = async (bucketId) => {
    Alert.alert(
      'Delete Bucket',
      'Are you sure you want to delete this bucket?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await deleteBucketService(bucketId);
              if (response.status_code === 200) {
                dispatch(deleteBucket(bucketId));
                console.log('Bucket deleted successfully:', response.content);
              } else {
                console.error('Failed to delete bucket:', response);
                Alert.alert('Error', 'Failed to delete bucket');
              }
            } catch (error) {
              console.error('Error deleting bucket:', error);
              Alert.alert('Error', 'Failed to delete bucket');
            }
          },
        },
      ]
    );
  };

  const renderBucketCard = ({ item, index }) => (
    <BucketCard
      key={item && item.id ? item.id : `bucket-${index}`}
      bucket={item}
      onUpdateBucket={handleUpdateBucket}
      onDeleteBucket={handleDeleteBucket}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateText}>No buckets yet.</Text>
      <Text style={styles.emptyStateSubtext}>Create your first bucket to get started!</Text>
    </View>
  );

  const renderLoadingState = () => (
    <View style={styles.loadingState}>
      <ActivityIndicator size="large" color="#007AFF" />
      <Text style={styles.loadingText}>Loading buckets...</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Buckets</Text>
          <Text style={styles.subtitle}>Organize your leads into different categories</Text>
        </View>
        
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={fetchBuckets}
            disabled={loading}
          >
            <Text style={styles.refreshButtonText}>
              {loading ? 'Loading...' : '↻'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => setIsModalOpen(true)}
          >
            <Text style={styles.addButtonText}>+ Add Bucket</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {loading && bucketsArray.length === 0 ? (
        renderLoadingState()
      ) : (
        <FlatList
          data={bucketsArray}
          renderItem={renderBucketCard}
          keyExtractor={(item, index) => item && item.id ? item.id : `bucket-${index}`}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#007AFF']}
              tintColor="#007AFF"
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
      
      <AddBucketModal
        isVisible={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreateBucket={handleCreateBucket}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1C1C1E',
  },
  headerContent: {
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  refreshButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#111111',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1C1C1E',
  },
  refreshButtonText: {
    color: '#E5E5E7',
    fontSize: 16,
    fontWeight: '500',
  },
  addButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  listContainer: {
    padding: 20,
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    color: '#8E8E93',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
  },
  loadingState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 16,
  },
});

export default BucketsPage;
