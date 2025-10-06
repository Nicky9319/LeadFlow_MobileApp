import { Theme } from '@/constants/Theme';
import logger from '@/services/Logger';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function DebugPanel({ visible = false, onClose }) {
  const [logs, setLogs] = useState([]);
  const [logLevel, setLogLevel] = useState('INFO');

  useEffect(() => {
    if (visible) {
      // Update logs every second when visible
      const interval = setInterval(() => {
        const recentLogs = logger.getLogHistory(50);
        setLogs(recentLogs);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [visible]);

  const getLogLevelColor = (level) => {
    switch (level) {
      case 'ERROR': return '#ff4444';
      case 'WARN': return '#ffaa00';
      case 'INFO': return '#44aa44';
      case 'DEBUG': return '#4444ff';
      case 'TRACE': return '#888888';
      default: return Theme.mutedText;
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const clearLogs = () => {
    logger.clearLogHistory();
    setLogs([]);
  };

  const exportLogs = () => {
    const logData = logger.exportLogs();
    console.log('Exported logs:', logData);
    // In a real app, you might want to share this or save to file
  };

  if (!visible) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Debug Panel</Text>
        <View style={styles.headerControls}>
          <TouchableOpacity style={styles.button} onPress={clearLogs}>
            <Text style={styles.buttonText}>Clear</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={exportLogs}>
            <Text style={styles.buttonText}>Export</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.buttonText}>✕</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <ScrollView style={styles.logContainer}>
        {logs.map((log, index) => (
          <View key={index} style={styles.logEntry}>
            <View style={styles.logHeader}>
              <Text style={[styles.logLevel, { color: getLogLevelColor(log.level) }]}>
                {log.level}
              </Text>
              <Text style={styles.logTime}>
                {formatTimestamp(log.timestamp)}
              </Text>
              <Text style={styles.logComponent}>
                {log.component}
              </Text>
            </View>
            <Text style={styles.logMessage}>
              {log.message}
            </Text>
            {log.data && (
              <Text style={styles.logData}>
                {JSON.stringify(log.data, null, 2)}
              </Text>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 10,
    right: 10,
    bottom: 100,
    backgroundColor: Theme.primaryBackground,
    borderWidth: 1,
    borderColor: Theme.borderColors,
    borderRadius: 8,
    zIndex: 1000,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: Theme.borderColors,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Theme.primaryText,
  },
  headerControls: {
    flexDirection: 'row',
    gap: 5,
  },
  button: {
    backgroundColor: Theme.primaryBlue,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
  },
  closeButton: {
    backgroundColor: Theme.mutedText,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
  },
  buttonText: {
    color: Theme.primaryText,
    fontSize: 12,
  },
  logContainer: {
    flex: 1,
    padding: 10,
  },
  logEntry: {
    marginBottom: 8,
    padding: 8,
    backgroundColor: Theme.secondaryBackground,
    borderRadius: 4,
  },
  logHeader: {
    flexDirection: 'row',
    marginBottom: 4,
    gap: 10,
  },
  logLevel: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  logTime: {
    fontSize: 10,
    color: Theme.mutedText,
  },
  logComponent: {
    fontSize: 10,
    color: Theme.primaryText,
    fontWeight: 'bold',
  },
  logMessage: {
    fontSize: 12,
    color: Theme.primaryText,
    marginBottom: 4,
  },
  logData: {
    fontSize: 10,
    color: Theme.mutedText,
    fontFamily: 'monospace',
  },
});
