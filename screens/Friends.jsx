import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const friendsData = [
  {
    id: '1',
    name: 'Player 1',
    online: true,
    avatar: 'https://i.pravatar.cc/150?img=1',
  },
  {
    id: '2',
    name: 'Player 2',
    online: false,
    avatar: 'https://i.pravatar.cc/150?img=2',
  },
  {
    id: '3',
    name: 'Player 3',
    online: true,
    avatar: 'https://i.pravatar.cc/150?img=3',
  },
];

export default function FriendsScreen() {
  const [search, setSearch] = useState('');

  const filteredFriends = friendsData.filter(friend =>
    friend.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <LinearGradient
      colors={['#00c6ff', '#0072ff', '#000']}
      style={styles.container}
    >
      <Text style={styles.title}>Friends</Text>

      <Text style={styles.subtitle}>
        Total Friends: {filteredFriends.length}
      </Text>

      <TextInput
        style={styles.search}
        placeholder="Search Friend..."
        placeholderTextColor="#ccc"
        value={search}
        onChangeText={setSearch}
      />

      <FlatList
        data={filteredFriends}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.friendCard}>
            <View style={styles.left}>
              <Image
                source={{ uri: item.avatar }}
                style={styles.avatar}
              />

              <View>
                <Text style={styles.name}>{item.name}</Text>

                <Text
                  style={[
                    styles.status,
                    {
                      color: item.online
                        ? '#00ff88'
                        : '#ff4444',
                    },
                  ]}
                >
                  {item.online ? 'Online' : 'Offline'}
                </Text>
              </View>
            </View>

            <TouchableOpacity style={styles.inviteButton}>
              <Text style={styles.buttonText}>
                Invite
              </Text>
            </TouchableOpacity>
          </View>
        )}
      />

      <TouchableOpacity style={styles.addButton}>
        <Text style={styles.addText}>
          + Add Friend
        </Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },

  title: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 50,
  },

  subtitle: {
    color: '#ddd',
    textAlign: 'center',
    marginBottom: 20,
  },

  search: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 15,
    padding: 12,
    color: '#fff',
    marginBottom: 15,
  },

  friendCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    padding: 15,
    borderRadius: 18,
    marginBottom: 12,
  },

  left: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatar: {
    width: 55,
    height: 55,
    borderRadius: 30,
    marginRight: 12,
  },

  name: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },

  status: {
    marginTop: 3,
  },

  inviteButton: {
    backgroundColor: '#00c6ff',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 10,
  },

  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },

  addButton: {
    backgroundColor: '#00ff88',
    padding: 15,
    borderRadius: 15,
    marginTop: 15,
  },

  addText: {
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#000',
    fontSize: 16,
  },
});