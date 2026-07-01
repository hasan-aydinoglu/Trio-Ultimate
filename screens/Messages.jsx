import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { auth, db } from '../firebase';

import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  doc,
  setDoc,
  writeBatch,
} from 'firebase/firestore';

export default function Messages({ navigation, route }) {
  const [search, setSearch] = useState('');
  const [friends, setFriends] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(
    route?.params?.selectedFriend || null
  );
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');

  const currentUser = auth.currentUser;

  const getChatId = (uid1, uid2) => {
    return [uid1, uid2].sort().join('_');
  };

  useEffect(() => {
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
        console.log('Messages friends error:', error);
      }
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!currentUser || !selectedFriend) return;

    const friendId = selectedFriend.uid || selectedFriend.id;
    const chatId = getChatId(currentUser.uid, friendId);

    const q = query(
      collection(db, 'chats', chatId, 'messages'),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {
        const messageList = snapshot.docs.map((messageDoc) => ({
          id: messageDoc.id,
          ...messageDoc.data(),
        }));

        setMessages(messageList);

        const unreadMessages = snapshot.docs.filter((messageDoc) => {
          const data = messageDoc.data();

          return data.receiverId === currentUser.uid && data.read === false;
        });

        if (unreadMessages.length > 0) {
          const batch = writeBatch(db);

          unreadMessages.forEach((messageDoc) => {
            batch.update(messageDoc.ref, {
              read: true,
            });
          });

          await batch.commit();

          await setDoc(
            doc(db, 'chats', chatId),
            {
              lastMessageRead: true,
            },
            { merge: true }
          );
        }
      },
      (error) => {
        console.log('Messages listener error:', error);
      }
    );

    return () => unsubscribe();
  }, [selectedFriend]);

  const sendMessage = async () => {
    if (!messageText.trim()) return;
    if (!currentUser || !selectedFriend) return;

    const friendId = selectedFriend.uid || selectedFriend.id;
    const chatId = getChatId(currentUser.uid, friendId);

    const text = messageText.trim();

    setMessageText('');

    await addDoc(collection(db, 'chats', chatId, 'messages'), {
      text,
      senderId: currentUser.uid,
      receiverId: friendId,
      read: false,
      createdAt: serverTimestamp(),
    });

    await setDoc(
      doc(db, 'chats', chatId),
      {
        users: [currentUser.uid, friendId],
        lastMessage: text,
        lastMessageSenderId: currentUser.uid,
        lastMessageReceiverId: friendId,
        lastMessageRead: false,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  };

  const openUserProfile = (user) => {
    const userId = user.uid || user.id;

    const parentNavigation = navigation.getParent();

    if (parentNavigation) {
      parentNavigation.navigate('UserProfileScreen', {
        userId,
        user,
      });
    } else {
      navigation.navigate('UserProfileScreen', {
        userId,
        user,
      });
    }
  };

  const filteredFriends = friends.filter((item) =>
    (item.name || item.username || item.email || '')
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const renderFriend = ({ item }) => (
    <TouchableOpacity
      style={styles.chatRow}
      activeOpacity={0.8}
      onPress={() => setSelectedFriend(item)}
    >
      <TouchableOpacity
        style={styles.avatarWrapper}
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

        {item.online && <View style={styles.onlineDot} />}
      </TouchableOpacity>

      <View style={styles.messageInfo}>
        <Text style={styles.name}>
          {item.name || item.username || 'Player'}
        </Text>

        <Text style={styles.lastMessage}>Tap to start chatting</Text>

        <Text style={styles.username}>
          {item.username || item.email}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderMessage = ({ item }) => {
    const isMe = item.senderId === currentUser?.uid;

    return (
      <View
        style={[
          styles.messageBubble,
          isMe ? styles.myMessage : styles.theirMessage,
        ]}
      >
        <Text style={styles.messageText}>{item.text}</Text>
      </View>
    );
  };

  if (selectedFriend) {
    return (
      <LinearGradient
        colors={['#00c6ff', '#0072ff', '#000']}
        style={styles.container}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.chatHeader}>
            <TouchableOpacity onPress={() => setSelectedFriend(null)}>
              <Ionicons name="arrow-back" size={28} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => openUserProfile(selectedFriend)}
            >
              <Image
                source={{
                  uri:
                    selectedFriend.profileImage ||
                    selectedFriend.avatar ||
                    'https://i.pravatar.cc/150?img=1',
                }}
                style={styles.headerAvatar}
              />
            </TouchableOpacity>

            <Text style={styles.chatTitle}>
              {selectedFriend.name || selectedFriend.username || 'Player'}
            </Text>
          </View>

          <FlatList
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderMessage}
            contentContainerStyle={{ paddingVertical: 15 }}
          />

          <View style={styles.inputRow}>
            <TextInput
              style={styles.messageInput}
              placeholder="Type message..."
              placeholderTextColor="#ccc"
              value={messageText}
              onChangeText={setMessageText}
            />

            <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
              <Ionicons name="send" size={22} color="#fff" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </LinearGradient>
    );
  }

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
          placeholder="Search friends..."
          placeholderTextColor="#ccc"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <Text style={styles.sectionTitle}>Chats</Text>

      <FlatList
        data={filteredFriends}
        keyExtractor={(item) => item.id}
        renderItem={renderFriend}
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

  name: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
  },

  lastMessage: {
    color: '#dcdcdc',
    fontSize: 14,
    marginTop: 4,
  },

  username: {
    color: '#b8eaff',
    fontSize: 12,
    marginTop: 3,
  },

  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },

  headerAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    marginLeft: 15,
    marginRight: 10,
  },

  chatTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },

  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 10,
  },

  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#00ff88',
  },

  theirMessage: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.18)',
  },

  messageText: {
    color: '#fff',
    fontSize: 15,
  },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 18,
  },

  messageInput: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 18,
    paddingHorizontal: 15,
    paddingVertical: 12,
    color: '#fff',
    marginRight: 10,
  },

  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#00c6ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
});