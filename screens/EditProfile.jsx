import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '../firebase';

const EditProfile = ({ navigation }) => {
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState(require('../assets/avatar.png')); // 📌 şimdilik sabit avatar

  const handleSave = () => {
    // Burada veritabanına veya firebase'e kaydedebilirsin
    Alert.alert('Saved', 'Your profile has been updated.');
    navigation.goBack();
  };

  return (
    <LinearGradient colors={['#00c6ff', '#0072ff', '#000']} style={styles.container}>
      <Text style={styles.title}>Edit Profile</Text>

      <Image source={avatar} style={styles.avatar} />

      <Text style={styles.label}>Username</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your name"
        placeholderTextColor="#ccc"
        value={name}
        onChangeText={setName}
      />

      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
        <Text style={styles.buttonText}>  Save Changes</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, { backgroundColor: '#95a5a6' }]} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={20} color="#fff" />
        <Text style={styles.buttonText}>  Cancel</Text>
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
  avatar: { width: 130, height: 130, borderRadius: 65, marginBottom: 30, borderWidth: 3, borderColor: '#1abc9c' },
  label: { color: '#ecf0f1', fontSize: 16, marginBottom: 10, alignSelf: 'flex-start' },
  input: {
    width: '100%', padding: 15, marginBottom: 30, borderRadius: 25,
    backgroundColor: '#34495E', borderColor: '#7f8c8d', borderWidth: 1, fontSize: 16, color: '#ecf0f1',
  },
  button: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#1abc9c', padding: 15,
    borderRadius: 25, width: '80%', justifyContent: 'center', marginVertical: 10,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

export default EditProfile;