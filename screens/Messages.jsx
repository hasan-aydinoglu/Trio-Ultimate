import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const conversations = [
  {
    id: '1',
    name: 'Hasan',
    username: '@hasan',
    lastMessage: 'Ready for the next TRIO game?',
    time: '2m',
    online: true,
    unread: 2,
    avatar: 'https://i.pravatar.cc/150?img=12',
  },
  {
    id: '2',
    name: 'Player 2',
    username: '@player2',
    lastMessage: 'Good game!',
    time: '14m',
    online: true,
    unread: 0,
    avatar: 'https://i.pravatar.cc/150?img=22',
  },
  {
    id: '3',
    name: 'Player 3',
    username: '@player3',
    lastMessage: 'Invite me again later.',
    time: '1h',
    online: false,
    unread: 1,
    avatar: 'https://i.pravatar.cc/150?img=33',
  },
  {
    id: '4',
    name: 'Player 4',
    username: '@player4',
    lastMessage: 'That was a smart move!',
    time: '3h',
    online: false,
    unread: 0,
    avatar: 'https://i.pravatar.cc/150?img=44',
  },
  {
    id: '5',
    name: 'Player 5',
    username: '@player5',
    lastMessage: 'Let’s play Game Type 4.',
    time: 'Yesterday',
    online: true,
    unread: 3,
    avatar: 'https://i.pravatar.cc/150?img=55',
  },
];

export default function Messages({ navigation }) {
  const [search, setSearch] = useState('');

  const filteredConversations = conversations.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.username.toLowerCase().includes(search.toLowerCase())
  );

  const renderConversation = ({ item }) => (
    <TouchableOpacity
      style={styles.chatRow}
      activeOpacity={0.8}
      onPress={() => alert(`${item.name} chat screen will be added soon.`)}
    >
      <View style={styles.avatarWrapper}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />

        {item.online && <View style={styles.onlineDot} />}
      </View>

      <View style={styles.messageInfo}>
        <View style={styles.topRow}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.time}>{item.time}</Text>
        </View>

        <View style={styles.bottomRow}>
          <Text
            style={[
              styles.lastMessage,
              item.unread > 0 && styles.unreadMessage,
            ]}
            numberOfLines={1}
          >
            {item.lastMessage}
          </Text>

          {item.unread > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.unread}</Text>
            </View>
          )}
        </View>

        <Text style={styles.username}>{item.username}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <LinearGradient
      colors={['#00c6ff', '#0072ff', '#000']}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>

        <TouchableOpacity style={styles.newMessageButton}>
          <Ionicons name="create-outline" size={25} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchBox}>
        <Ionicons name="search" size={20} color="#ccc" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search players..."
          placeholderTextColor="#ccc"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <Text style={styles.sectionTitle}>Chats</Text>

      <FlatList
        data={filteredConversations}
        keyExtractor={(item) => item.id}
        renderItem={renderConversation}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30 }}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 55,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },

  newMessageButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 22,
    marginBottom: 20,
  },

  searchInput: {
    flex: 1,
    color: '#fff',
    marginLeft: 10,
    fontSize: 15,
  },

  sectionTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },

  chatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    padding: 13,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },

  avatarWrapper: {
    position: 'relative',
    marginRight: 13,
  },

  avatar: {
    width: 62,
    height: 62,
    borderRadius: 31,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.6)',
  },

  onlineDot: {
    position: 'absolute',
    right: 3,
    bottom: 4,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#00ff88',
    borderWidth: 2,
    borderColor: '#0072ff',
  },

  messageInfo: {
    flex: 1,
  },

  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  name: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
  },

  time: {
    color: '#ddd',
    fontSize: 12,
  },

  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },

  lastMessage: {
    flex: 1,
    color: '#dcdcdc',
    fontSize: 14,
  },

  unreadMessage: {
    color: '#fff',
    fontWeight: 'bold',
  },

  username: {
    color: '#b8eaff',
    fontSize: 12,
    marginTop: 3,
  },

  badge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#1abc9c',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    paddingHorizontal: 6,
  },

  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});