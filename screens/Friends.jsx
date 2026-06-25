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
  serverTimestamp,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  getDoc,
  addDoc,
  deleteDoc,
} from 'firebase/firestore';

export default function FriendsScreen({ navigation }) {
  const [search, setSearch] = useState('');
  const [addFriendText, setAddFriendText] = useState('');
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [searchedUser, setSearchedUser] = useState(null);
  const [requestSent, setRequestSent] = useState(false);

  useEffect(() => {
    const currentUser = auth.currentUser;

    if (!currentUser) return;

    const unsubscribe = onSnapshot(
      collection(db, 'users', currentUser.uid, 'friends'),
      (snapshot) => {
        const friendsList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setFriends(friendsList);
      },
      (error) => {
        console.log('Friends error:', error);
      }
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const currentUser = auth.currentUser;

    if (!currentUser) return;

    const requestsQuery = query(
      collection(db, 'friendRequests'),
      where('toUserId', '==', currentUser.uid),
      where('status', '==', 'pending')
    );

    const unsubscribe = onSnapshot(
      requestsQuery,
      (snapshot) => {
        const requestsList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setFriendRequests(requestsList);
      },
      (error) => {
        console.log('Friend requests error:', error);
      }
    );

    return () => unsubscribe();
  }, []);

  const filteredFriends = friends.filter((friend) =>
    (friend.name || friend.username || friend.email || '')
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const addFriendPermanently = async (friend) => {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      Alert.alert('Login Required', 'Please login first.');
      return;
    }

    if (friend.id === currentUser.uid || friend.uid === currentUser.uid) {
      Alert.alert('Error', 'You cannot add yourself.');
      return;
    }

    try {
      const friendId = friend.uid || friend.id;

      const currentUserDoc = await getDoc(doc(db, 'users', currentUser.uid));

      const currentUserData = currentUserDoc.exists()
        ? currentUserDoc.data()
        : {};

      await setDoc(doc(db, 'users', currentUser.uid, 'friends', friendId), {
        uid: friendId,
        name: friend.name || '',
        surname: friend.surname || '',
        username: friend.username || '',
        email: friend.email || '',
        profileImage: friend.profileImage || friend.avatar || '',
        avatar: friend.avatar || friend.profileImage || '',
        online: friend.online || false,
        createdAt: serverTimestamp(),
      });

      await setDoc(doc(db, 'users', friendId, 'friends', currentUser.uid), {
        uid: currentUser.uid,
        name: currentUserData.name || '',
        surname: currentUserData.surname || '',
        username: currentUserData.username || '',
        email: currentUser.email || '',
        profileImage:
          currentUserData.profileImage || currentUserData.avatar || '',
        avatar: currentUserData.avatar || currentUserData.profileImage || '',
        online: currentUserData.online || false,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

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
      const currentUserDoc = await getDoc(doc(db, 'users', currentUser.uid));

      const currentUserData = currentUserDoc.exists()
        ? currentUserDoc.data()
        : {};

      const alreadyFriendDoc = await getDoc(
        doc(db, 'users', currentUser.uid, 'friends', friend.id)
      );

      if (alreadyFriendDoc.exists()) {
        Alert.alert('Already Friends', 'This user is already your friend.');
        return;
      }

      const existingRequestQuery = query(
        collection(db, 'friendRequests'),
        where('fromUserId', '==', currentUser.uid),
        where('toUserId', '==', friend.id),
        where('status', '==', 'pending')
      );

      const existingRequestSnapshot = await getDocs(existingRequestQuery);

      if (!existingRequestSnapshot.empty) {
        setRequestSent(true);
        Alert.alert('Already Sent', 'Friend request already sent.');
        return;
      }

      await addDoc(collection(db, 'friendRequests'), {
        fromUserId: currentUser.uid,
        fromName: currentUserData.name || '',
        fromUsername: currentUserData.username || '',
        fromEmail: currentUser.email || '',
        fromProfileImage:
          currentUserData.profileImage || currentUserData.avatar || '',

        toUserId: friend.id,
        toName: friend.name || '',
        toUsername: friend.username || '',
        toEmail: friend.email || '',
        toProfileImage: friend.profileImage || friend.avatar || '',

        status: 'pending',
        createdAt: serverTimestamp(),
      });

      setRequestSent(true);

      Alert.alert(
        'Request Sent',
        `Friend request sent to ${friend.name || friend.username || 'Player'}`
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

    const searchValue = addFriendText.trim().toLowerCase();

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
        setSearchedUser(null);
        setRequestSent(false);
        Alert.alert('Not Found', 'No user found with this email or username.');
        return;
      }

      const foundUserDoc = snapshot.docs[0];

      const foundUser = {
        id: foundUserDoc.id,
        ...foundUserDoc.data(),
      };

      if (foundUser.id === currentUser.uid) {
        setSearchedUser(null);
        setRequestSent(false);
        Alert.alert('Error', 'You cannot add yourself.');
        return;
      }

      const alreadyFriendDoc = await getDoc(
        doc(db, 'users', currentUser.uid, 'friends', foundUser.id)
      );

      if (alreadyFriendDoc.exists()) {
        setSearchedUser(foundUser);
        setRequestSent(true);
        return;
      }

      const existingRequestQuery = query(
        collection(db, 'friendRequests'),
        where('fromUserId', '==', currentUser.uid),
        where('toUserId', '==', foundUser.id),
        where('status', '==', 'pending')
      );

      const existingRequestSnapshot = await getDocs(existingRequestQuery);

      setSearchedUser(foundUser);
      setRequestSent(!existingRequestSnapshot.empty);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const acceptFriendRequest = async (request) => {
    try {
      const friendData = {
        id: request.fromUserId,
        uid: request.fromUserId,
        name: request.fromName || '',
        username: request.fromUsername || '',
        email: request.fromEmail || '',
        profileImage: request.fromProfileImage || '',
        avatar: request.fromProfileImage || '',
        online: false,
      };

      await addFriendPermanently(friendData);

      await deleteDoc(doc(db, 'friendRequests', request.id));

      Alert.alert('Accepted', 'Friend request accepted.');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const rejectFriendRequest = async (request) => {
    try {
      await deleteDoc(doc(db, 'friendRequests', request.id));

      Alert.alert('Rejected', 'Friend request rejected.');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const openUserProfile = (user) => {
    navigation.navigate('UserProfileScreen', {
      user,
    });
  };

  const renderFriendRequest = ({ item }) => (
    <View style={styles.requestCard}>
      <View style={styles.left}>
        <Image
          source={{
            uri: item.fromProfileImage || 'https://i.pravatar.cc/150?img=1',
          }}
          style={styles.avatar}
        />

        <View>
          <Text style={styles.name}>
            {item.fromName || item.fromUsername || 'Player'}
          </Text>

          <Text style={styles.status}>
            {item.fromUsername ? `@${item.fromUsername}` : item.fromEmail}
          </Text>
        </View>
      </View>

      <View style={styles.requestButtons}>
        <TouchableOpacity
          style={styles.acceptButton}
          onPress={() => acceptFriendRequest(item)}
        >
          <Text style={styles.buttonText}>Accept</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.rejectButton}
          onPress={() => rejectFriendRequest(item)}
        >
          <Text style={styles.buttonText}>Reject</Text>
        </TouchableOpacity>
      </View>
    </View>
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

      <View style={styles.addFriendBox}>
        <TextInput
          style={styles.addFriendInput}
          placeholder="Enter email or username..."
          placeholderTextColor="#ccc"
          value={addFriendText}
          onChangeText={(text) => {
            setAddFriendText(text);
            setSearchedUser(null);
            setRequestSent(false);
          }}
          autoCapitalize="none"
        />

        <TouchableOpacity
          style={styles.smallAddButton}
          onPress={handleAddFriend}
        >
          <Text style={styles.smallAddText}>Search</Text>
        </TouchableOpacity>
      </View>

      {searchedUser && (
        <View style={styles.friendCard}>
          <TouchableOpacity
            style={styles.left}
            activeOpacity={0.8}
            onPress={() => openUserProfile(searchedUser)}
          >
            <Image
              source={{
                uri:
                  searchedUser.profileImage ||
                  searchedUser.avatar ||
                  'https://i.pravatar.cc/150?img=1',
              }}
              style={styles.avatar}
            />

            <View>
              <Text style={styles.name}>
                {searchedUser.name || searchedUser.username || 'Player'}
              </Text>

              <Text style={styles.status}>
                {searchedUser.username
                  ? `@${searchedUser.username}`
                  : searchedUser.email}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.inviteButton,
              requestSent && styles.requestedButton,
            ]}
            disabled={requestSent}
            onPress={() => sendFriendRequest(searchedUser)}
          >
            <Text style={styles.buttonText}>
              {requestSent ? 'Requested' : 'Add Friend'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {friendRequests.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Friend Requests</Text>

          <FlatList
            data={friendRequests}
            keyExtractor={(item) => item.id}
            renderItem={renderFriendRequest}
            scrollEnabled={false}
          />
        </>
      )}

      <Text style={styles.sectionTitle}>My Friends</Text>

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
              onPress={() =>
                navigation.navigate('Messages', {
                  selectedFriend: item,
                })
              }
            >
              <Text style={styles.buttonText}>Message</Text>
            </TouchableOpacity>
          </View>
        )}
      />
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

  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 5,
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

  requestCard: {
    backgroundColor: 'rgba(255,255,255,0.16)',
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
    color: '#ddd',
  },

  inviteButton: {
    backgroundColor: '#00c6ff',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 10,
    marginLeft: 10,
  },

  requestedButton: {
    backgroundColor: '#7f8c8d',
  },

  requestButtons: {
    flexDirection: 'row',
    marginTop: 12,
  },

  acceptButton: {
    flex: 1,
    backgroundColor: '#00ff88',
    paddingVertical: 10,
    borderRadius: 12,
    marginRight: 8,
    alignItems: 'center',
  },

  rejectButton: {
    flex: 1,
    backgroundColor: '#e74c3c',
    paddingVertical: 10,
    borderRadius: 12,
    marginLeft: 8,
    alignItems: 'center',
  },

  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});