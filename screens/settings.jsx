import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, Pressable, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const Settings = ({ navigation }) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const toggleNotifications = () => setNotificationsEnabled(!notificationsEnabled);
  const toggleDarkMode = () => setDarkMode(!darkMode);

  const handleChangePassword = () => {
    Alert.alert('Info', 'Password change screen coming soon!');
  };

  const handleLogout = () => {
    Alert.alert('Signed Out', 'See you soon!');
    navigation.navigate('SignIn'); // or wherever you want to redirect
  };

  return (
    <LinearGradient colors={['#2C3E50', '#34495E']} style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      <View style={styles.settingItem}>
        <Ionicons name="notifications" size={26} color="#fff" style={styles.icon} />
        <Text style={styles.label}>Notifications</Text>
        <Switch
          value={notificationsEnabled}
          onValueChange={toggleNotifications}
          thumbColor="#1abc9c"
        />
      </View>

      <View style={styles.settingItem}>
        <Ionicons name="moon" size={26} color="#fff" style={styles.icon} />
        <Text style={styles.label}>Dark Mode</Text>
        <Switch
          value={darkMode}
          onValueChange={toggleDarkMode}
          thumbColor="#1abc9c"
        />
      </View>

      <Pressable style={styles.button} onPress={handleChangePassword}>
        <Ionicons name="lock-closed" size={22} color="#fff" style={styles.icon} />
        <Text style={styles.buttonText}>Change Password</Text>
      </Pressable>

      <Pressable style={[styles.button, { backgroundColor: '#e74c3c' }]} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={22} color="#fff" style={styles.icon} />
        <Text style={styles.buttonText}>Log Out</Text>
      </Pressable>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, alignItems: 'center', justifyContent: 'center' },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#ecf0f1',
    marginBottom: 40,
    textShadowColor: '#1abc9c',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#34495E',
    padding: 15,
    borderRadius: 25,
    marginVertical: 10,
    width: '90%',
    justifyContent: 'space-between',
  },
  label: {
    color: '#ecf0f1',
    fontSize: 18,
    flex: 1,
    marginLeft: 15,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1abc9c',
    padding: 15,
    borderRadius: 25,
    marginTop: 20,
    width: '90%',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    marginLeft: 10,
    fontWeight: 'bold',
  },
  icon: { marginRight: 10 },
});

export default Settings;