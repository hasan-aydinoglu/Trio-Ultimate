import React, { useEffect, useState } from 'react';
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
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
} from 'firebase/firestore';

export default function GameModeScreen({ navigation }) {
  const [gameInvites, setGameInvites] = useState([]);

  useEffect(() => {
    const currentUser = auth.currentUser;

    if (!currentUser) return;

    const gameInvitesQuery = query(
      collection(db, 'gameInvites'),
      where('toUserId', '==', currentUser.uid),
      where('status', '==', 'pending')
    );

    const unsubscribe = onSnapshot(
      gameInvitesQuery,
      (snapshot) => {
        const invites = snapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        }));

        setGameInvites(invites);
      },
      (error) => {
        console.log('Game invites load error:', error);
      }
    );

    return () => unsubscribe();
  }, []);

  const createOnlineRoom = () => {
    navigation.navigate('OnlineRoomSetupScreen');
  };

  const acceptInvite = async (invite) => {
    try {
      await updateDoc(doc(db, 'gameInvites', invite.id), {
        status: 'accepted',
      });

      navigation.navigate('OnlineLobbyScreen', {
        roomId: invite.roomId,
        gameType: invite.gameType,
      });
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const declineInvite = async (invite) => {
    try {
      await updateDoc(doc(db, 'gameInvites', invite.id), {
        status: 'declined',
      });
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handlePress = (mode) => {
    if (mode === 1) {
      navigation.navigate('OnlineLobbyScreen', { gameType: 1 });
    } else if (mode === 2) {
      navigation.navigate('OnlineLobbyScreen', { gameType: 2 });
    } else if (mode === 3) {
      navigation.navigate('OnlineLobbyScreen', { gameType: 3 });
    } else if (mode === 4) {
      navigation.navigate('OnlineLobbyScreen', { gameType: 4 });
    } else if (mode === 5) {
      navigation.navigate('OnlineLobbyScreen', { gameType: 5 });
    } else {
      Alert.alert('Coming Soon', `Game Type ${mode} will be added soon.`);
    }
  };

  return (
    <LinearGradient
      colors={['#00c6ff', '#0072ff', '#000']}
      style={styles.container}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.title}>Choose Game Type</Text>

        <Text style={styles.subtitle}>
          Select your TRIO game mode
        </Text>

        {gameInvites.length > 0 && (
          <View style={styles.inviteBox}>
            <Text style={styles.inviteTitle}>
              Game Invitations
            </Text>

            {gameInvites.map((invite) => (
              <View key={invite.id} style={styles.inviteCard}>
                <Text style={styles.inviteText}>
                  {invite.fromUsername || invite.fromName || 'A player'} invited you
                </Text>

                <Text style={styles.inviteSubText}>
                  Game Type {invite.gameType}
                </Text>

                {invite.roomId ? (
                  <Text style={styles.inviteRoomText}>
                    Room ID: {invite.roomId}
                  </Text>
                ) : null}

                <View style={styles.inviteActions}>
                  <TouchableOpacity
                    style={styles.acceptButton}
                    onPress={() => acceptInvite(invite)}
                  >
                    <Text style={styles.actionText}>
                      Accept
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.declineButton}
                    onPress={() => declineInvite(invite)}
                  >
                    <Text style={styles.actionText}>
                      Decline
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

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
                  : mode === 3
                  ? 'Hidden Card Challenge'
                  : mode === 4
                  ? 'Fixed Formula Challenge'
                  : mode === 5
                  ? 'Blue Card Hunt Mode'
                  : 'Alternative TRIO Mode'}
              </Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={styles.onlineButton}
            onPress={createOnlineRoom}
          >
            <Text style={styles.onlineButtonText}>
              Create Online Room
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
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
    marginBottom: 22,
  },

  inviteBox: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 20,
    padding: 15,
    marginBottom: 18,
  },

  inviteTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 12,
  },

  inviteCard: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },

  inviteText: {
    color: '#111',
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
  },

  inviteSubText: {
    color: '#0072ff',
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 5,
  },

  inviteRoomText: {
    color: '#555',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },

  inviteActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
  },

  acceptButton: {
    flex: 1,
    backgroundColor: '#1abc9c',
    paddingVertical: 11,
    borderRadius: 13,
    marginRight: 6,
  },

  declineButton: {
    flex: 1,
    backgroundColor: '#e74c3c',
    paddingVertical: 11,
    borderRadius: 13,
    marginLeft: 6,
  },

  actionText: {
    color: '#fff',
    fontWeight: '900',
    textAlign: 'center',
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

  onlineButton: {
    backgroundColor: '#1abc9c',
    paddingVertical: 16,
    borderRadius: 16,
    marginTop: 10,
  },

  onlineButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});