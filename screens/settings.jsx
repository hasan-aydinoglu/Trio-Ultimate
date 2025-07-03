import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  Pressable,
  Alert,
  Linking,
  Modal,
  TouchableOpacity
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const Settings = ({ navigation }) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('English');

  const toggleNotifications = () => setNotificationsEnabled(!notificationsEnabled);
  const toggleDarkMode = () => setDarkMode(!darkMode);

  const handleLogout = () => {
    Alert.alert('Signed Out', 'See you soon!');
    navigation.navigate('SignIn');
  };

  const handlePrivacyPolicy = () => {
    Linking.openURL('https://www.yourappwebsite.com/privacy-policy');
  };

  const handleContactSupport = () => {
    Linking.openURL('mailto:support@yourapp.com');
  };

  const handleLanguageSelect = (language) => {
    setSelectedLanguage(language);
    setLanguageModalVisible(false);
  };

  const activeColors = darkMode
    ? ['#000000', '#2c3e50']
    : ['#2C3E50', '#34495E'];

  return (
    <LinearGradient colors={activeColors} style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      <View style={styles.settingItem}>
        <Ionicons name="notifications" size={26} color="#fff" />
        <Text style={styles.label}>Notifications</Text>
        <Switch
          value={notificationsEnabled}
          onValueChange={toggleNotifications}
          thumbColor="#1abc9c"
        />
      </View>

      <View style={styles.settingItem}>
        <Ionicons name="moon" size={26} color="#fff" />
        <Text style={styles.label}>Dark Mode</Text>
        <Switch
          value={darkMode}
          onValueChange={toggleDarkMode}
          thumbColor="#1abc9c"
        />
      </View>

      <Pressable
        style={styles.button}
        onPress={() => setLanguageModalVisible(true)}
      >
        <Ionicons name="language" size={22} color="#fff" />
        <Text style={styles.buttonText}>Language ({selectedLanguage})</Text>
      </Pressable>

      <Pressable style={styles.button} onPress={handlePrivacyPolicy}>
        <Ionicons name="document-text" size={22} color="#fff" />
        <Text style={styles.buttonText}>Privacy Policy</Text>
      </Pressable>

      <Pressable style={styles.button} onPress={handleContactSupport}>
        <Ionicons name="help-circle" size={22} color="#fff" />
        <Text style={styles.buttonText}>Contact Support</Text>
      </Pressable>

      <Pressable
        style={[styles.button, { backgroundColor: '#e74c3c' }]}
        onPress={handleLogout}
      >
        <Ionicons name="log-out-outline" size={22} color="#fff" />
        <Text style={styles.buttonText}>Log Out</Text>
      </Pressable>

      {/* Dil Seçimi Modal */}
      <Modal
        visible={languageModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setLanguageModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Select Language</Text>
            {['English', 'Türkçe', 'Deutsch', 'Français'].map((lang) => (
              <TouchableOpacity
                key={lang}
                style={styles.modalOption}
                onPress={() => handleLanguageSelect(lang)}
              >
                <Text style={styles.modalOptionText}>{lang}</Text>
              </TouchableOpacity>
            ))}
            <Pressable
              style={[styles.button, { marginTop: 20 }]}
              onPress={() => setLanguageModalVisible(false)}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: '#000000AA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#2C3E50',
    borderRadius: 20,
    padding: 25,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    color: '#ecf0f1',
    fontSize: 22,
    marginBottom: 20,
    fontWeight: 'bold',
  },
  modalOption: {
    backgroundColor: '#34495E',
    padding: 15,
    borderRadius: 15,
    marginVertical: 5,
    width: '100%',
    alignItems: 'center',
  },
  modalOptionText: {
    color: '#ecf0f1',
    fontSize: 18,
  },
});

export default Settings;