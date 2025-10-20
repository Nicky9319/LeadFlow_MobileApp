import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, BackHandler, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { getAllBuckets } from '../../../services/bucketsService';
import { deleteLead as deleteLeadService, getAllLeads, updateLeadNotes, updateLeadStatus } from '../../../services/leadsService';
import { deleteLead, setError, setLeads, setLoading, setSelectedBucketId, updateLead } from '../../../store/slices/leadsSlice';
import LeadsContainer from './components/LeadsContainer';

const LeadsPage = ({ route, onBack }) => {
  const dispatch = useDispatch();
  const { leads, loading, selectedBucketId } = useSelector((state) => state.leads);
  const [bucketsLoading, setBucketsLoading] = useState(true);
  const [currentBucket, setCurrentBucket] = useState(null);
  const scrollViewRef = useRef(null);
  // Track current index for card navigation
  const [currentIndex, setCurrentIndex] = useState(0);

  // Get bucketId from route params if available
  const bucketId = route?.params?.bucketId || selectedBucketId;

  // Fetch leads from API
  const fetchLeads = async (bucketIdParam = null) => {
    try {
      dispatch(setLoading(true));
      const leadsData = await getAllLeads(bucketIdParam);
      dispatch(setLeads(leadsData));
      // Do NOT reset currentIndex here
    } catch (error) {
      console.error('Error fetching leads:', error);
      dispatch(setError(error.message));
    }
  };

  // Fetch current bucket info
  const fetchCurrentBucket = async () => {
    try {
      setBucketsLoading(true);
      const bucketsData = await getAllBuckets();
      // Find the current bucket
      const bucket = bucketsData.find(b => b.id === bucketId);
      setCurrentBucket(bucket);
    } catch (error) {
      console.error('Error fetching bucket info:', error);
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
        // Do NOT reset currentIndex here
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
                // If deleted lead was last, adjust index
                setCurrentIndex(prev => {
                  if (leads.length <= 1) return 0;
                  return prev >= leads.length - 1 ? leads.length - 2 : prev;
                });
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


  // Handle refetch leads
  const handleRefetchLeads = () => {
    fetchLeads(bucketId);
  };

  // Handle scroll to bottom when editing
  const handleScrollToEditing = () => {
    if (scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current.scrollToEnd({ animated: true });
      }, 300); // Increased delay to ensure keyboard is fully open
    }
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
      await fetchCurrentBucket();
    };

    loadData();
  }, [bucketId]);

  // If leads array shrinks, keep currentIndex in bounds
  useEffect(() => {
    setCurrentIndex(prev => {
      if (leads.length === 0) return 0;
      return prev >= leads.length ? leads.length - 1 : prev;
    });
  }, [leads.length]);

  // Handle Android back button
  useEffect(() => {
    const backAction = () => {
      handleBack();
      return true; // Prevent default behavior
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove();
  }, []);

  if (loading || bucketsLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>
          {bucketsLoading ? 'Loading bucket info...' : 'Loading leads...'}
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView 
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
            <View style={styles.headerContent}>
              <Text style={styles.title}>Leads</Text>
              <Text style={styles.subtitle}>
                Browse through your leads
              </Text>
            </View>
          </View>
          
          {/* Bucket Name and Refresh Button */}
          <View style={styles.topControls}>
            <View style={styles.bucketNameContainer}>
              <Text style={styles.bucketNameLabel}>Bucket:</Text>
              <Text style={styles.bucketNameText}>
                {currentBucket?.name || 'Unknown'}
              </Text>
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
              {leads.length} leads in this bucket
            </Text>
          </View>
        </View>
        
        <LeadsContainer 
          leads={leads} 
          updateLeadNotes={handleUpdateLeadNotes} 
          updateLeadStatus={handleUpdateLeadStatus} 
          deleteLead={handleDeleteLead}
          onEditingStart={handleScrollToEditing}
          currentIndex={currentIndex}
          setCurrentIndex={setCurrentIndex}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
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
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1C1C1E',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  backButton: {
    marginRight: 12,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#111111',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1C1C1E',
  },
  backButtonText: {
    color: '#E5E5E7',
    fontSize: 15,
    fontWeight: '500',
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#8E8E93',
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  bucketNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  bucketNameLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#8E8E93',
    marginRight: 6,
  },
  bucketNameText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  refreshButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  refreshButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '500',
  },
  leadCount: {
    marginTop: 6,
  },
  leadCountText: {
    fontSize: 12,
    color: '#8E8E93',
  },
});

export default LeadsPage;
