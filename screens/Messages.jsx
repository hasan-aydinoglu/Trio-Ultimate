import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const Messages = () => {
  return (
    <LinearGradient colors={['#2C3E50', '#34495E']} style={styles.container}>
      <Text style={styles.title}>Messages</Text>
      <Text style={styles.subtitle}>Your messages will show up here 💬</Text>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: {
    fontSize: 32,
    color: '#ecf0f1',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    color: '#bdc3c7',
    textAlign: 'center',
    paddingHorizontal: 30,
  },
});

export default Messages;