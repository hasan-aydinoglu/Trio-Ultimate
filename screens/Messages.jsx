import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TextInput,
  TouchableOpacity,
  Keyboard,
  Platform,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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

const DEFAULT_AVATAR = 'https://i.pravatar.cc/150?img=1';

export default function Messages({ navigation, route }) {
  const [search, setSearch] = useState('');
  const [friends, setFriends] = useState([]);
  const [conversations, setConversations] = useState([]);
  // Messages tab always opens on the conversations list.
  // A friend is selected only when the screen receives an intentional route param.
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');

  const messageListRef = useRef(null);
  const currentUser = auth.currentUser;
  const insets = useSafeAreaInsets();
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const getChatId = (uid1, uid2) => {
    return [uid1, uid2].sort().join('_');
  };

  const getDisplayName = (user) =>
    user?.name || user?.username || user?.email || 'Player';

  const getSecondaryText = (user) => {
    if (user?.username) return `@${user.username}`;
    return user?.email || 'Trio Player';
  };

  const getAvatarUri = (user) =>
    user?.profileImage || user?.avatar || DEFAULT_AVATAR;

  const formatMessageTime = (createdAt) => {
    if (!createdAt) return '';

    try {
      const date = createdAt?.toDate ? createdAt.toDate() : new Date(createdAt);

      if (Number.isNaN(date.getTime())) return '';

      return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      return '';
    }
  };

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSubscription = Keyboard.addListener(showEvent, (event) => {
      setKeyboardHeight(event?.endCoordinates?.height || 0);
    });

    const hideSubscription = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  // Keep the composer above both the bottom tab bar and the software keyboard.
  const tabBarOffset = 76;
  const composerBottom =
    keyboardHeight > 0
      ? Platform.OS === 'ios'
        ? Math.max(keyboardHeight - insets.bottom, 0)
        : 0
      : tabBarOffset;

  const composerReservedSpace = composerBottom + 78;

  useEffect(() => {
    const friendFromRoute = route?.params?.selectedFriend;

    if (!friendFromRoute) return;

    setSelectedFriend(friendFromRoute);

    // Consume the parameter once so the same chat does not reopen next time.
    navigation.setParams?.({ selectedFriend: undefined });
  }, [navigation, route?.params?.selectedFriend]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('tabPress', () => {
      setSelectedFriend(null);
      setMessages([]);
      setMessageText('');
      navigation.setParams?.({ selectedFriend: undefined });
    });

    return unsubscribe;
  }, [navigation]);

  const closeChat = () => {
    setSelectedFriend(null);
    setMessages([]);
    setMessageText('');
    navigation.setParams?.({ selectedFriend: undefined });
  };

  useEffect(() => {
    if (!currentUser) return;

    const unsubscribe = onSnapshot(
      collection(db, 'users', currentUser.uid, 'friends'),
      (snapshot) => {
        const friendsList = snapshot.docs.map((friendDoc) => ({
          id: friendDoc.id,
          ...friendDoc.data(),
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
    if (!currentUser) return;

    const unsubscribe = onSnapshot(
      collection(db, 'chats'),
      (snapshot) => {
        const conversationList = snapshot.docs
          .map((chatDoc) => ({
            id: chatDoc.id,
            ...chatDoc.data(),
          }))
          .filter(
            (chat) =>
              Array.isArray(chat.users) &&
              chat.users.includes(currentUser.uid)
          )
          .sort((a, b) => {
            const aTime = a.updatedAt?.toMillis
              ? a.updatedAt.toMillis()
              : 0;
            const bTime = b.updatedAt?.toMillis
              ? b.updatedAt.toMillis()
              : 0;

            return bTime - aTime;
          });

        setConversations(conversationList);
      },
      (error) => {
        console.log('Messages conversations error:', error);
      }
    );

    return () => unsubscribe();
  }, [currentUser?.uid]);

  useEffect(() => {
    if (!currentUser || !selectedFriend) return;

    const friendId = selectedFriend.uid || selectedFriend.id;
    const chatId = getChatId(currentUser.uid, friendId);

    const messagesQuery = query(
      collection(db, 'chats', chatId, 'messages'),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(
      messagesQuery,
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

  useEffect(() => {
    if (messages.length === 0) return;

    const timer = setTimeout(() => {
      messageListRef.current?.scrollToEnd({ animated: true });
    }, 120);

    return () => clearTimeout(timer);
  }, [messages]);

  const sendMessage = async () => {
    if (!messageText.trim()) return;
    if (!currentUser || !selectedFriend) return;

    const friendId = selectedFriend.uid || selectedFriend.id;
    const chatId = getChatId(currentUser.uid, friendId);
    const text = messageText.trim();

    setMessageText('');

    try {
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
    } catch (error) {
      console.log('Send message error:', error);
      setMessageText(text);
    }
  };

  const openUserProfile = (user) => {
    const userId = user.uid || user.id;

    if (!userId) return;

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

  const conversationFriends = friends
    .map((friend) => {
      const friendId = friend.uid || friend.id;
      const chatId = getChatId(currentUser?.uid || '', friendId);
      const conversation = conversations.find((chat) => chat.id === chatId);

      const hasUnreadMessage =
        conversation?.lastMessageReceiverId === currentUser?.uid &&
        conversation?.lastMessageRead === false;

      return {
        ...friend,
        conversation,
        hasUnreadMessage,
      };
    })
    .sort((a, b) => {
      const aTime = a.conversation?.updatedAt?.toMillis
        ? a.conversation.updatedAt.toMillis()
        : 0;
      const bTime = b.conversation?.updatedAt?.toMillis
        ? b.conversation.updatedAt.toMillis()
        : 0;

      return bTime - aTime;
    });

  const filteredFriends = conversationFriends.filter((item) =>
    (item.name || item.username || item.email || '')
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const renderFriend = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.chatCard,
        item.hasUnreadMessage && styles.unreadChatCard,
      ]}
      activeOpacity={0.86}
      onPress={() => setSelectedFriend(item)}
    >
      <TouchableOpacity
        style={styles.avatarWrapper}
        activeOpacity={0.8}
        onPress={() => openUserProfile(item)}
      >
        <Image source={{ uri: getAvatarUri(item) }} style={styles.avatar} />

        <View
          style={[
            styles.onlineDot,
            item.online ? styles.onlineDotActive : styles.onlineDotInactive,
          ]}
        />
      </TouchableOpacity>

      <View style={styles.messageInfo}>
        <View style={styles.friendNameRow}>
          <Text
            style={[
              styles.name,
              item.hasUnreadMessage && styles.unreadName,
            ]}
            numberOfLines={1}
          >
            {getDisplayName(item)}
          </Text>

          <View
            style={[
              styles.statusBadge,
              item.online
                ? styles.statusBadgeOnline
                : styles.statusBadgeOffline,
            ]}
          >
            <Text
              style={[
                styles.statusBadgeText,
                item.online
                  ? styles.statusBadgeTextOnline
                  : styles.statusBadgeTextOffline,
              ]}
            >
              {item.online ? 'Online' : 'Offline'}
            </Text>
          </View>
        </View>

        <Text
          style={[
            styles.lastMessage,
            item.hasUnreadMessage && styles.unreadLastMessage,
          ]}
          numberOfLines={1}
        >
          {item.conversation?.lastMessage || 'Tap to open your conversation'}
        </Text>

        <Text style={styles.username} numberOfLines={1}>
          {getSecondaryText(item)}
        </Text>
      </View>

      <View
        style={[
          styles.openChatButton,
          item.hasUnreadMessage && styles.unreadOpenChatButton,
        ]}
      >
        {item.hasUnreadMessage ? (
          <View style={styles.unreadDot} />
        ) : (
          <Ionicons name="chatbubble-ellipses" size={20} color="#001A33" />
        )}
      </View>
    </TouchableOpacity>
  );

  const renderMessage = ({ item }) => {
    const isMe = item.senderId === currentUser?.uid;
    const time = formatMessageTime(item.createdAt);

    return (
      <View
        style={[
          styles.messageLine,
          isMe ? styles.myMessageLine : styles.theirMessageLine,
        ]}
      >
        {!isMe && (
          <Image
            source={{ uri: getAvatarUri(selectedFriend) }}
            style={styles.messageAvatar}
          />
        )}

        <View
          style={[
            styles.messageBubble,
            isMe ? styles.myMessage : styles.theirMessage,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isMe ? styles.myMessageText : styles.theirMessageText,
            ]}
          >
            {item.text}
          </Text>

          <View style={styles.messageMetaRow}>
            {!!time && (
              <Text
                style={[
                  styles.messageTime,
                  isMe ? styles.myMessageTime : styles.theirMessageTime,
                ]}
              >
                {time}
              </Text>
            )}

            {isMe && (
              <Ionicons
                name={item.read ? 'checkmark-done' : 'checkmark'}
                size={15}
                color={item.read ? '#00699A' : '#34718C'}
              />
            )}
          </View>
        </View>
      </View>
    );
  };

  const BackgroundDecoration = () => (
    <>
      <View pointerEvents="none" style={styles.backgroundShade} />
      <View pointerEvents="none" style={styles.glowTop} />
      <View pointerEvents="none" style={styles.glowBottom} />
      <Image
        pointerEvents="none"
        //source={require('../assets/trio-logo.png')}
        resizeMode="contain"
        fadeDuration={0}
        style={styles.backgroundLogo}
      />
    </>
  );

  if (selectedFriend) {
    return (
      <LinearGradient
        colors={['#00C6FF', '#0072FF', '#003A9F', '#001B4C', '#000000']}
        locations={[0, 0.26, 0.48, 0.72, 1]}
        style={styles.container}
      >
        <StatusBar barStyle="light-content" backgroundColor="#00A8F3" />
        <BackgroundDecoration />

        <SafeAreaView style={styles.safeArea}>
          <View style={styles.keyboardArea}>
            <View style={styles.chatHeaderCard}>
              <TouchableOpacity
                style={styles.headerRoundButton}
                activeOpacity={0.8}
                onPress={closeChat}
              >
                <Ionicons name="arrow-back" size={23} color="#FFFFFF" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.chatUserArea}
                activeOpacity={0.82}
                onPress={() => openUserProfile(selectedFriend)}
              >
                <View style={styles.headerAvatarWrapper}>
                  <Image
                    source={{ uri: getAvatarUri(selectedFriend) }}
                    style={styles.headerAvatar}
                  />

                  <View
                    style={[
                      styles.headerOnlineDot,
                      selectedFriend.online
                        ? styles.onlineDotActive
                        : styles.onlineDotInactive,
                    ]}
                  />
                </View>

                <View style={styles.chatHeaderTextArea}>
                  <Text style={styles.chatTitle} numberOfLines={1}>
                    {getDisplayName(selectedFriend)}
                  </Text>
                  <Text
                    style={[
                      styles.chatStatus,
                      selectedFriend.online
                        ? styles.chatStatusOnline
                        : styles.chatStatusOffline,
                    ]}
                  >
                    {selectedFriend.online ? 'Online now' : 'Offline'}
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.headerRoundButton}
                activeOpacity={0.8}
                onPress={() => openUserProfile(selectedFriend)}
              >
                <Ionicons name="person-outline" size={22} color="#00E5FF" />
              </TouchableOpacity>
            </View>

            <FlatList
              ref={messageListRef}
              style={[
                styles.messageList,
                { marginBottom: composerReservedSpace },
              ]}
              data={messages}
              keyExtractor={(item) => item.id}
              renderItem={renderMessage}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="always"
              keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
              contentContainerStyle={[
                styles.messagesContent,
                messages.length === 0 && styles.emptyMessagesContent,
              ]}
              ListEmptyComponent={
                <View style={styles.emptyChatState}>
                  <View style={styles.emptyChatIconBox}>
                    <Ionicons
                      name="chatbubbles-outline"
                      size={38}
                      color="#00E5FF"
                    />
                  </View>
                  <Text style={styles.emptyChatTitle}>Start the conversation</Text>
                  <Text style={styles.emptyChatText}>
                    Send the first message to {getDisplayName(selectedFriend)}.
                  </Text>
                </View>
              }
              onContentSizeChange={() =>
                messageListRef.current?.scrollToEnd({ animated: true })
              }
            />

            <View
              pointerEvents="box-none"
              style={[
                styles.composerOuter,
                {
                  bottom: composerBottom,
                  paddingBottom:
                    keyboardHeight > 0 ? 8 : Math.max(insets.bottom, 10),
                },
              ]}
            >
              <View style={styles.composerRow}>
                <View style={styles.messageInputWrapper}>
                  <Ionicons
                    name="chatbubble-outline"
                    size={19}
                    color="#BBD7EA"
                  />

                  <TextInput
                    style={styles.messageInput}
                    placeholder="Type a message..."
                    placeholderTextColor="#B5CEE4"
                    value={messageText}
                    onChangeText={setMessageText}
                    onSubmitEditing={sendMessage}
                    returnKeyType="send"
                    blurOnSubmit={false}
                    multiline
                    maxLength={1000}
                    textAlignVertical="center"
                    selectionColor="#00E5FF"
                  />
                </View>

                <TouchableOpacity
                  style={[
                    styles.sendButton,
                    !messageText.trim() && styles.sendButtonDisabled,
                  ]}
                  activeOpacity={0.85}
                  disabled={!messageText.trim()}
                  onPress={sendMessage}
                >
                  <Ionicons name="send" size={21} color="#001A33" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  const renderListHeader = () => (
    <View>
      <View style={styles.headerRow}>
        <View style={styles.headerTextArea}>
          <Text style={styles.eyebrow}>TRIO</Text>
          <Text style={styles.title}>Messages</Text>
          
        </View>

        <View style={styles.headerIconBox}>
          <Ionicons name="chatbubbles" size={27} color="#00E5FF" />
          <Text style={styles.headerCount}>{friends.length}</Text>
        </View>
      </View>

      <View style={styles.searchBox}>
        <Ionicons name="search" size={20} color="#D0E7F8" />

        <TextInput
          style={styles.searchInput}
          placeholder="Search your friends"
          placeholderTextColor="#B5CEE4"
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
          autoCorrect={false}
        />

        {search.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            activeOpacity={0.8}
            onPress={() => setSearch('')}
          >
            <Ionicons name="close-circle" size={20} color="#B5CEE4" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.sectionHeaderRow}>
        <View>
          <Text style={styles.sectionTitle}>Your conversations</Text>
          <Text style={styles.sectionSubtitle}>
            {search
              ? `${filteredFriends.length} matching player${
                  filteredFriends.length === 1 ? '' : 's'
                }`
              : `${friends.length} friend${friends.length === 1 ? '' : 's'}`}
          </Text>
        </View>

        <View style={styles.sectionIconBox}>
          <Ionicons name="people-outline" size={20} color="#00E5FF" />
        </View>
      </View>
    </View>
  );

  return (
    <LinearGradient
      colors={['#00C6FF', '#0072FF', '#003A9F', '#001B4C', '#000000']}
      locations={[0, 0.26, 0.48, 0.72, 1]}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor="#00A8F3" />
      <BackgroundDecoration />

      <SafeAreaView style={styles.safeArea}>
        <FlatList
          data={filteredFriends}
          keyExtractor={(item) => item.id || item.uid}
          renderItem={renderFriend}
          ListHeaderComponent={renderListHeader}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <View style={styles.emptyIconBox}>
                <Ionicons
                  name={search ? 'search-outline' : 'chatbubbles-outline'}
                  size={36}
                  color="#00E5FF"
                />
              </View>

              <Text style={styles.emptyTitle}>
                {search ? 'No matching friends' : 'No conversations yet'}
              </Text>

              <Text style={styles.emptyText}>
                {search
                  ? 'Try another name, username or email address.'
                  : 'Add friends from the Friends page, then start chatting here.'}
              </Text>
            </View>
          }
          ListFooterComponent={<View style={styles.footerSpace} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        />
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  safeArea: {
    flex: 1,
    zIndex: 3,
  },

  keyboardArea: {
    flex: 1,
    minHeight: 0,
  },

  messageList: {
    flex: 1,
    minHeight: 0,
  },

  backgroundShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 10, 34, 0.08)',
    zIndex: 0,
  },

  glowTop: {
    position: 'absolute',
    top: -100,
    right: -90,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(0, 229, 255, 0.12)',
    zIndex: 0,
  },

  glowBottom: {
    position: 'absolute',
    bottom: -110,
    left: -90,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(0, 114, 255, 0.18)',
    zIndex: 0,
  },

  backgroundLogo: {
    position: 'absolute',
    bottom: -46,
    left: '-18%',
    width: '136%',
    height: 430,
    opacity: 0.18,
    zIndex: 1,
    backgroundColor: 'transparent',
  },

  listContent: {
    paddingHorizontal: 18,
    paddingTop: 18,
    flexGrow: 1,
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 20,
  },

  headerTextArea: {
    flex: 1,
    paddingRight: 16,
  },

  eyebrow: {
    color: '#9DEFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.8,
    marginBottom: 6,
  },

  title: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -0.7,
  },

  subtitle: {
    color: '#D5EAF7',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 7,
  },

  headerIconBox: {
    minWidth: 58,
    height: 58,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 28, 78, 0.72)',
    borderWidth: 1,
    borderColor: 'rgba(155, 232, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },

  headerCount: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    marginTop: 1,
  },

  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 54,
    backgroundColor: 'rgba(0, 31, 88, 0.76)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(154, 224, 255, 0.24)',
    paddingHorizontal: 15,
    marginBottom: 24,
  },

  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 15,
    marginLeft: 10,
    paddingVertical: 13,
  },

  clearButton: {
    padding: 4,
  },

  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },

  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
  },

  sectionSubtitle: {
    color: '#BFD8EA',
    fontSize: 13,
    marginTop: 4,
  },

  sectionIconBox: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 229, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.24)',
  },

  chatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 27, 76, 0.82)',
    padding: 14,
    borderRadius: 22,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(156, 225, 255, 0.18)',
  },

  unreadChatCard: {
    backgroundColor: 'rgba(0, 45, 105, 0.96)',
    borderColor: 'rgba(0, 229, 255, 0.72)',
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
    borderColor: 'rgba(255, 255, 255, 0.72)',
  },

  onlineDot: {
    position: 'absolute',
    right: 1,
    bottom: 3,
    width: 15,
    height: 15,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: '#00347D',
  },

  onlineDotActive: {
    backgroundColor: '#00FF88',
  },

  onlineDotInactive: {
    backgroundColor: '#8CA0B8',
  },

  messageInfo: {
    flex: 1,
    minWidth: 0,
  },

  friendNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  name: {
    flexShrink: 1,
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    marginRight: 8,
  },

  unreadName: {
    fontWeight: '900',
  },

  statusBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 9,
  },

  statusBadgeOnline: {
    backgroundColor: 'rgba(0, 255, 136, 0.13)',
  },

  statusBadgeOffline: {
    backgroundColor: 'rgba(140, 160, 184, 0.14)',
  },

  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },

  statusBadgeTextOnline: {
    color: '#69FFB7',
  },

  statusBadgeTextOffline: {
    color: '#C2D0DE',
  },

  lastMessage: {
    color: '#D3E6F3',
    fontSize: 13,
    marginTop: 6,
  },

  unreadLastMessage: {
    color: '#FFFFFF',
    fontWeight: '900',
  },

  username: {
    color: '#8DDFF3',
    fontSize: 12,
    marginTop: 4,
  },

  openChatButton: {
    width: 43,
    height: 43,
    borderRadius: 15,
    marginLeft: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00E5FF',
  },

  unreadOpenChatButton: {
    backgroundColor: '#FFFFFF',
  },

  unreadDot: {
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: '#0072FF',
  },

  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingVertical: 48,
    backgroundColor: 'rgba(0, 27, 76, 0.7)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(150, 222, 255, 0.17)',
  },

  emptyIconBox: {
    width: 70,
    height: 70,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 229, 255, 0.14)',
    marginBottom: 18,
  },

  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '800',
    textAlign: 'center',
  },

  emptyText: {
    color: '#C4DCEB',
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    marginTop: 8,
  },

  footerSpace: {
    height: 28,
  },

  chatHeaderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 14,
    marginTop: 10,
    marginBottom: 8,
    padding: 10,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 27, 76, 0.86)',
    borderWidth: 1,
    borderColor: 'rgba(160, 228, 255, 0.2)',
    zIndex: 5,
  },

  headerRoundButton: {
    width: 43,
    height: 43,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 229, 255, 0.13)',
  },

  chatUserArea: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 9,
  },

  headerAvatarWrapper: {
    position: 'relative',
  },

  headerAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.75)',
  },

  headerOnlineDot: {
    position: 'absolute',
    right: -1,
    bottom: 1,
    width: 13,
    height: 13,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#00347D',
  },

  chatHeaderTextArea: {
    flex: 1,
    minWidth: 0,
    marginLeft: 10,
  },

  chatTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },

  chatStatus: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 3,
  },

  chatStatusOnline: {
    color: '#62FFB2',
  },

  chatStatusOffline: {
    color: '#BFD0E0',
  },

  messagesContent: {
    flexGrow: 1,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 16,
  },

  emptyMessagesContent: {
    justifyContent: 'center',
  },

  messageLine: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 10,
  },

  myMessageLine: {
    justifyContent: 'flex-end',
  },

  theirMessageLine: {
    justifyContent: 'flex-start',
  },

  messageAvatar: {
    width: 29,
    height: 29,
    borderRadius: 15,
    marginRight: 7,
    marginBottom: 2,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.55)',
  },

  messageBubble: {
    maxWidth: '78%',
    minWidth: 74,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 7,
    borderRadius: 20,
    borderWidth: 1,
  },

  myMessage: {
    backgroundColor: '#00E5FF',
    borderColor: 'rgba(255, 255, 255, 0.45)',
    borderBottomRightRadius: 6,
  },

  theirMessage: {
    backgroundColor: 'rgba(0, 27, 76, 0.9)',
    borderColor: 'rgba(161, 225, 255, 0.22)',
    borderBottomLeftRadius: 6,
  },

  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },

  myMessageText: {
    color: '#00233C',
    fontWeight: '600',
  },

  theirMessageText: {
    color: '#FFFFFF',
  },

  messageMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginTop: 4,
  },

  messageTime: {
    fontSize: 10,
    marginRight: 3,
  },

  myMessageTime: {
    color: '#21647D',
  },

  theirMessageTime: {
    color: '#9DBBD0',
  },

  emptyChatState: {
    alignItems: 'center',
    paddingHorizontal: 36,
  },

  emptyChatIconBox: {
    width: 78,
    height: 78,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 27, 76, 0.78)',
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.25)',
  },

  emptyChatTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    marginTop: 18,
  },

  emptyChatText: {
    color: '#C7DFED',
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    marginTop: 7,
  },

  composerOuter: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 50,
    elevation: 50,
    paddingHorizontal: 12,
    paddingTop: 9,
    backgroundColor: 'rgba(0, 11, 38, 0.98)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(147, 218, 255, 0.22)',
  },

  composerRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },

  messageInputWrapper: {
    flex: 1,
    minHeight: 54,
    maxHeight: 118,
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: 'rgba(0, 35, 90, 0.9)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(155, 226, 255, 0.2)',
    paddingLeft: 14,
    paddingRight: 10,
    paddingVertical: 13,
    marginRight: 9,
  },

  messageInput: {
    flex: 1,
    minHeight: 26,
    maxHeight: 90,
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 20,
    padding: 0,
    marginLeft: 9,
  },

  sendButton: {
    width: 50,
    height: 50,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00E5FF',
  },

  sendButtonDisabled: {
    opacity: 0.42,
  },
});