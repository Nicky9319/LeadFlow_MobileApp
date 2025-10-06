import { useEffect, useState } from 'react';
import { Alert, Dimensions, Linking, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const LeadCard = ({ lead, isActive, updateLeadNotes, updateLeadStatus, deleteLead, onEditingChange }) => {
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [editedNotes, setEditedNotes] = useState('');
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [editedStatus, setEditedStatus] = useState('');

  // Notify parent when editing state changes
  useEffect(() => {
    const isEditing = isEditingNotes || isEditingStatus;
    if (onEditingChange) {
      onEditingChange(!isEditing); // Pass !isEditing because we want to disable swipe when editing
    }
  }, [isEditingNotes, isEditingStatus, onEditingChange]);

  if (!lead) return null;

  const handleNotesEdit = () => {
    setIsEditingNotes(true);
    setEditedNotes(lead.notes || '');
  };

  const handleNotesSave = () => {
    if (updateLeadNotes) {
      updateLeadNotes(lead.leadId, editedNotes);
    }
    console.log('Notes updated for lead:', lead.leadId, 'New notes:', editedNotes);
    setIsEditingNotes(false);
  };

  const handleNotesCancel = () => {
    setIsEditingNotes(false);
    setEditedNotes('');
  };

  // Status editing functions
  const handleStatusEdit = () => {
    setIsEditingStatus(true);
    setEditedStatus(lead.status || '');
  };

  const handleStatusSave = () => {
    if (updateLeadStatus) {
      updateLeadStatus(lead.leadId, editedStatus);
    }
    console.log('Status updated for lead:', lead.leadId, 'New status:', editedStatus);
    setIsEditingStatus(false);
  };

  const handleStatusCancel = () => {
    setIsEditingStatus(false);
    setEditedStatus('');
  };

  const handleLinkPress = async (url) => {
    try {
      // Extract platform from URL to determine the appropriate app scheme
      const platform = lead.platform?.toLowerCase();
      let appUrl = url;
      
      // Map platforms to their app schemes
      const appSchemes = {
        'linkedin': 'linkedin://',
        'instagram': 'instagram://',
        'twitter': 'twitter://',
        'x': 'twitter://',
        'facebook': 'fb://',
        'youtube': 'youtube://',
        'tiktok': 'tiktok://',
        'snapchat': 'snapchat://',
        'whatsapp': 'whatsapp://',
        'telegram': 'tg://',
        'discord': 'discord://',
        'reddit': 'reddit://',
        'behance': 'behance://',
        'dribbble': 'dribbble://',
        'github': 'github://',
        'medium': 'medium://',
        'pinterest': 'pinterest://',
      };

      // Try to open the native app first
      if (platform && appSchemes[platform]) {
        const nativeUrl = appSchemes[platform];
        
        // Check if the app is installed
        const canOpen = await Linking.canOpenURL(nativeUrl);
        if (canOpen) {
          // Try to open the native app
          try {
            await Linking.openURL(nativeUrl);
            return;
          } catch (error) {
            console.log('Native app failed, falling back to web:', error);
          }
        }
      }

      // Fallback to web browser
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Cannot open this URL');
      }
    } catch (error) {
      console.error('Error opening URL:', error);
      Alert.alert('Error', 'Failed to open URL');
    }
  };

  const handleDeleteClick = () => {
    if (deleteLead) {
      deleteLead(lead.leadId);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'cold message':
        return { backgroundColor: '#8E8E93', color: '#FFFFFF' };
      case 'first follow up':
        return { backgroundColor: '#007AFF', color: '#FFFFFF' };
      case 'second follow up':
        return { backgroundColor: '#FF9500', color: '#FFFFFF' };
      case 'meeting':
        return { backgroundColor: '#00D09C', color: '#FFFFFF' };
      case 'closed':
        return { backgroundColor: '#FF3B30', color: '#FFFFFF' };
      case 'qualified':
        return { backgroundColor: '#00D09C', color: '#FFFFFF' };
      case 'contacted':
        return { backgroundColor: '#FF9500', color: '#FFFFFF' };
      case 'new':
        return { backgroundColor: '#007AFF', color: '#FFFFFF' };
      default:
        return { backgroundColor: '#8E8E93', color: '#FFFFFF' };
    }
  };

  const getPlatformIcon = (platform) => {
    switch (platform?.toLowerCase()) {
      case 'linkedin':
        return '💼';
      case 'insta':
        return '📷';
      case 'reddit':
        return '🔴';
      case 'behance':
        return '🎨';
      case 'pinterest':
        return '📌';
      case 'x':
        return '🐦';
      case 'email':
        return '📧';
      default:
        return '🌐';
    }
  };

  const statusColors = getStatusColor(lead.status);

  return (
    <View style={[styles.card, !isActive && styles.cardInactive]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {lead.username?.charAt(0)?.toUpperCase() || 'L'}
            </Text>
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.username}>@{lead.username || 'Unknown User'}</Text>
            <View style={styles.platformInfo}>
              <Text style={styles.platformIcon}>{getPlatformIcon(lead.platform)}</Text>
              <Text style={styles.platformText}>{lead.platform || 'Unknown Platform'}</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDeleteClick}
        >
          <Text style={styles.deleteIcon}>🗑</Text>
        </TouchableOpacity>
      </View>

      {/* Profile URL */}
      {lead.url && (
        <View style={styles.urlSection}>
          <TouchableOpacity 
            style={styles.urlButton}
            onPress={() => handleLinkPress(lead.url)}
          >
            <Text style={styles.urlText}>
              {lead.url.replace('https://', '').replace('http://', '')}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Status Section */}
      <View style={styles.statusSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Status</Text>
          {!isEditingStatus && (
            <TouchableOpacity
              style={styles.editButton}
              onPress={handleStatusEdit}
            >
              <Text style={styles.editIcon}>✎</Text>
            </TouchableOpacity>
          )}
        </View>
        
        {isEditingStatus ? (
          <View style={styles.editContainer}>
            <TextInput
              style={styles.statusInput}
              value={editedStatus}
              onChangeText={setEditedStatus}
              placeholder="Type custom status..."
              placeholderTextColor="#8E8E93"
              autoFocus
            />
            <View style={styles.statusButtons}>
              {['cold message', 'first follow up', 'second follow up', 'meeting', 'closed'].map((status) => (
                <TouchableOpacity
                  key={status}
                  style={styles.statusOption}
                  onPress={() => setEditedStatus(status)}
                >
                  <Text style={styles.statusOptionText}>{status}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.editActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleStatusCancel}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleStatusSave}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity 
            style={styles.statusDisplay}
            onPress={handleStatusEdit}
          >
            <View style={[styles.statusBadge, { backgroundColor: statusColors.backgroundColor }]}>
              <Text style={[styles.statusText, { color: statusColors.color }]}>
                {lead.status || 'Cold Message'}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      </View>

      {/* Notes Section */}
      <View style={styles.notesSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Notes</Text>
          {!isEditingNotes && (
            <TouchableOpacity
              style={styles.editButton}
              onPress={handleNotesEdit}
            >
              <Text style={styles.editIcon}>✎</Text>
            </TouchableOpacity>
          )}
        </View>
        
        {isEditingNotes ? (
          <View style={styles.editContainer}>
            <TextInput
              style={styles.notesInput}
              value={editedNotes}
              onChangeText={setEditedNotes}
              placeholder="Add your notes here..."
              placeholderTextColor="#8E8E93"
              multiline
              autoFocus
            />
            <View style={styles.editActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleNotesCancel}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleNotesSave}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity 
            style={styles.notesDisplay}
            onPress={handleNotesEdit}
          >
            <Text style={[styles.notesText, !lead.notes && styles.notesPlaceholder]}>
              {lead.notes || 'Click to add notes...'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const { width: screenWidth } = Dimensions.get('window');

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#111111',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1C1C1E',
    padding: screenWidth < 400 ? 12 : 14,
    marginHorizontal: 0,
    marginVertical: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
    width: '100%',
  },
  cardInactive: {
    opacity: 0.5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: screenWidth < 400 ? 12 : 14,
    paddingBottom: screenWidth < 400 ? 10 : 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1C1C1E',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 6,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: screenWidth < 400 ? 10 : 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  userDetails: {
    flex: 1,
  },
  username: {
    fontSize: screenWidth < 400 ? 15 : 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 3,
  },
  platformInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  platformIcon: {
    fontSize: 15,
    marginRight: 5,
  },
  platformText: {
    fontSize: 13,
    color: '#8E8E93',
    fontWeight: '500',
  },
  deleteButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    minWidth: 36,
    minHeight: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteIcon: {
    fontSize: 16,
    color: '#FF3B30',
  },
  urlSection: {
    marginBottom: screenWidth < 400 ? 12 : 14,
  },
  urlButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#1C1C1E',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2D2D2F',
    minHeight: 40,
    justifyContent: 'center',
  },
  urlText: {
    fontSize: 13,
    color: '#007AFF',
    fontWeight: '500',
    textAlign: 'center',
  },
  statusSection: {
    marginBottom: screenWidth < 400 ? 12 : 14,
  },
  notesSection: {
    marginBottom: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E5E5E7',
  },
  editButton: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: 'rgba(142, 142, 147, 0.1)',
    minWidth: 32,
    minHeight: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editIcon: {
    fontSize: 13,
    color: '#8E8E93',
  },
  editContainer: {
    gap: 8,
  },
  notesInput: {
    backgroundColor: '#1C1C1E',
    borderWidth: 2,
    borderColor: '#007AFF',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#E5E5E7',
    minHeight: 60,
    textAlignVertical: 'top',
    lineHeight: 18,
  },
  statusInput: {
    backgroundColor: '#1C1C1E',
    borderWidth: 2,
    borderColor: '#007AFF',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#E5E5E7',
    minHeight: 40,
  },
  statusButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  statusOption: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#2D2D2F',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#3D3D3F',
    minHeight: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusOptionText: {
    fontSize: 12,
    color: '#E5E5E7',
    textTransform: 'capitalize',
    fontWeight: '500',
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  cancelButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#2D2D2F',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3D3D3F',
    minHeight: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 13,
    color: '#E5E5E7',
    fontWeight: '500',
  },
  saveButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    minHeight: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  notesDisplay: {
    backgroundColor: '#1C1C1E',
    borderRadius: 10,
    padding: 12,
    minHeight: 60,
    borderWidth: 1,
    borderColor: '#2D2D2F',
    justifyContent: 'center',
  },
  notesText: {
    fontSize: 14,
    color: '#E5E5E7',
    lineHeight: 18,
  },
  notesPlaceholder: {
    color: '#8E8E93',
    fontStyle: 'italic',
  },
  statusDisplay: {
    padding: 2,
    minHeight: 36,
    justifyContent: 'center',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
    minHeight: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});

export default LeadCard;
