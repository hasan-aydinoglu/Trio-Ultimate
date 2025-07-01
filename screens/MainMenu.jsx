import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const MainMenu = ({ navigation }) => {
  return (
    <LinearGradient colors={['#2C3E50', '#34495E']} style={styles.container}>
      <Text style={styles.title}>MAIN MENU</Text>

      <TouchableOpacity style={styles.menuButton} onPress={() => navigation.navigate('Game')}>
        <Ionicons name="game-controller" size={28} color="#fff" />
        <Text style={styles.buttonText}>Play</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuButton} onPress={() => alert('Friends page coming soon!')}>
        <Ionicons name="people" size={28} color="#fff" />
        <Text style={styles.buttonText}>Friends</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuButton} onPress={() => alert('Messages page coming soon!')}>
        <Ionicons name="chatbubble-ellipses" size={28} color="#fff" />
        <Text style={styles.buttonText}>Messages</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  title: {
    fontSize: 38, fontWeight: 'bold', color: '#ecf0f1', marginBottom: 40, textShadowColor: '#1abc9c',
    textShadowOffset: { width: 2, height: 2 }, textShadowRadius: 5,
  },
  menuButton: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#1abc9c',
    paddingVertical: 15, paddingHorizontal: 30, borderRadius: 30, marginBottom: 20,
    width: '80%', justifyContent: 'center',
  },
  buttonText: { color: '#fff', fontSize: 22, marginLeft: 15, fontWeight: 'bold' },
});

export default MainMenu;