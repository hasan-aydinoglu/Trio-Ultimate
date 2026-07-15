import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { db } from '../firebase';
import {
  doc,
  collection,
  onSnapshot,
} from 'firebase/firestore';

export default function UserProfileScreen({ navigation, route }) {
  const user = route.params?.user || {};
  const userId = route.params?.userId || user.uid || user.id;

  const [profileUser, setProfileUser] = useState(user);
  const [friendsCount, setFriendsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const unsubscribeProfile = onSnapshot(
      doc(db, 'users', userId),
      (snapshot) => {
        if (snapshot.exists()) {
          setProfileUser({
            id: snapshot.id,
            uid: snapshot.id,
            ...snapshot.data(),
          });
        }

        setLoading(false);
      },
      (error) => {
        console.log('User profile error:', error);
        setLoading(false);
      }
    );

    const unsubscribeFriends = onSnapshot(
      collection(db, 'users', userId, 'friends'),
      (snapshot) => {
        setFriendsCount(snapshot.size);
      },
      (error) => {
        console.log('Friends count error:', error);
      }
    );

    return () => {
      unsubscribeProfile();
      unsubscribeFriends();
    };
  }, [userId]);

  const avatarUri =
    profileUser.profileImage ||
    profileUser.avatar ||
    'https://i.pravatar.cc/150?img=1';

  const gamesPlayed = Number(
    profileUser.gamesPlayed ??
      profileUser.totalGames ??
      profileUser.games ??
      0
  );

  const wins = Number(
    profileUser.wins ??
      profileUser.totalWins ??
      profileUser.gamesWon ??
      0
  );

  if (loading) {
    return (
      <LinearGradient
        colors={['#00c6ff', '#0072ff', '#000']}
        style={styles.loadingContainer}
      >
        <ActivityIndicator size="large" color="#fff" />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#00c6ff', '#0072ff', '#000']}
      style={styles.container}
    >
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="chevron-back" size={32} color="#fff" />
      </TouchableOpacity>

      <Image source={{ uri: avatarUri }} style={styles.bigAvatar} />

      <Text style={styles.name}>
        {`${profileUser.name || 'Player'} ${
          profileUser.surname || ''
        }`.trim()}
      </Text>

      <Text style={styles.username}>
        {profileUser.username
          ? `@${profileUser.username.replace('@', '')}`
          : profileUser.email || '@player'}
      </Text>

      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Ionicons name="people" size={25} color="#00e5ff" />

          <Text style={styles.statNumber}>
            {friendsCount}
          </Text>

          <Text style={styles.statLabel}>
            Friends
          </Text>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statBox}>
          <Ionicons
            name="game-controller"
            size={25}
            color="#ffd166"
          />

          <Text style={styles.statNumber}>
            {gamesPlayed}
          </Text>

          <Text style={styles.statLabel}>
            Games
          </Text>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statBox}>
          <Ionicons name="trophy" size={25} color="#00ff88" />

          <Text style={styles.statNumber}>
            {wins}
          </Text>

          <Text style={styles.statLabel}>
            Wins
          </Text>
        </View>
      </View>

      <Text style={styles.infoText}>
        Status: {profileUser.online ? 'Online' : 'Offline'}
      </Text>

      <Text style={styles.infoText}>
        Email: {profileUser.email || 'No email'}
      </Text>

      <Text style={styles.infoText}>
        Bio: {profileUser.bio || 'No bio yet'}
      </Text>

      <TouchableOpacity
        style={styles.messageButton}
        onPress={() =>
          navigation.navigate('ChatScreen', {
            conversation: profileUser,
          })
        }
      >
        <Text style={styles.buttonText}>Message</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 70,
    paddingHorizontal: 20,
  },

  backButton: {
    position: 'absolute',
    top: 55,
    left: 18,
    zIndex: 10,
  },

  bigAvatar: {
    width: 190,
    height: 190,
    borderRadius: 95,
    borderWidth: 4,
    borderColor: '#fff',
    marginBottom: 25,
  },

  name: {
    color: '#fff',
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  username: {
    color: '#b8eaff',
    fontSize: 17,
    marginTop: 5,
    marginBottom: 22,
  },

  statsContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 18,
    paddingVertical: 17,
    marginBottom: 22,
  },

  statBox: {
    flex: 1,
    alignItems: 'center',
  },

  statNumber: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 5,
  },

  statLabel: {
    color: '#ddd',
    fontSize: 13,
    marginTop: 2,
  },

  statDivider: {
    width: 1,
    height: 50,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },

  infoText: {
    width: '100%',
    color: '#fff',
    fontSize: 16,
    marginBottom: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    padding: 14,
    borderRadius: 14,
  },

  messageButton: {
    marginTop: 28,
    backgroundColor: '#1abc9c',
    paddingVertical: 15,
    paddingHorizontal: 55,
    borderRadius: 30,
  },

  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
  },
});