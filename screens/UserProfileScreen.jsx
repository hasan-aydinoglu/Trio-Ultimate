import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function UserProfileScreen({ navigation, route }) {
  const { user } = route.params;

  const avatarUri =
    user.profileImage ||
    user.avatar ||
    'https://i.pravatar.cc/150?img=1';

  return (
    <LinearGradient
      colors={['#00c6ff', '#0072ff', '#000']}
      style={styles.container}
    >
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="chevron-back" size={32} color="#fff" />
      </TouchableOpacity>

      <Image source={{ uri: avatarUri }} style={styles.bigAvatar} />

      <Text style={styles.name}>
        {user.name || 'Player'}
      </Text>

      <Text style={styles.username}>
        {user.username || user.email || '@player'}
      </Text>

      <View style={styles.infoCard}>
        <Text style={styles.infoText}>
          Status: {user.online ? 'Online' : 'Offline'}
        </Text>

        <Text style={styles.infoText}>
          Email: {user.email || 'No email'}
        </Text>

        <Text style={styles.infoText}>
          Last message: {user.lastMessage || 'No messages yet'}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.messageButton}
        onPress={() => navigation.navigate('ChatScreen', { conversation: user })}
      >
        <Text style={styles.buttonText}>Message</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 70,
    paddingHorizontal: 20,
  },

  backButton: {
    position: 'absolute',
    top: 55,
    left: 18,
  },

  bigAvatar: {
    width: 190,
    height: 190,
    borderRadius: 95,
    borderWidth: 4,
    borderColor: '#fff',
    marginBottom: 25,
  },

  name: {
    color: '#fff',
    fontSize: 30,
    fontWeight: 'bold',
  },

  username: {
    color: '#b8eaff',
    fontSize: 17,
    marginTop: 5,
  },

  infoCard: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 22,
    padding: 20,
    marginTop: 30,
  },

  infoText: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 12,
  },

  messageButton: {
    marginTop: 28,
    backgroundColor: '#1abc9c',
    paddingVertical: 15,
    paddingHorizontal: 55,
    borderRadius: 30,
  },

  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
  },
});