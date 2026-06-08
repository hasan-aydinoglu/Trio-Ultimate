import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const players = [
  { id: '1', name: 'Hasan', status: 'Ready' },
  { id: '2', name: 'Player 2', status: 'Waiting' },
  { id: '3', name: 'Player 3', status: 'Waiting' },
  { id: '4', name: 'Player 4', status: 'Waiting' },
];

export default function OnlineLobbyScreen({ navigation, route }) {
  const gameType = route?.params?.gameType || 1;
  const [profileImage, setProfileImage] = useState(null);

  useEffect(() => {
    loadProfileImage();
  }, []);

  const loadProfileImage = async () => {
    try {
      const savedProfile = await AsyncStorage.getItem('userProfile');

      if (savedProfile) {
        const profileData = JSON.parse(savedProfile);

        if (profileData.profileImage) {
          setProfileImage(profileData.profileImage);
        }
      }
    } catch (error) {
      console.log('Online lobby profile image load error:', error);
    }
  };

  const handleStartGame = () => {
    if (gameType === 1) {
      navigation.navigate('GameScreen');
    } else if (gameType === 2) {
      navigation.navigate('GameScreen2');
    } else if (gameType === 3) {
      navigation.navigate('GameScreen3');
    } else if (gameType === 4) {
      navigation.navigate('GameScreen4');
    } else if (gameType === 5) {
      navigation.navigate('GameScreen5');
    }
  };

  return (
    <LinearGradient
      colors={['#00c6ff', '#0072ff', '#000']}
      style={styles.container}
    >
      <Text style={styles.title}>Online Players</Text>

      <Text style={styles.subtitle}>
        Game Type {gameType}
      </Text>

      <View style={styles.card}>
        <FlatList
          data={players}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.playerRow}>
              {item.id === '1' && profileImage ? (
                <Image
                  source={{ uri: profileImage }}
                  style={styles.avatarImage}
                />
              ) : (
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {item.name.charAt(0)}
                  </Text>
                </View>
              )}

              <View>
                <Text style={styles.playerName}>
                  {item.name}
                </Text>

                <Text style={styles.status}>
                  {item.status}
                </Text>
              </View>
            </View>
          )}
        />
      </View>

      <TouchableOpacity
        style={styles.startButton}
        onPress={handleStartGame}
      >
        <Text style={styles.startText}>
          Start Game
        </Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 25,
    justifyContent: 'center',
  },

  title: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },

  subtitle: {
    fontSize: 18,
    color: '#dbeafe',
    textAlign: 'center',
    marginBottom: 25,
  },

  card: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 25,
    padding: 20,
    marginBottom: 30,
  },

  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.2)',
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },

  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 15,
    borderWidth: 2,
    borderColor: '#fff',
  },

  avatarText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0072ff',
  },

  playerName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },

  status: {
    color: '#dbeafe',
    fontSize: 14,
  },

  startButton: {
    backgroundColor: '#22c55e',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
  },

  startText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});