import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';

import { auth, db } from '../firebase';

import {
  collection,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';

export default function OnlineRoomSetupScreen({ navigation }) {
  const [selectedGameType, setSelectedGameType] = useState(null);

  const gameTypes = [
    {
      id: 1,
      title: 'Game Type 1',
      subtitle: 'Classic TRIO Game',
    },
    {
      id: 2,
      title: 'Game Type 2',
      subtitle: 'Alternative Priority Mode',
    },
    {
      id: 3,
      title: 'Game Type 3',
      subtitle: 'Hidden Card Challenge',
    },
    {
      id: 4,
      title: 'Game Type 4',
      subtitle: 'Fixed Formula Challenge',
    },
    {
      id: 5,
      title: 'Game Type 5',
      subtitle: 'Blue Card Hunt Mode',
    },
  ];

  const createRoom = async () => {
    const user = auth.currentUser;

    if (!user) {
      Alert.alert('Login Required', 'Please login first.');
      return;
    }

    if (!selectedGameType) {
      Alert.alert('Select Game Type', 'Please choose which game type you want to play.');
      return;
    }

    try {
      const roomRef = await addDoc(collection(db, 'rooms'), {
        gameType: selectedGameType,
        players: [
          {
            uid: user.uid,
            email: user.email,
          },
        ],
        ownerUid: user.uid,
        status: 'waiting',
        createdAt: serverTimestamp(),
      });

      navigation.navigate('OnlineLobbyScreen', {
        roomId: roomRef.id,
        gameType: selectedGameType,
        inviteMode: true,
      });

    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <LinearGradient
  colors={[
    '#0088cc',
    '#004e92',
    '#001d3d'
  ]}
  style={styles.container}
>
      <ScrollView showsVerticalScrollIndicator={false}>

        <Text style={styles.title}>Create Online Room</Text>

        <Text style={styles.subtitle}>
          Choose which TRIO game type you want to play
        </Text>

        <View style={styles.card}>

          {gameTypes.map((game) => (
            <TouchableOpacity
              key={game.id}
              style={[
                styles.gameButton,
                selectedGameType === game.id && styles.selectedGameButton,
              ]}
              onPress={() => setSelectedGameType(game.id)}
              activeOpacity={0.85}
            >
              <Text style={styles.gameTitle}>{game.title}</Text>
              <Text style={styles.gameSubtitle}>{game.subtitle}</Text>

              {selectedGameType === game.id && (
                <Text style={styles.selectedText}>Selected</Text>
              )}
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={styles.createButton}
            onPress={createRoom}
            activeOpacity={0.85}
          >
            <Text style={styles.createButtonText}>
              Create Room & Invite Friends
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

        </View>

      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    padding: 22,
    paddingTop: 60,
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
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    marginBottom: 25,
  },

  card: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },

  gameButton: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },

  selectedGameButton: {
    backgroundColor: 'rgba(26,188,156,0.85)',
    borderColor: '#fff',
  },

  gameTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  gameSubtitle: {
    color: '#eee',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 5,
  },

  selectedText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 8,
  },

  createButton: {
    backgroundColor: '#1abc9c',
    paddingVertical: 16,
    borderRadius: 16,
    marginTop: 12,
  },

  createButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  cancelButton: {
    paddingVertical: 14,
    marginTop: 10,
  },

  cancelButtonText: {
    color: '#fff',
    fontSize: 15,
    textAlign: 'center',
  },

});