import React, { useEffect, useState } from 'react';
import { Dimensions, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import LeadCard from './LeadCard';

const { width: screenWidth } = Dimensions.get('window');

const LeadsContainer = ({ leads = [], updateLeadNotes, updateLeadStatus, deleteLead }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isEditingCounter, setIsEditingCounter] = useState(false);
  const [editValue, setEditValue] = useState('');

  // Reset to first lead when leads change
  useEffect(() => {
    setCurrentIndex(0);
  }, [leads]);

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

  const handleCounterKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleCounterEdit();
    } else if (e.key === 'Escape') {
      setIsEditingCounter(false);
      setEditValue('');
    }
  };

  const handleCounterBlur = () => {
    handleCounterEdit();
  };

  // Handle touch gestures (simplified version without PanGestureHandler)
  const handleTouchStart = (event) => {
    // Store initial touch position for simple swipe detection
    // This is a simplified version - for full gesture support, use react-native-gesture-handler
  };

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
      <View style={styles.cardContainer}>
        <LeadCard 
          lead={leads[currentIndex]} 
          isActive={true}
          updateLeadNotes={updateLeadNotes}
          updateLeadStatus={updateLeadStatus}
          deleteLead={deleteLead}
        />
      </View>

      {/* Navigation Info */}
      <View style={styles.navigationInfo}>
        <Text style={styles.navigationInfoText}>
          Use navigation buttons to move between leads
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: screenWidth < 400 ? 12 : 16,
    paddingTop: screenWidth < 400 ? 12 : 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#1C1C1E',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyIconText: {
    fontSize: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  counterSection: {
    flex: 1,
  },
  counterEdit: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  counterDisplay: {
    paddingVertical: 8,
  },
  counterLabel: {
    fontSize: 14,
    color: '#E5E5E7',
  },
  counterInput: {
    width: 48,
    height: 32,
    backgroundColor: '#1C1C1E',
    borderWidth: 2,
    borderColor: '#007AFF',
    borderRadius: 6,
    paddingHorizontal: 8,
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  counterText: {
    fontSize: 14,
    color: '#E5E5E7',
  },
  navigationButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  navButton: {
    width: screenWidth < 400 ? 44 : 48,
    height: screenWidth < 400 ? 44 : 48,
    borderRadius: screenWidth < 400 ? 22 : 24,
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
    fontSize: 18,
    color: '#E5E5E7',
    fontWeight: '600',
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#1C1C1E',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  cardContainer: {
    flex: 1,
    minHeight: 500,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navigationInfo: {
    marginTop: 24,
    alignItems: 'center',
  },
  navigationInfoText: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
  },
});

export default LeadsContainer;
