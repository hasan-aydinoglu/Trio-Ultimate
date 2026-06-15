import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function ChatScreen({ navigation, route }) {
  const { conversation } = route.params;

  return (
    <LinearGradient
      colors={['#00c6ff', '#0072ff', '#000']}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={30} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.profileArea}
          onPress={() =>
            navigation.navigate('UserProfileScreen', { user: conversation })
          }
        >
          <Image source={{ uri: conversation.avatar }} style={styles.avatar} />

          <View>
            <Text style={styles.name}>{conversation.name}</Text>
            <Text style={styles.username}>{conversation.username}</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.chatArea}>
        <View style={styles.messageBubble}>
          <Text style={styles.messageText}>{conversation.lastMessage}</Text>
        </View>
      </View>

      <View style={styles.inputArea}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          placeholderTextColor="#ccc"
        />

        <TouchableOpacity style={styles.sendButton}>
          <Ionicons name="send" size={22} color="#fff" />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 55,
    paddingHorizontal: 16,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  profileArea: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#fff',
  },

  name: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },

  username: {
    color: '#b8eaff',
    fontSize: 13,
  },

  chatArea: {
    flex: 1,
    marginTop: 25,
  },

  messageBubble: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 14,
    borderRadius: 18,
    maxWidth: '80%',
  },

  messageText: {
    color: '#fff',
    fontSize: 15,
  },

  inputArea: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 25,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },

  input: {
    flex: 1,
    color: '#fff',
    fontSize: 15,
  },

  sendButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#1abc9c',
    justifyContent: 'center',
    alignItems: 'center',
  },
});