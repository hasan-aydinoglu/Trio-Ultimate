import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { auth, db } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { useFocusEffect } from '@react-navigation/native';

const Profile = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [profileData, setProfileData] = useState({});
  const [avatar, setAvatar] = useState(require('../assets/avatar.png'));

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribeAuth();
  }, []);

  useFocusEffect(
    useCallback(() => {
      const currentUser = auth.currentUser;

      if (!currentUser) return;

      const unsubscribe = onSnapshot(
        doc(db, 'users', currentUser.uid),
        (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setProfileData(data);

            if (data.profileImage) {
              setAvatar({ uri: data.profileImage });
            }
          }
        }
      );

      return () => unsubscribe();
    }, [])
  );

  const handleLogout = () => {
    signOut(auth).then(() => {
      navigation.navigate('Home');
    });
  };

  return (
    <LinearGradient
      colors={['#041b3d', '#0072ff', '#00c6ff']}
      style={styles.container}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.title}>My Profile</Text>

        <View style={styles.profileCard}>
          <LinearGradient
            colors={['rgba(255,255,255,0.25)', 'rgba(255,255,255,0.08)']}
            style={styles.cardGradient}
          >
            <View style={styles.avatarWrapper}>
              <Image source={avatar} style={styles.avatar} />

              <TouchableOpacity
                style={styles.cameraButton}
                onPress={() => navigation.navigate('EditProfile')}
              >
                <Ionicons name="camera-outline" size={18} color="#fff" />
              </TouchableOpacity>
            </View>

            <Text style={styles.name}>
              {profileData.name ? profileData.name : 'No name set'}
            </Text>

            <Text style={styles.username}>
              {profileData.username
                ? `@${profileData.username}`
                : 'No username set'}
            </Text>

            <View style={styles.badge}>
              <Ionicons name="sparkles-outline" size={16} color="#fff" />
              <Text style={styles.badgeText}>Beginner Player</Text>
            </View>
          </LinearGradient>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Friends</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Games</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Wins</Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Profile Details</Text>

          <InfoItem
            icon="person-outline"
            label="Name"
            value={profileData.name || 'No name set'}
          />

          <InfoItem
            icon="at-outline"
            label="Username"
            value={
              profileData.username
                ? `@${profileData.username}`
                : 'No username set'
            }
          />

          <InfoItem
            icon="chatbubble-ellipses-outline"
            label="Bio"
            value={profileData.bio || 'No bio set'}
          />

          <InfoItem
            icon="calendar-outline"
            label="Birth Date"
            value={profileData.birthDate || 'Not set'}
          />

          <InfoItem
            icon="mail-outline"
            label="Email Address"
            value={profileData.email || user?.email || 'Not signed in'}
          />
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Game Profile</Text>

          <InfoItem
            icon="game-controller-outline"
            label="Game Level"
            value="Beginner"
          />

          <InfoItem
            icon="star-outline"
            label="Favorite Game Mode"
            value="Classic Trio"
          />

          <InfoItem
            icon="trophy-outline"
            label="Achievement"
            value="Early Member"
          />
        </View>

        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate('EditProfile')}
        >
          <Ionicons name="create-outline" size={20} color="#fff" />
          <Text style={styles.buttonText}>Edit Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#fff" />
          <Text style={styles.buttonText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
};

const InfoItem = ({ icon, label, value }) => {
  return (
    <View style={styles.infoItem}>
      <View style={styles.infoIcon}>
        <Ionicons name={icon} size={20} color="#00c6ff" />
      </View>

      <View style={styles.infoTextBox}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  scrollContent: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: 'center',
  },

  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 25,
    fontFamily: 'pacifico',
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
  },

  profileCard: {
    width: '100%',
    borderRadius: 30,
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },

  cardGradient: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },

  avatarWrapper: {
    position: 'relative',
    marginBottom: 15,
  },

  avatar: {
    width: 135,
    height: 135,
    borderRadius: 67.5,
    borderWidth: 4,
    borderColor: '#fff',
  },

  cameraButton: {
    position: 'absolute',
    right: 4,
    bottom: 6,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#9b59b6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },

  name: {
    color: '#fff',
    fontSize: 26,
    fontWeight: 'bold',
    marginTop: 5,
  },

  username: {
    color: '#dff9fb',
    fontSize: 16,
    marginTop: 4,
  },

  badge: {
    marginTop: 15,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },

  badgeText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 6,
  },

  statsRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },

  statBox: {
    width: '31%',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 20,
    paddingVertical: 18,
    alignItems: 'center',
  },

  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0072ff',
  },

  statLabel: {
    marginTop: 4,
    color: '#34495e',
    fontSize: 13,
    fontWeight: '600',
  },

  infoCard: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: 24,
    padding: 18,
    marginBottom: 18,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#041b3d',
    marginBottom: 14,
  },

  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },

  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eef7ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  infoTextBox: {
    flex: 1,
  },

  infoLabel: {
    color: '#7f8c8d',
    fontSize: 13,
    marginBottom: 3,
  },

  infoValue: {
    color: '#2c3e50',
    fontSize: 16,
    fontWeight: 'bold',
  },

  editButton: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    backgroundColor: '#9b59b6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 5,
    marginBottom: 12,
  },

  logoutButton: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    backgroundColor: '#e74c3c',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default Profile;