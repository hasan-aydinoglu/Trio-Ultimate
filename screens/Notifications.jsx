import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  StatusBar,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { auth, db } from '../firebase';

import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
} from 'firebase/firestore';

export default function Notifications({ navigation }) {
  const [gameInvites, setGameInvites] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [unreadChats, setUnreadChats] = useState([]);

  const [gameInvitesLoading, setGameInvitesLoading] = useState(true);
  const [friendRequestsLoading, setFriendRequestsLoading] = useState(true);
  const [unreadChatsLoading, setUnreadChatsLoading] = useState(true);

  const currentUserId = auth.currentUser?.uid;

  useEffect(() => {
    if (!currentUserId) {
      setGameInvites([]);
      setGameInvitesLoading(false);
      return undefined;
    }

    const gameInvitesQuery = query(
      collection(db, 'gameInvites'),
      where('toUserId', '==', currentUserId),
      where('status', '==', 'pending')
    );

    const unsubscribe = onSnapshot(
      gameInvitesQuery,
      (snapshot) => {
        const invites = snapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        }));

        setGameInvites(invites);
        setGameInvitesLoading(false);
      },
      (error) => {
        console.log('Notifications game invites error:', error);
        setGameInvitesLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUserId]);

  useEffect(() => {
    if (!currentUserId) {
      setFriendRequests([]);
      setFriendRequestsLoading(false);
      return undefined;
    }

    const friendRequestsQuery = query(
      collection(db, 'friendRequests'),
      where('toUserId', '==', currentUserId),
      where('status', '==', 'pending')
    );

    const unsubscribe = onSnapshot(
      friendRequestsQuery,
      (snapshot) => {
        const requests = snapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        }));

        setFriendRequests(requests);
        setFriendRequestsLoading(false);
      },
      (error) => {
        console.log('Notifications friend requests error:', error);
        setFriendRequestsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUserId]);

  useEffect(() => {
    if (!currentUserId) {
      setUnreadChats([]);
      setUnreadChatsLoading(false);
      return undefined;
    }

    const unreadMessagesQuery = query(
      collection(db, 'chats'),
      where('lastMessageReceiverId', '==', currentUserId),
      where('lastMessageRead', '==', false)
    );

    const unsubscribe = onSnapshot(
      unreadMessagesQuery,
      (snapshot) => {
        const chats = snapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        }));

        setUnreadChats(chats);
        setUnreadChatsLoading(false);
      },
      (error) => {
        console.log('Notifications unread messages error:', error);
        setUnreadChatsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUserId]);

  const getTimeValue = (item) => {
    const possibleDate =
      item.createdAt ||
      item.updatedAt ||
      item.lastMessageAt ||
      item.sentAt ||
      item.timestamp;

    if (!possibleDate) {
      return 0;
    }

    if (typeof possibleDate.toMillis === 'function') {
      return possibleDate.toMillis();
    }

    if (typeof possibleDate.toDate === 'function') {
      return possibleDate.toDate().getTime();
    }

    const dateValue = new Date(possibleDate).getTime();
    return Number.isNaN(dateValue) ? 0 : dateValue;
  };

  const notifications = useMemo(() => {
    const inviteItems = gameInvites.map((invite) => {
      const inviterName =
        invite.fromUsername ||
        invite.fromName ||
        invite.senderName ||
        'A player';

      return {
        key: `game-${invite.id}`,
        id: invite.id,
        type: 'game_invite',
        title: 'New game invitation',
        message: `${inviterName} invited you to Game Type ${
          invite.gameType || 1
        }.`,
        time: getTimeValue(invite),
        originalData: invite,
      };
    });

    const friendItems = friendRequests.map((request) => {
      const senderName =
        request.fromUsername ||
        request.fromName ||
        request.senderName ||
        request.username ||
        'A player';

      return {
        key: `friend-${request.id}`,
        id: request.id,
        type: 'friend_request',
        title: 'New friend request',
        message: `${senderName} sent you a friend request.`,
        time: getTimeValue(request),
        originalData: request,
      };
    });

    const messageItems = unreadChats.map((chat) => {
      const senderName =
        chat.lastMessageSenderName ||
        chat.senderName ||
        chat.otherUserName ||
        chat.username ||
        'A friend';

      const messageText =
        chat.lastMessage ||
        chat.lastMessageText ||
        chat.message ||
        'Sent you a new message.';

      return {
        key: `message-${chat.id}`,
        id: chat.id,
        type: 'message',
        title: senderName,
        message: messageText,
        time: getTimeValue(chat),
        originalData: chat,
      };
    });

    return [...inviteItems, ...friendItems, ...messageItems].sort(
      (firstItem, secondItem) => secondItem.time - firstItem.time
    );
  }, [gameInvites, friendRequests, unreadChats]);

  const loading =
    gameInvitesLoading || friendRequestsLoading || unreadChatsLoading;

  const formatTime = (timeValue) => {
    if (!timeValue) {
      return 'New';
    }

    const difference = Date.now() - timeValue;
    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;

    if (difference < minute) {
      return 'Now';
    }

    if (difference < hour) {
      return `${Math.floor(difference / minute)}m ago`;
    }

    if (difference < day) {
      return `${Math.floor(difference / hour)}h ago`;
    }

    if (difference < day * 7) {
      return `${Math.floor(difference / day)}d ago`;
    }

    return new Date(timeValue).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
    });
  };

  const getNotificationIcon = (type) => {
    if (type === 'game_invite') {
      return {
        name: 'game-controller',
        colors: ['#087BFF', '#0045AE'],
      };
    }

    if (type === 'friend_request') {
      return {
        name: 'person-add',
        colors: ['#8B38F2', '#4E159B'],
      };
    }

    return {
      name: 'chatbubble-ellipses',
      colors: ['#0CCDB0', '#006960'],
    };
  };

  const openTabScreen = (screenName) => {
    navigation.navigate('TabNavigator', {
      screen: screenName,
    });
  };

  const acceptInvite = async (invite) => {
    try {
      await updateDoc(doc(db, 'gameInvites', invite.id), {
        status: 'accepted',
      });

      navigation.navigate('OnlineLobbyScreen', {
        roomId: invite.roomId,
        gameType: invite.gameType,
      });
    } catch (error) {
      Alert.alert(
        'Error',
        error?.message || 'The invitation could not be accepted.'
      );
    }
  };

  const declineInvite = async (invite) => {
    try {
      await updateDoc(doc(db, 'gameInvites', invite.id), {
        status: 'declined',
      });
    } catch (error) {
      Alert.alert(
        'Error',
        error?.message || 'The invitation could not be declined.'
      );
    }
  };

  const handleNotificationPress = (notification) => {
    if (notification.type === 'message') {
      openTabScreen('Messages');
      return;
    }

    if (notification.type === 'friend_request') {
      openTabScreen('Friends');
      return;
    }

    openTabScreen('GameMode');
  };

  const renderNotification = ({ item }) => {
    const icon = getNotificationIcon(item.type);
    const isGameInvite = item.type === 'game_invite';

    return (
      <TouchableOpacity
        style={styles.notificationCard}
        activeOpacity={0.84}
        onPress={() => handleNotificationPress(item)}
      >
        <LinearGradient
          colors={icon.colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.notificationIcon}
        >
          <Ionicons name={icon.name} size={25} color="#FFFFFF" />
        </LinearGradient>

        <View style={styles.notificationContent}>
          <View style={styles.notificationTitleRow}>
            <Text style={styles.notificationTitle} numberOfLines={1}>
              {item.title}
            </Text>

            <View style={styles.unreadDot} />
          </View>

          <Text style={styles.notificationMessage} numberOfLines={2}>
            {item.message}
          </Text>

          <Text style={styles.notificationTime}>
            {formatTime(item.time)}
          </Text>

          {isGameInvite && (
            <View style={styles.inviteActions}>
              <TouchableOpacity
                style={styles.declineButton}
                activeOpacity={0.8}
                onPress={() => declineInvite(item.originalData)}
              >
                <Text style={styles.declineButtonText}>Decline</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.acceptButton}
                activeOpacity={0.8}
                onPress={() => acceptInvite(item.originalData)}
              >
                <LinearGradient
                  colors={['#08DDA6', '#007B64']}
                  style={styles.acceptButtonGradient}
                >
                  <Text style={styles.acceptButtonText}>Accept</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {!isGameInvite && (
          <Ionicons
            name="chevron-forward"
            size={21}
            color="rgba(255,255,255,0.42)"
          />
        )}
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Ionicons
          name="notifications-outline"
          size={55}
          color="#73C7FF"
        />
      </View>

      <Text style={styles.emptyTitle}>You're all caught up</Text>

      <Text style={styles.emptyDescription}>
        New messages, friend requests and game invitations will appear here.
      </Text>
    </View>
  );

  return (
    <LinearGradient
      colors={['#08A8FF', '#0069E9', '#003B9F', '#001B4C', '#000713']}
      locations={[0, 0.2, 0.43, 0.7, 1]}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor="#08A8FF" />

      <SafeAreaView style={styles.safeArea}>
        <View pointerEvents="none" style={styles.topGlow} />
        <View pointerEvents="none" style={styles.middleGlow} />
        <View pointerEvents="none" style={styles.bottomGlow} />

        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerButton}
            activeOpacity={0.8}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={27} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Notifications</Text>

            {notifications.length > 0 && (
              <View style={styles.headerBadge}>
                <Text style={styles.headerBadgeText}>
                  {notifications.length > 99 ? '99+' : notifications.length}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.headerButtonPlaceholder} />
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FFFFFF" />
            <Text style={styles.loadingText}>Loading notifications...</Text>
          </View>
        ) : (
          <FlatList
            data={notifications}
            keyExtractor={(item) => item.key}
            renderItem={renderNotification}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.listContent,
              notifications.length === 0 && styles.emptyListContent,
            ]}
            ListEmptyComponent={renderEmptyState}
          />
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000713',
  },

  safeArea: {
    flex: 1,
    overflow: 'hidden',
  },

  topGlow: {
    position: 'absolute',
    top: -160,
    left: -120,
    width: 470,
    height: 470,
    borderRadius: 235,
    backgroundColor: 'rgba(0,225,255,0.16)',
  },

  middleGlow: {
    position: 'absolute',
    top: 260,
    right: -220,
    width: 450,
    height: 450,
    borderRadius: 225,
    backgroundColor: 'rgba(0,80,255,0.13)',
  },

  bottomGlow: {
    position: 'absolute',
    bottom: -230,
    left: -120,
    width: 500,
    height: 500,
    borderRadius: 250,
    backgroundColor: 'rgba(0,92,255,0.08)',
  },

  header: {
    minHeight: 72,
    paddingHorizontal: 17,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 5,
  },

  headerButton: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: 'rgba(0,37,115,0.42)',
    borderWidth: 1.5,
    borderColor: 'rgba(70,177,255,0.70)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerButtonPlaceholder: {
    width: 46,
    height: 46,
  },

  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  headerTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
  },

  headerBadge: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FF4169',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    marginLeft: 8,
  },

  headerBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },

  listContent: {
    paddingHorizontal: 17,
    paddingTop: 12,
    paddingBottom: 42,
  },

  emptyListContent: {
    flexGrow: 1,
  },

  notificationCard: {
    width: '100%',
    backgroundColor: 'rgba(0,23,67,0.80)',
    borderWidth: 1.5,
    borderColor: 'rgba(18,117,234,0.60)',
    borderRadius: 19,
    padding: 14,
    marginBottom: 11,
    flexDirection: 'row',
    alignItems: 'center',
  },

  notificationIcon: {
    width: 51,
    height: 51,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.30)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },

  notificationContent: {
    flex: 1,
  },

  notificationTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  notificationTitle: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },

  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF4169',
    marginLeft: 8,
  },

  notificationMessage: {
    color: 'rgba(255,255,255,0.76)',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
    paddingRight: 8,
  },

  notificationTime: {
    color: '#64C7FF',
    fontSize: 10,
    fontWeight: '800',
    marginTop: 7,
  },

  inviteActions: {
    flexDirection: 'row',
    marginTop: 12,
  },

  declineButton: {
    flex: 1,
    height: 39,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: '#FF3F75',
    backgroundColor: 'rgba(255,35,101,0.04)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },

  declineButtonText: {
    color: '#FF7398',
    fontSize: 12,
    fontWeight: '900',
  },

  acceptButton: {
    flex: 1,
    height: 39,
    borderRadius: 11,
    overflow: 'hidden',
    marginLeft: 6,
  },

  acceptButtonGradient: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#00E5B2',
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },

  acceptButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },

  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingText: {
    color: 'rgba(255,255,255,0.70)',
    fontSize: 13,
    marginTop: 12,
  },

  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 35,
    paddingBottom: 70,
  },

  emptyIconContainer: {
    width: 104,
    height: 104,
    borderRadius: 34,
    backgroundColor: 'rgba(0,37,115,0.42)',
    borderWidth: 1.5,
    borderColor: 'rgba(70,177,255,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
    marginTop: 22,
  },

  emptyDescription: {
    color: 'rgba(255,255,255,0.62)',
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 9,
  },
});