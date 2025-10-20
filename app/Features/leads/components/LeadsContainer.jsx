import { useEffect, useRef, useState } from 'react';
import { Dimensions, PanResponder, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import LeadCard from './LeadCard';

const { width: screenWidth } = Dimensions.get('window');

const LeadsContainer = ({ leads = [], updateLeadNotes, updateLeadStatus, deleteLead, onEditingStart, currentIndex, setCurrentIndex }) => {
  const [isEditingCounter, setIsEditingCounter] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [isSwipeEnabled, setIsSwipeEnabled] = useState(true);

  // Remove local currentIndex state, use prop instead

  const handlePrevious = () => {
    setCurrentIndex(prev => prev > 0 ? prev - 1 : leads.length - 1);
  };

  const handleNext = () => {
    setCurrentIndex(prev => prev < leads.length - 1 ? prev + 1 : 0);
  };

  const handleCounterClick = () => {
    setIsEditingCounter(true);
    setEditValue(currentIndex + 1);
  };

  const handleCounterEdit = () => {
    const index = parseInt(editValue) - 1; // Convert to 0-based index
    if (index >= 0 && index < leads.length) {
      setCurrentIndex(index);
    }
    setIsEditingCounter(false);
    setEditValue('');
  };

  const handleCounterBlur = () => {
    handleCounterEdit();
  };

  // Create PanResponder for swipe gestures
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Only respond to horizontal swipes and when swipe is enabled
        return isSwipeEnabled && Math.abs(gestureState.dx) > Math.abs(gestureState.dy) && Math.abs(gestureState.dx) > 20;
      },
      onPanResponderGrant: () => {
        // Gesture started
      },
      onPanResponderMove: (evt, gestureState) => {
        // Handle move if needed (for visual feedback)
      },
      onPanResponderRelease: (evt, gestureState) => {
        // Handle swipe completion
        if (leads.length <= 1) return;
        const swipeThreshold = 50; // Minimum distance for a swipe
        if (gestureState.dx > swipeThreshold) {
          // Swipe right - go to previous lead
          handlePrevious();
        } else if (gestureState.dx < -swipeThreshold) {
          // Swipe left - go to next lead
          handleNext();
        }
      },
      onPanResponderTerminate: () => {
        // Gesture was terminated
      },
    })
  ).current;

  // Disable swipe when editing to prevent conflicts
  useEffect(() => {
    setIsSwipeEnabled(!isEditingCounter);
  }, [isEditingCounter]);

  if (leads.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIcon}>
          <Text style={styles.emptyIconText}>👥</Text>
        </View>
        <Text style={styles.emptyTitle}>No Leads Found</Text>
        <Text style={styles.emptySubtitle}>Add some leads to get started with the card view.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with Counter and Navigation */}
      <View style={styles.header}>
        {/* Counter */}
        <View style={styles.counterSection}>
          {isEditingCounter ? (
            <View style={styles.counterEdit}>
              <Text style={styles.counterLabel}>Lead</Text>
              <TextInput
                style={styles.counterInput}
                value={editValue.toString()}
                onChangeText={setEditValue}
                onBlur={handleCounterBlur}
                keyboardType="numeric"
                autoFocus
              />
              <Text style={styles.counterLabel}>of {leads.length}</Text>
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.counterDisplay}
              onPress={handleCounterClick}
            >
              <Text style={styles.counterText}>
                Lead {currentIndex + 1} of {leads.length}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Navigation Buttons */}
        <View style={styles.navigationButtons}>
          <TouchableOpacity
            style={[styles.navButton, leads.length <= 1 && styles.navButtonDisabled]}
            onPress={handlePrevious}
            disabled={leads.length <= 1}
          >
            <Text style={styles.navButtonText}>←</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.navButton, leads.length <= 1 && styles.navButtonDisabled]}
            onPress={handleNext}
            disabled={leads.length <= 1}
          >
            <Text style={styles.navButtonText}>→</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill,
              { width: `${((currentIndex + 1) / leads.length) * 100}%` }
            ]}
          />
        </View>
      </View>

      {/* Card Container */}
      <View 
        style={styles.cardContainer}
        {...panResponder.panHandlers}
      >
        <LeadCard 
          lead={leads[currentIndex]} 
          isActive={true}
          updateLeadNotes={updateLeadNotes}
          updateLeadStatus={updateLeadStatus}
          deleteLead={deleteLead}
          onEditingChange={setIsSwipeEnabled} // Pass callback to disable swipe during editing
          onEditingStart={onEditingStart} // Pass callback to scroll when editing starts
        />
      </View>

      {/* Navigation Info */}
      <View style={styles.navigationInfo}>
        <Text style={styles.navigationInfoText}>
          Swipe left/right or use buttons to navigate
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: screenWidth < 400 ? 12 : 16,
    paddingTop: screenWidth < 400 ? 8 : 12,
    paddingBottom: 24,
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    minHeight: 300,
  },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1C1C1E',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  emptyIconText: {
    fontSize: 28,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  counterSection: {
    flex: 1,
  },
  counterEdit: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  counterDisplay: {
    paddingVertical: 4,
  },
  counterLabel: {
    fontSize: 13,
    color: '#E5E5E7',
  },
  counterInput: {
    width: 44,
    height: 30,
    backgroundColor: '#1C1C1E',
    borderWidth: 2,
    borderColor: '#007AFF',
    borderRadius: 6,
    paddingHorizontal: 6,
    fontSize: 13,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  counterText: {
    fontSize: 13,
    color: '#E5E5E7',
  },
  navigationButtons: {
    flexDirection: 'row',
    gap: 6,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1C1C1E',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2D2D2F',
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: 16,
    color: '#E5E5E7',
    fontWeight: '600',
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBar: {
    width: '100%',
    height: 6,
    backgroundColor: '#1C1C1E',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 3,
  },
  cardContainer: {
    alignItems: 'center',
  },
  navigationInfo: {
    marginTop: 16,
    marginBottom: 8,
    alignItems: 'center',
  },
  navigationInfoText: {
    fontSize: 11,
    color: '#8E8E93',
    textAlign: 'center',
  },
});

export default LeadsContainer;
