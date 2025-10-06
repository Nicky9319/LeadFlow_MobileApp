import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function MainPage() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>This is Main Page</Text>
      <Text style={styles.subtitle}>Nothing else</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
  },
});
