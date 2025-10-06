import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { getAllBuckets } from '../../../services/bucketsService';
import { deleteLead as deleteLeadService, getAllLeads, updateLeadNotes, updateLeadStatus } from '../../../services/leadsService';
import { deleteLead, setError, setLeads, setLoading, setSelectedBucketId, updateLead } from '../../../store/slices/leadsSlice';
import LeadsContainer from './components/LeadsContainer';

const LeadsPage = ({ route, onBack }) => {
  const dispatch = useDispatch();
  const { leads, loading, selectedBucketId } = useSelector((state) => state.leads);
  const { buckets } = useSelector((state) => state.buckets);
  const [bucketsLoading, setBucketsLoading] = useState(true);
  const [currentBucket, setCurrentBucket] = useState(null);

  // Get bucketId from route params if available
  const bucketId = route?.params?.bucketId || selectedBucketId;

  // Fetch leads from API
  const fetchLeads = async (bucketIdParam = null) => {
    try {
      dispatch(setLoading(true));
      const leadsData = await getAllLeads(bucketIdParam);
      dispatch(setLeads(leadsData));
    } catch (error) {
      console.error('Error fetching leads:', error);
      dispatch(setError(error.message));
    }
  };

  // Fetch buckets from API
  const fetchBuckets = async () => {
    try {
      setBucketsLoading(true);
      const bucketsData = await getAllBuckets();
      // Find the current bucket
      const bucket = bucketsData.find(b => b.id === bucketId);
      setCurrentBucket(bucket);
    } catch (error) {
      console.error('Error fetching buckets:', error);
    } finally {
      setBucketsLoading(false);
    }
  };

  // Function to update lead notes
  const handleUpdateLeadNotes = async (leadId, newNotes) => {
    try {
      const response = await updateLeadNotes(leadId, newNotes);
      if (response.status_code === 200) {
        dispatch(updateLead({ leadId, updates: { notes: newNotes } }));
        console.log('Notes updated successfully for lead:', leadId);
      } else {
        console.error('Failed to update notes:', response.content);
        Alert.alert('Error', 'Failed to update notes');
      }
    } catch (error) {
      console.error('Error updating lead notes:', error);
      Alert.alert('Error', 'Failed to update notes');
    }
  };

  // Function to update lead status
  const handleUpdateLeadStatus = async (leadId, newStatus) => {
    try {
      const response = await updateLeadStatus(leadId, newStatus);
      if (response.status_code === 200) {
        dispatch(updateLead({ leadId, updates: { status: newStatus } }));
        console.log('Status updated successfully for lead:', leadId);
      } else {
        console.error('Failed to update status:', response.content);
        Alert.alert('Error', 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating lead status:', error);
      Alert.alert('Error', 'Failed to update status');
    }
  };

  // Function to delete lead
  const handleDeleteLead = async (leadId) => {
    Alert.alert(
      'Delete Lead',
      'Are you sure you want to delete this lead?',
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
              const response = await deleteLeadService(leadId, bucketId);
              if (response.status_code === 200) {
                dispatch(deleteLead(leadId));
                console.log('Lead deleted successfully:', leadId);
              } else {
                console.error('Failed to delete lead:', response.content);
                Alert.alert('Error', 'Failed to delete lead');
              }
            } catch (error) {
              console.error('Error deleting lead:', error);
              Alert.alert('Error', 'Failed to delete lead');
            }
          },
        },
      ]
    );
  };

  // Handle bucket selection
  const handleBucketChange = (newBucketId) => {
    dispatch(setSelectedBucketId(newBucketId));
    const bucket = buckets.find(b => b.id === newBucketId);
    setCurrentBucket(bucket);
    fetchLeads(newBucketId);
  };

  // Handle refetch leads
  const handleRefetchLeads = () => {
    fetchLeads(bucketId);
  };

  // Handle back navigation
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      // This would typically use navigation.goBack() in a real app
      console.log('Navigate back to buckets');
    }
  };

  // Fetch buckets and leads on component mount
  useEffect(() => {
    const loadData = async () => {
      if (bucketId) {
        dispatch(setSelectedBucketId(bucketId));
        await fetchLeads(bucketId);
      }
      await fetchBuckets();
    };

    loadData();
  }, [bucketId]);

  if (loading || bucketsLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>
          {bucketsLoading ? 'Loading buckets...' : 'Loading leads...'}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.title}>Leads</Text>
            <Text style={styles.subtitle}>
              Browse through your leads one at a time
            </Text>
          </View>
        </View>
        
        {/* Bucket Selection and Controls */}
        <View style={styles.controls}>
          <View style={styles.bucketSelector}>
            <Text style={styles.selectorLabel}>Filter by Bucket:</Text>
            <View style={styles.bucketList}>
              {buckets.map((bucket) => (
                <TouchableOpacity
                  key={bucket.id}
                  style={[
                    styles.bucketOption,
                    bucketId === bucket.id && styles.bucketOptionSelected
                  ]}
                  onPress={() => handleBucketChange(bucket.id)}
                >
                  <Text style={[
                    styles.bucketOptionText,
                    bucketId === bucket.id && styles.bucketOptionTextSelected
                  ]}>
                    {bucket.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={handleRefetchLeads}
            disabled={loading}
          >
            <Text style={styles.refreshButtonText}>
              {loading ? 'Loading...' : '↻ Refresh'}
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Lead count display */}
        <View style={styles.leadCount}>
          <Text style={styles.leadCountText}>
            Showing {leads.length} leads from bucket: {currentBucket?.name || 'Unknown'}
          </Text>
        </View>
      </View>
      
      <LeadsContainer 
        leads={leads} 
        updateLeadNotes={handleUpdateLeadNotes} 
        updateLeadStatus={handleUpdateLeadStatus} 
        deleteLead={handleDeleteLead} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  loadingText: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 16,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1C1C1E',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    marginRight: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#111111',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1C1C1E',
  },
  backButtonText: {
    color: '#E5E5E7',
    fontSize: 16,
    fontWeight: '500',
  },
  headerContent: {
    flex: 1,
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
  controls: {
    marginBottom: 16,
  },
  bucketSelector: {
    marginBottom: 12,
  },
  selectorLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#E5E5E7',
    marginBottom: 8,
  },
  bucketList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  bucketOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#1C1C1E',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#1C1C1E',
  },
  bucketOptionSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  bucketOptionText: {
    fontSize: 14,
    color: '#E5E5E7',
  },
  bucketOptionTextSelected: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  refreshButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  refreshButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  leadCount: {
    marginTop: 8,
  },
  leadCountText: {
    fontSize: 14,
    color: '#8E8E93',
  },
});

export default LeadsPage;
