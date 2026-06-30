import React, { useEffect, useState } from 'react';
import {
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { db } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';

export default function UserProfileScreen({ navigation, route }) {
  const user = route.params?.user || {};
  const userId = route.params?.userId || user.uid || user.id;

  const [profileUser, setProfileUser] = useState(user);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
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

    return () => unsubscribe();
  }, [userId]);

  const avatarUri =
    profileUser.profileImage ||
    profileUser.avatar ||
    'https://i.pravatar.cc/150?img=1';

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
        {`${profileUser.name || 'Player'} ${profileUser.surname || ''}`.trim()}
      </Text>

      <Text style={styles.username}>
        {profileUser.username
          ? `@${profileUser.username}`
          : profileUser.email || '@player'}
      </Text>

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
    marginBottom: 30,
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