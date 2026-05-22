import React from 'react';
import {
  ScrollView,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';

export default function ContactUsScreen({ navigation }) {
  const openEmail = () => {
    Linking.openURL('mailto:contact@narrativecircle.com');
  };

  return (
    <LinearGradient
      colors={['#00c6ff', '#0072ff', '#000']}
      style={styles.container}
    >
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.header}>Contact Us</Text>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.text}>
          If you have questions or requests related to this Privacy Policy:

          {'\n\n'}Hasan Aydinoglu Sole Proprietorship

          {'\n\n'}
        </Text>

        <TouchableOpacity
          style={styles.emailButton}
          onPress={openEmail}
        >
          <Text style={styles.emailButtonText}>Send Email</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 50,
  },

  backButton: {
    marginBottom: 20,
  },

  backText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },

  header: {
    color: '#fff',
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 25,
    textAlign: 'center',
  },

  text: {
    color: '#fff',
    fontSize: 16,
    lineHeight: 28,
  },

  emailButton: {
    marginTop: 40,
    backgroundColor: 'rgba(255,255,255,0.15)',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },

  emailButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
});