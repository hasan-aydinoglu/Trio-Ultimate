import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { auth, db } from '../firebase';
import {
  collection,
  onSnapshot,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
} from 'firebase/firestore';

export default function FriendsScreen({ navigation }) {
  const [search, setSearch] = useState('');
  const [addFriendText, setAddFriendText] = useState('');
  const [friends, setFriends] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'users'),
      (snapshot) => {
        const usersList = snapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .filter((user) => user.id !== auth.currentUser?.uid);

        setFriends(usersList);
      },
      (error) => {
        console.log('Friends error:', error);
      }
    );

    return () => unsubscribe();
  }, []);

  const filteredFriends = friends.filter((friend) =>
    (friend.name || friend.username || friend.email || '')
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const sendFriendRequest = async (friend) => {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      Alert.alert('Login Required', 'Please login first.');
      return;
    }

    if (friend.id === currentUser.uid) {
      Alert.alert('Error', 'You cannot add yourself.');
      return;
    }

    try {
      await addDoc(collection(db, 'friendRequests'), {
        fromUserId: currentUser.uid,
        fromEmail: currentUser.email,
        toUserId: friend.id,
        toUserName: friend.name || friend.username || friend.email || 'Player',
        toUserEmail: friend.email || '',
        status: 'pending',
        createdAt: serverTimestamp(),
      });

      Alert.alert(
        'Success',
        `Friend request sent to ${
          friend.name || friend.username || 'Player'
        }`
      );
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleAddFriend = async () => {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      Alert.alert('Login Required', 'Please login first.');
      return;
    }

    if (!addFriendText.trim()) {
      Alert.alert('Error', 'Please enter email or username.');
      return;
    }

    const searchValue = addFriendText.trim();

    try {
      let userQuery = query(
        collection(db, 'users'),
        where('email', '==', searchValue)
      );

      let snapshot = await getDocs(userQuery);

      if (snapshot.empty) {
        userQuery = query(
          collection(db, 'users'),
          where('username', '==', searchValue)
        );

        snapshot = await getDocs(userQuery);
      }

      if (snapshot.empty) {
        Alert.alert('Not Found', 'No user found with this email or username.');
        return;
      }

      const foundUserDoc = snapshot.docs[0];

      const foundUser = {
        id: foundUserDoc.id,
        ...foundUserDoc.data(),
      };

      if (foundUser.id === currentUser.uid) {
        Alert.alert('Error', 'You cannot add yourself.');
        return;
      }

      await sendFriendRequest(foundUser);
      setAddFriendText('');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const openUserProfile = (user) => {
    navigation.navigate('UserProfileScreen', {
      user,
    });
  };

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

      <View style={styles.addFriendBox}>
        <TextInput
          style={styles.addFriendInput}
          placeholder="Enter email or username..."
          placeholderTextColor="#ccc"
          value={addFriendText}
          onChangeText={setAddFriendText}
          autoCapitalize="none"
        />

        <TouchableOpacity
          style={styles.smallAddButton}
          onPress={handleAddFriend}
        >
          <Text style={styles.smallAddText}>Add</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredFriends}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.friendCard}>
            <TouchableOpacity
              style={styles.left}
              activeOpacity={0.8}
              onPress={() => openUserProfile(item)}
            >
              <Image
                source={{
                  uri:
                    item.profileImage ||
                    item.avatar ||
                    'https://i.pravatar.cc/150?img=1',
                }}
                style={styles.avatar}
              />

              <View>
                <Text style={styles.name}>
                  {item.name || item.username || 'Player'}
                </Text>

                <Text
                  style={[
                    styles.status,
                    {
                      color: item.online ? '#00ff88' : '#ff4444',
                    },
                  ]}
                >
                  {item.online ? 'Online' : 'Offline'}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.inviteButton}
              onPress={() => sendFriendRequest(item)}
            >
              <Text style={styles.buttonText}>
                Invite
              </Text>
            </TouchableOpacity>
          </View>
        )}
      />

      <TouchableOpacity
        style={styles.addButton}
        onPress={handleAddFriend}
      >
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
    marginBottom: 12,
  },

  addFriendBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },

  addFriendInput: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 15,
    padding: 12,
    color: '#fff',
    marginRight: 10,
  },

  smallAddButton: {
    backgroundColor: '#00ff88',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 15,
  },

  smallAddText: {
    color: '#000',
    fontWeight: 'bold',
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
    flex: 1,
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
    marginLeft: 10,
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