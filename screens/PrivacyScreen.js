import React from 'react';
import {
  ScrollView,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function PrivacyScreen({ navigation }) {
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

      <Text style={styles.header}>Privacy Policy</Text>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.text}>
          Welcome to Trio. Your privacy is important to us.

          {'\n\n'}1. Information Collection
          {'\n'}We may collect your email address, profile information,
          and basic app usage data.

          {'\n\n'}2. How We Use Data
          {'\n'}Your information is used to improve your experience,
          maintain security, and provide support.

          {'\n\n'}3. Data Protection
          {'\n'}We use reasonable technical safeguards to protect
          your information.

          {'\n\n'}4. Third Parties
          {'\n'}We do not sell your personal data to third parties.

          {'\n\n'}5. Contact
          {'\n'}If you have questions or requests related to this Privacy Policy:
          hasan.aydng@gmail.com

          
        </Text>
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
});