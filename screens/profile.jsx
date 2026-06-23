import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
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
    <LinearGradient colors={['#00c6ff', '#0072ff', '#000']} style={styles.container}>
      <Text style={styles.title}>My Profile</Text>

      <Image source={avatar} style={styles.avatar} />

      <Text style={styles.label}>Name</Text>
      <Text style={styles.value}>
        {profileData.name ? profileData.name : 'No name set'}
      </Text>

      <Text style={styles.label}>Username</Text>
      <Text style={styles.value}>
        {profileData.username ? `@${profileData.username}` : 'No username set'}
      </Text>

      <Text style={styles.label}>Bio</Text>
      <Text style={styles.value}>
        {profileData.bio ? profileData.bio : 'No bio set'}
      </Text>

      <Text style={styles.label}>Birth Date</Text>
      <Text style={styles.value}>
        {profileData.birthDate ? profileData.birthDate : 'Not set'}
      </Text>

      <Text style={styles.label}>Email Address</Text>
      <Text style={styles.value}>
        {profileData.email || user?.email || 'Not signed in'}
      </Text>

      <Text style={styles.label}>Game Level</Text>
      <Text style={styles.value}>Beginner</Text>

      <Text style={styles.label}>Favorite Game Mode</Text>
      <Text style={styles.value}>Classic Trio</Text>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#9b59b6' }]}
        onPress={() => navigation.navigate('EditProfile')}
      >
        <Ionicons name="create-outline" size={20} color="#fff" />
        <Text style={styles.buttonText}>  Edit Profile</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#e74c3c' }]}
        onPress={handleLogout}
      >
        <Ionicons name="log-out-outline" size={20} color="#fff" />
        <Text style={styles.buttonText}>  Sign Out</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: {
    fontSize: 45, fontWeight: 'bold', color: '#fff', marginBottom: 30, fontFamily: 'pacifico',
    textShadowColor: '#000', textShadowOffset: { width: 2, height: 2 }, textShadowRadius: 4,
  },
  avatar: {
    width: 130, height: 130, borderRadius: 65, marginBottom: 30, borderWidth: 3, borderColor: '#1abc9c',
  },
  label: { color: '#ecf0f1', fontSize: 16, marginTop: 10, marginBottom: 5 },
  value: {
    color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 6,
    textShadowColor: '#000', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2,
  },
  button: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#1abc9c', padding: 15,
    borderRadius: 25, width: '80%', justifyContent: 'center', marginVertical: 10,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

export default Profile;