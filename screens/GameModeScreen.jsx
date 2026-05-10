import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function GameModeScreen({ navigation }) {
  const handlePress = (mode) => {
    if (mode === 1) {
      navigation.navigate('GameScreen');

    } else if (mode === 2) {
      navigation.navigate('GameScreen2');

    } else {
      Alert.alert('Coming Soon', `Game Type ${mode} will be added soon.`);
    }
  };

  return (
    <LinearGradient
      colors={['#00c6ff', '#0072ff', '#000']}
      style={styles.container}
    >
      <Text style={styles.title}>Choose Game Type</Text>
      <Text style={styles.subtitle}>Select your TRIO game mode</Text>

      <View style={styles.card}>
        {[1, 2, 3, 4, 5].map((mode) => (
          <TouchableOpacity
            key={mode}
            style={styles.button}
            onPress={() => handlePress(mode)}
            activeOpacity={0.85}
          >
            <Text style={styles.buttonTitle}>
              Game Type {mode}
            </Text>

            <Text style={styles.buttonSubtitle}>
              {mode === 1
                ? 'Classic TRIO Game'
                : mode === 2
                ? 'Alternative Priority Mode'
                : 'Alternative TRIO Mode'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 22,
    justifyContent: 'center',
  },

  title: {
    fontSize: 30,
    fontWeight: '900',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginBottom: 28,
  },

  card: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    padding: 18,
  },

  button: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 15,
    paddingVertical: 15,
    marginBottom: 12,
  },

  buttonTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  buttonSubtitle: {
    color: '#eee',
    fontSize: 13,
    marginTop: 4,
    textAlign: 'center',
  },
});