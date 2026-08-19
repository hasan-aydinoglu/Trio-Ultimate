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
import {
  doc,
  collection,
  onSnapshot,
} from 'firebase/firestore';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Profile = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [profileData, setProfileData] = useState({});
  const [friendsCount, setFriendsCount] = useState(0);
  const [avatar, setAvatar] = useState(
    require('../assets/avatar.png')
  );
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(
      auth,
      (currentUser) => {
        setUser(currentUser);

        if (!currentUser) {
          setProfileData({});
          setFriendsCount(0);
          setAvatar(require('../assets/avatar.png'));
        }
      }
    );

    return () => unsubscribeAuth();
  }, []);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const loadDarkMode = async () => {
        try {
          const savedDarkMode = await AsyncStorage.getItem('trioDarkMode');
          if (isActive) {
            setIsDarkMode(savedDarkMode === 'true');
          }
        } catch (error) {
          console.log('Dark mode load error:', error);
        }
      };

      loadDarkMode();

      return () => {
        isActive = false;
      };
    }, [])
  );

  useFocusEffect(
    useCallback(() => {
      const currentUser = auth.currentUser;

      if (!currentUser) {
        return undefined;
      }

      const userRef = doc(
        db,
        'users',
        currentUser.uid
      );

      const friendsRef = collection(
        db,
        'users',
        currentUser.uid,
        'friends'
      );

      const unsubscribeProfile = onSnapshot(
        userRef,
        (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();

            setProfileData(data);

            if (data.profileImage) {
              setAvatar({
                uri: data.profileImage,
              });
            } else {
              setAvatar(
                require('../assets/avatar.png')
              );
            }
          } else {
            setProfileData({});
            setAvatar(
              require('../assets/avatar.png')
            );
          }
        },
        (error) => {
          console.log(
            'Profile listener error:',
            error
          );
        }
      );

      const unsubscribeFriends = onSnapshot(
        friendsRef,
        (querySnapshot) => {
          setFriendsCount(querySnapshot.size);
        },
        (error) => {
          console.log(
            'Friends count listener error:',
            error
          );

          setFriendsCount(0);
        }
      );

      return () => {
        unsubscribeProfile();
        unsubscribeFriends();
      };
    }, [])
  );

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.navigate('Home');
    } catch (error) {
      console.log('Logout error:', error);
    }
  };

  return (
    <LinearGradient
      colors={
        isDarkMode
          ? ['#010814', '#002454', '#034B6A']
          : ['#041b3d', '#0072ff', '#00c6ff']
      }
      style={styles.container}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.scrollContent
        }
      >
        <Text style={styles.title}>
          My Profile
        </Text>

        <View style={styles.profileCard}>
          <LinearGradient
            colors={
              isDarkMode
                ? ['rgba(0,18,48,0.94)', 'rgba(0,8,25,0.88)']
                : ['rgba(255,255,255,0.25)', 'rgba(255,255,255,0.08)']
            }
            style={styles.cardGradient}
          >
            <View style={styles.avatarWrapper}>
              <Image
                source={avatar}
                style={styles.avatar}
              />

              <TouchableOpacity
                style={styles.cameraButton}
                onPress={() =>
                  navigation.navigate(
                    'EditProfile'
                  )
                }
              >
                <Ionicons
                  name="camera-outline"
                  size={18}
                  color="#fff"
                />
              </TouchableOpacity>
            </View>

            <Text style={styles.name}>
              {profileData.name
                ? profileData.name
                : 'No name set'}
            </Text>

            <Text style={styles.username}>
              {profileData.username
                ? `@${profileData.username}`
                : 'No username set'}
            </Text>

            <View style={styles.badge}>
              <Ionicons
                name="sparkles-outline"
                size={16}
                color="#fff"
              />

              <Text style={styles.badgeText}>
                Beginner Player
              </Text>
            </View>
          </LinearGradient>
        </View>

        <View style={styles.statsRow}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.statBox, isDarkMode && styles.statBoxDark]}
            onPress={() =>
              navigation.navigate('Friends')
            }
          >
            <Text style={[styles.statNumber, isDarkMode && styles.statNumberDark]}>
              {friendsCount}
            </Text>

            <Text style={[styles.statLabel, isDarkMode && styles.statLabelDark]}>
              Friends
            </Text>
          </TouchableOpacity>

          <View style={[styles.statBox, isDarkMode && styles.statBoxDark]}>
            <Text style={[styles.statNumber, isDarkMode && styles.statNumberDark]}>
              {profileData.games || 0}
            </Text>

            <Text style={[styles.statLabel, isDarkMode && styles.statLabelDark]}>
              Games
            </Text>
          </View>

          <View style={[styles.statBox, isDarkMode && styles.statBoxDark]}>
            <Text style={[styles.statNumber, isDarkMode && styles.statNumberDark]}>
              {profileData.wins || 0}
            </Text>

            <Text style={[styles.statLabel, isDarkMode && styles.statLabelDark]}>
              Wins
            </Text>
          </View>
        </View>

        <View style={[styles.infoCard, isDarkMode && styles.infoCardDark]}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.sectionTitleDark]}>
            Profile Details
          </Text>

          <InfoItem
            isDarkMode={isDarkMode}
            icon="person-outline"
            label="Name"
            value={
              profileData.name ||
              'No name set'
            }
          />

          <InfoItem
            isDarkMode={isDarkMode}
            icon="at-outline"
            label="Username"
            value={
              profileData.username
                ? `@${profileData.username}`
                : 'No username set'
            }
          />

          <InfoItem
            isDarkMode={isDarkMode}
            icon="chatbubble-ellipses-outline"
            label="Bio"
            value={
              profileData.bio ||
              'No bio set'
            }
          />

          <InfoItem
            isDarkMode={isDarkMode}
            icon="calendar-outline"
            label="Birth Date"
            value={
              profileData.birthDate ||
              'Not set'
            }
          />

          <InfoItem
            isDarkMode={isDarkMode}
            icon="mail-outline"
            label="Email Address"
            value={
              profileData.email ||
              user?.email ||
              'Not signed in'
            }
          />
        </View>

        <View style={[styles.infoCard, isDarkMode && styles.infoCardDark]}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.sectionTitleDark]}>
            Game Profile
          </Text>

          <InfoItem
            isDarkMode={isDarkMode}
            icon="game-controller-outline"
            label="Game Level"
            value="Beginner"
          />

          <InfoItem
            isDarkMode={isDarkMode}
            icon="star-outline"
            label="Favorite Game Mode"
            value="Classic Trio"
          />

          <InfoItem
            isDarkMode={isDarkMode}
            icon="trophy-outline"
            label="Achievement"
            value="Early Member"
          />
        </View>

        <TouchableOpacity
          style={styles.editButton}
          onPress={() =>
            navigation.navigate(
              'EditProfile'
            )
          }
        >
          <Ionicons
            name="create-outline"
            size={20}
            color="#fff"
          />

          <Text style={styles.buttonText}>
            Edit Profile
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Ionicons
            name="log-out-outline"
            size={20}
            color="#fff"
          />

          <Text style={styles.buttonText}>
            Sign Out
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
};

