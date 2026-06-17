import React, { useState } from 'react';
import { View, Text, Switch, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

export default function SettingsScreen({ navigation }) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  const handleLogout = async () => {
    try {
      await signOut(auth);

      navigation.getParent()?.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    } catch (error) {
      Alert.alert('Logout Error', error.message);
    }
  };

  return (
    <LinearGradient
      colors={
        isDarkMode
          ? ['#000000', '#000000']
          : ['#00c6ff', '#0072ff', '#000']
      }
      style={styles.container}
    >
      <Text style={[styles.header, { color: '#fff' }]}>
        Settings
      </Text>

      <View style={styles.option}>
        <Text style={styles.label}>Notifications</Text>
        <Switch value={true} />
      </View>

      <View style={styles.option}>
        <Text style={styles.label}>Dark Mode</Text>
        <Switch
          value={isDarkMode}
          onValueChange={toggleDarkMode}
        />
      </View>

      <TouchableOpacity
        style={[styles.button, isDarkMode && styles.darkButton]}
        onPress={() => navigation.navigate('ContactUs')}
      >
        <Text style={styles.buttonText}>Contact Support</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, isDarkMode && styles.darkButton]}
        onPress={() => navigation.navigate('Privacy')}
      >
        <Text style={styles.buttonText}>Privacy Policy</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, isDarkMode && styles.darkButton]}
        onPress={handleLogout}
      >
        <Text style={styles.buttonText}>Log Out</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },

  header: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    marginTop: 40,
  },

  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },

  label: {
    fontSize: 18,
    color: '#fff',
  },

  button: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    padding: 15,
    borderRadius: 12,
    marginTop: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },

  darkButton: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderColor: 'rgba(255,255,255,0.2)',
  },

  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '500',
  },
});