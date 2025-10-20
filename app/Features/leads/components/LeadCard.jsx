import { useEffect, useState } from 'react';
import { Alert, Clipboard, Dimensions, Linking, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import BucketSelector from './BucketSelector';


const openSocialLink = async (appUrl, webUrl) => {
  try {
    // Check if the app can be opened
    const supported = await Linking.canOpenURL(appUrl);
    if (supported) {
      await Linking.openURL(appUrl);
    } else {
      await Linking.openURL(webUrl); // fallback to web
    }
  } catch (error) {
    Alert.alert('Error', 'Unable to open the link.');
  }
};

const LeadCard = ({ lead, isActive, updateLeadNotes, updateLeadStatus, deleteLead, onEditingChange, onEditingStart, moveLeadToBucket, buckets, currentBucketId }) => {
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [editedNotes, setEditedNotes] = useState('');
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [editedStatus, setEditedStatus] = useState('');
  const [isOpeningLink, setIsOpeningLink] = useState(false);

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
    if (onEditingStart) {
      onEditingStart();
    }
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
    if (onEditingStart) {
      onEditingStart();
    }
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

  const normalizePlatform = (rawPlatform) => {
    const p = rawPlatform?.toLowerCase() || '';
    if (p === 'insta') return 'instagram';
    if (p === 'x') return 'twitter';
    if (p === 'gmail') return 'email';
    return p;
  };

  const extractUsernameFromUrl = (platform, url) => {
    try {
      if (!url || typeof url !== 'string') return '';
      
      const u = new URL(url);
      const host = u.hostname.replace('www.', '').toLowerCase();
      const segments = u.pathname.split('/').filter(Boolean);

      switch (platform) {
        case 'instagram':
          // https://instagram.com/{username} or https://www.instagram.com/{username}
          if (host === 'instagram.com' || host === 'instagr.am') {
            return segments[0] || '';
          }
          return '';
          
        case 'twitter':
          // https://twitter.com/{username} or https://x.com/{username}
          if (host === 'twitter.com' || host === 'x.com') {
            return segments[0] || '';
          }
          return '';
          
        case 'linkedin':
          // https://linkedin.com/in/{slug} or https://www.linkedin.com/in/{slug}
          if (host === 'linkedin.com') {
            if (segments[0] === 'in') return segments[1] || '';
            // Sometimes LinkedIn URLs don't have /in/ prefix
            if (segments.length > 0) return segments[0] || '';
          }
          return '';
          
        case 'pinterest':
          // https://pinterest.com/{username}/ or https://www.pinterest.com/{username}/
          if (host === 'pinterest.com') {
            return segments[0] || '';
          }
          return '';
          
        case 'reddit':
          // https://reddit.com/user/{username} or https://www.reddit.com/u/{username}
          if (host === 'reddit.com') {
            if (segments[0] === 'user' || segments[0] === 'u') {
              return segments[1] || '';
            }
            // Sometimes Reddit URLs are just /u/{username}
            if (segments.length > 0) return segments[0] || '';
          }
          return '';
          
        default:
          return '';
      }
    } catch (error) {
      console.log('Error extracting username from URL:', error);
      return '';
    }
  };

  const extractEmailFromUrl = (url) => {
    try {
      if (!url) return '';
      if (url.startsWith('mailto:')) return url.substring('mailto:'.length);
      const emailMatch = url.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
      return emailMatch ? emailMatch[0] : '';
    } catch (_) {
      return '';
    }
  };

  const preprocessUrl = (rawUrl) => {
    try {
      if (!rawUrl || typeof rawUrl !== 'string') return '';
      const cleaned = rawUrl.trim().replace(/^@+/, '');
      return cleaned;
    } catch (_) {
      return rawUrl || '';
    }
  };

  const buildNativeDeepLink = (platform, url) => {
    const p = normalizePlatform(platform);
    const username = extractUsernameFromUrl(p, url) || lead?.username || '';

    switch (p) {
      case 'instagram':
        if (username) {
          return `instagram://user?username=${encodeURIComponent(username)}`;
        }
        // Fallback to opening Instagram app
        return 'instagram://';
        
      case 'twitter':
        if (username) {
          return `twitter://user?screen_name=${encodeURIComponent(username)}`;
        }
        // Fallback to opening Twitter app
        return 'twitter://';
        
      case 'linkedin':
        if (username) {
          // Try multiple LinkedIn deep link formats
          return `linkedin://in/${encodeURIComponent(username)}`;
        }
        // Fallback to opening LinkedIn app
        return 'linkedin://';
        
      case 'pinterest':
        if (username) {
          return `pinterest://user/${encodeURIComponent(username)}`;
        }
        // Fallback to opening Pinterest app
        return 'pinterest://';
        
      case 'reddit':
        if (username) {
          return `reddit://user/${encodeURIComponent(username)}`;
        }
        // Fallback to opening Reddit app
        return 'reddit://';
        
      case 'email': {
        const email = extractEmailFromUrl(url) || (lead?.username?.includes('@') ? lead.username : '');
        return email ? `mailto:${email}` : null;
      }
      
      case 'gmail':
        const email = extractEmailFromUrl(url) || (lead?.username?.includes('@') ? lead.username : '');
        if (email) {
          return `mailto:${email}`;
        }
        // Fallback to Gmail app
        return 'googlegmail://';
        
      default:
        return null;
    }
  };

  const handleLinkPress = async (url) => {
    if (isOpeningLink) return;

    setIsOpeningLink(true);
    try {
      const processedUrl = preprocessUrl(url);

      if (!processedUrl || (!processedUrl.startsWith('http') && !processedUrl.startsWith('mailto:'))) {
        Alert.alert(
          'Invalid URL',
          'This link appears to be invalid or malformed. Please check the URL format.',
          [
            { text: 'Copy URL', onPress: () => Clipboard.setString(processedUrl || '') },
            { text: 'OK', style: 'default' }
          ]
        );
        return;
      }

      const platform = normalizePlatform(lead.platform);
      const appUrlCandidate = buildNativeDeepLink(platform, processedUrl);
      const appUrl = appUrlCandidate || processedUrl;
      const webUrl = processedUrl; // default given value as fallback

      await openSocialLink(appUrl, webUrl);
    } catch (error) {
      Alert.alert(
        'Error',
        'Unable to open the link.',
        [
          { text: 'Copy URL', onPress: () => Clipboard.setString(url || '') },
          { text: 'OK', style: 'default' }
        ]
      );
    } finally {
      setIsOpeningLink(false);
    }
  };

  const handleDeleteClick = () => {
    if (deleteLead) {
      deleteLead(lead.leadId);
    }
  };

  const handleCopyUrl = async () => {
    try {
      await Clipboard.setString(lead.url);
      Alert.alert('Copied!', 'URL has been copied to clipboard');
    } catch (error) {
      console.error('Failed to copy URL:', error);
      Alert.alert('Error', 'Failed to copy URL to clipboard');
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
            style={[styles.urlButton, isOpeningLink && styles.urlButtonLoading]}
            onPress={() => handleLinkPress(lead.url)}
            disabled={isOpeningLink}
          >
            <Text style={styles.urlText}>
              {isOpeningLink ? 'Opening...' : lead.url.replace('https://', '').replace('http://', '')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.copyButton}
            onPress={handleCopyUrl}
            activeOpacity={0.7}
          >
            <Text style={styles.copyButtonText}>📋</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Status Section */}
      <View style={styles.statusSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Status</Text>
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

      {/* Bucket Section */}
      {moveLeadToBucket && buckets && currentBucketId && (
        <View style={styles.bucketSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Move to Bucket</Text>
          </View>
          <BucketSelector
            buckets={buckets}
            currentBucketId={currentBucketId}
            onBucketChange={moveLeadToBucket}
            leadId={lead.leadId}
            style={styles.bucketSelector}
          />
        </View>
      )}

      {/* Notes Section */}
      <View style={styles.notesSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Notes</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  urlButton: {
    flex: 1,
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
  urlButtonLoading: {
    opacity: 0.7,
    backgroundColor: '#2D2D2F',
  },
  copyButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#1C1C1E',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2D2D2F',
    minHeight: 40,
    minWidth: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  copyButtonText: {
    fontSize: 16,
    color: '#8E8E93',
  },
  statusSection: {
    marginBottom: screenWidth < 400 ? 12 : 14,
  },
  bucketSection: {
    marginBottom: screenWidth < 400 ? 12 : 14,
  },
  bucketSelector: {
    marginTop: 8,
  },
  notesSection: {
    marginBottom: 0,
  },
  sectionHeader: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E5E5E7',
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
    minHeight: 80,
    maxHeight: 120,
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
