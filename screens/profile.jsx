import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

const Profile = ({ navigation }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    signOut(auth).then(() => {
      navigation.navigate('Home');
    });
  };

  return (
    <LinearGradient colors={['#00c6ff', '#0072ff', '#000']} style={styles.container}>
      <Text style={styles.title}>My Profile</Text>

      <Image
        source={require('../assets/avatar.png')} // 📌 assets klasörüne avatar.png eklemeyi unutma
        style={styles.avatar}
      />

      <Text style={styles.label}>Email Address</Text>
      <Text style={styles.value}>{user ? user.email : 'Not signed in'}</Text>

      <Text style={styles.label}>Game Level</Text>
      <Text style={styles.value}>Beginner</Text>

      <Text style={styles.label}>Favorite Game Mode</Text>
      <Text style={styles.value}>Classic Trio</Text>

      <Text style={styles.label}>Friends</Text>
      <Text style={styles.value}>12 friends</Text>

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
  label: { color: '#ecf0f1', fontSize: 16, marginTop: 15, marginBottom: 5 },
  value: {
    color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 10,
    textShadowColor: '#000', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2,
  },
  button: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#1abc9c', padding: 15,
    borderRadius: 25, width: '80%', justifyContent: 'center', marginVertical: 10,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

export default Profile;