const InfoItem = ({
  icon,
  label,
  value,
  isDarkMode,
}) => {
  return (
    <View style={[styles.infoItem, isDarkMode && styles.infoItemDark]}>
      <View style={[styles.infoIcon, isDarkMode && styles.infoIconDark]}>
        <Ionicons
          name={icon}
          size={20}
          color="#00c6ff"
        />
      </View>

      <View style={styles.infoTextBox}>
        <Text style={[styles.infoLabel, isDarkMode && styles.infoLabelDark]}>
          {label}
        </Text>

        <Text style={[styles.infoValue, isDarkMode && styles.infoValueDark]}>
          {value}
        </Text>
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
    textShadowOffset: {
      width: 2,
      height: 2,
    },
    textShadowRadius: 5,
  },

  profileCard: {
    width: '100%',
    borderRadius: 30,
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: 1,
    borderColor:
      'rgba(255,255,255,0.25)',
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
    backgroundColor:
      'rgba(255,255,255,0.18)',
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
    backgroundColor:
      'rgba(255,255,255,0.95)',
    borderRadius: 20,
    paddingVertical: 18,
    alignItems: 'center',
  },

  statBoxDark: {
    backgroundColor: 'rgba(0, 14, 40, 0.94)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },

  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0072ff',
  },

  statNumberDark: {
    color: '#59C8FF',
  },

  statLabel: {
    marginTop: 4,
    color: '#34495e',
    fontSize: 13,
    fontWeight: '600',
  },

  statLabelDark: {
    color: '#B9CBE0',
  },

  infoCard: {
    width: '100%',
    backgroundColor:
      'rgba(255,255,255,0.96)',
    borderRadius: 24,
    padding: 18,
    marginBottom: 18,
  },

  infoCardDark: {
    backgroundColor: 'rgba(0, 12, 34, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#041b3d',
    marginBottom: 14,
  },

  sectionTitleDark: {
    color: '#FFFFFF',
  },

  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },

  infoItemDark: {
    borderBottomColor: 'rgba(255,255,255,0.10)',
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

  infoIconDark: {
    backgroundColor: 'rgba(0,114,255,0.16)',
  },

  infoTextBox: {
    flex: 1,
  },

  infoLabel: {
    color: '#7f8c8d',
    fontSize: 13,
    marginBottom: 3,
  },

  infoLabelDark: {
    color: '#91A7BE',
  },

  infoValue: {
    color: '#2c3e50',
    fontSize: 16,
    fontWeight: 'bold',
  },

  infoValueDark: {
    color: '#FFFFFF',
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