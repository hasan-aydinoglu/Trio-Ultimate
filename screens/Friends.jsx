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
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

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

const DEFAULT_AVATAR = 'https://i.pravatar.cc/150?img=1';
export default function FriendsScreen({ navigation, route }) {
  const [search, setSearch] = useState('');
  const [addFriendText, setAddFriendText] = useState('');
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [searchedUser, setSearchedUser] = useState(null);
  const [requestSent, setRequestSent] = useState(false);

  const inviteMode = route?.params?.inviteMode || false;
  const roomId = route?.params?.roomId || null;
  const gameType = route?.params?.gameType || 1;

  useEffect(() => {
    const currentUser = auth.currentUser;

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
        const requestsList = snapshot.docs.map((requestDoc) => ({
          id: requestDoc.id,
          ...requestDoc.data(),
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

  const getDisplayName = (user) =>
    user?.name || user?.username || user?.email || 'Player';

  const getSecondaryText = (user) => {
    if (user?.username) return `@${user.username}`;
    return user?.email || 'Trio Player';
  };

  const getAvatarUri = (user) =>
    user?.profileImage || user?.avatar || DEFAULT_AVATAR;

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

  const sendGameInvite = async (friend) => {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      Alert.alert('Login Required', 'Please login first.');
      return;
    }

    try {
      const friendId = friend.uid || friend.id;

      const currentUserDoc = await getDoc(doc(db, 'users', currentUser.uid));

      const currentUserData = currentUserDoc.exists()
        ? currentUserDoc.data()
        : {};

      const existingInviteQuery = query(
        collection(db, 'gameInvites'),
        where('fromUserId', '==', currentUser.uid),
        where('toUserId', '==', friendId),
        where('gameType', '==', gameType),
        where('status', '==', 'pending')
      );

      const existingInviteSnapshot = await getDocs(existingInviteQuery);

      if (!existingInviteSnapshot.empty) {
        Alert.alert('Already Sent', 'Game invitation already sent.');
        return;
      }

      await addDoc(collection(db, 'gameInvites'), {
        fromUserId: currentUser.uid,
        fromName: currentUserData.name || '',
        fromUsername:
          currentUserData.username || currentUserData.name || 'Player',
        fromEmail: currentUser.email || '',
        fromProfileImage:
          currentUserData.profileImage || currentUserData.avatar || '',

        toUserId: friendId,
        toName: friend.name || '',
        toUsername: friend.username || '',
        toEmail: friend.email || '',
        toProfileImage: friend.profileImage || friend.avatar || '',

        roomId: roomId,
        gameType: gameType,
        status: 'pending',
        createdAt: serverTimestamp(),
      });

      Alert.alert(
        'Invite Sent',
        `Game Type ${gameType} invite sent to ${
          friend.name || friend.username || 'Player'
        }.`
      );
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

  const removeFriend = async (friend) => {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      Alert.alert('Login Required', 'Please login first.');
      return;
    }

    const friendId = friend.uid || friend.id;

    Alert.alert(
      'Remove Friend',
      `Remove ${
        friend.name || friend.username || 'this player'
      } from your friends?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(
                doc(db, 'users', currentUser.uid, 'friends', friendId)
              );

              await deleteDoc(
                doc(db, 'users', friendId, 'friends', currentUser.uid)
              );

              Alert.alert('Removed', 'Friend removed successfully.');
            } catch (error) {
              Alert.alert('Error', error.message);
            }
          },
        },
      ]
    );
  };

  const openUserProfile = (user) => {
    const userId = user.uid || user.id;

    if (!userId) {
      Alert.alert('Error', 'User profile could not be opened.');
      return;
    }

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

  const renderFriendRequest = (item) => (
    <View key={item.id} style={styles.requestCard}>
      <View style={styles.requestTopRow}>
        <View style={styles.userInfoRow}>
          <View style={styles.avatarWrapper}>
            <Image
              source={{ uri: item.fromProfileImage || DEFAULT_AVATAR }}
              style={styles.avatar}
            />
          </View>

          <View style={styles.userTextArea}>
            <Text style={styles.name} numberOfLines={1}>
              {item.fromName || item.fromUsername || 'Player'}
            </Text>

            <Text style={styles.secondaryText} numberOfLines={1}>
              {item.fromUsername ? `@${item.fromUsername}` : item.fromEmail}
            </Text>
          </View>
        </View>

        <View style={styles.pendingBadge}>
          <Ionicons name="time-outline" size={13} color="#FFD166" />
          <Text style={styles.pendingBadgeText}>Pending</Text>
        </View>
      </View>

      <View style={styles.requestButtons}>
        <TouchableOpacity
          style={styles.acceptButton}
          activeOpacity={0.85}
          onPress={() => acceptFriendRequest(item)}
        >
          <Ionicons name="checkmark" size={19} color="#002718" />
          <Text style={styles.acceptButtonText}>Accept</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.rejectButton}
          activeOpacity={0.85}
          onPress={() => rejectFriendRequest(item)}
        >
          <Ionicons name="close" size={19} color="#FFFFFF" />
          <Text style={styles.buttonText}>Reject</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderFriend = ({ item }) => (
    <View style={styles.friendCard}>
      <TouchableOpacity
        style={styles.friendProfileArea}
        activeOpacity={0.8}
        onPress={() => openUserProfile(item)}
      >
        <View style={styles.avatarWrapper}>
          <Image
            source={{ uri: getAvatarUri(item) }}
            style={styles.avatar}
          />

          <View
            style={[
              styles.onlineDot,
              item.online ? styles.onlineDotActive : styles.onlineDotInactive,
            ]}
          />
        </View>

        <View style={styles.userTextArea}>
          <Text style={styles.name} numberOfLines={1}>
            {getDisplayName(item)}
          </Text>

          <Text style={styles.secondaryText} numberOfLines={1}>
            {getSecondaryText(item)}
          </Text>

          <View style={styles.statusRow}>
            <View
              style={[
                styles.miniStatusDot,
                item.online
                  ? styles.miniStatusDotOnline
                  : styles.miniStatusDotOffline,
              ]}
            />
            <Text
              style={[
                styles.statusText,
                item.online
                  ? styles.statusTextOnline
                  : styles.statusTextOffline,
              ]}
            >
              {item.online ? 'Online' : 'Offline'}
            </Text>
          </View>
        </View>

        <Ionicons name="chevron-forward" size={20} color="#C0D9ED" />
      </TouchableOpacity>

      <View style={styles.cardDivider} />

      {inviteMode ? (
        <TouchableOpacity
          style={styles.fullInviteButton}
          activeOpacity={0.85}
          onPress={() => sendGameInvite(item)}
        >
          <Ionicons name="game-controller-outline" size={20} color="#001A33" />
          <Text style={styles.fullInviteButtonText}>Invite to Game</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.friendActions}>
          <TouchableOpacity
            style={styles.messageButton}
            activeOpacity={0.85}
            onPress={() =>
              navigation.navigate('Messages', {
                selectedFriend: item,
              })
            }
          >
            <Ionicons name="chatbubble-outline" size={19} color="#001A33" />
            <Text style={styles.messageButtonText}>Message</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.removeButton}
            activeOpacity={0.85}
            onPress={() => removeFriend(item)}
          >
            <Ionicons name="person-remove-outline" size={20} color="#FF7288" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderHeader = () => (
    <View>
      <View style={styles.headerRow}>
        <View style={styles.headerTextArea}>
          <Text style={styles.eyebrow}>TRIO COMMUNITY</Text>
          <Text style={styles.title}>
            {inviteMode ? 'Invite Friends' : 'Friends'}
          </Text>
          <Text style={styles.subtitle}>
            {inviteMode
              ? `Choose a friend for Game Type ${gameType}`
              : 'Find players, chat and grow your Trio circle.'}
          </Text>
        </View>

        <View style={styles.headerIconBox}>
          <Ionicons
            name={inviteMode ? 'game-controller' : 'people'}
            size={28}
            color="#00E5FF"
          />
          <Text style={styles.headerCount}>{friends.length}</Text>
        </View>
      </View>

      <View style={styles.searchContainer}>
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
            onPress={() => setSearch('')}
          >
            <Ionicons name="close-circle" size={20} color="#B5CEE4" />
          </TouchableOpacity>
        )}
      </View>

      {!inviteMode && (
        <>
          <View style={styles.addFriendPanel}>
            <View style={styles.panelHeaderRow}>
              <View style={styles.panelIconBox}>
                <Ionicons name="person-add" size={21} color="#00E5FF" />
              </View>

              <View style={styles.panelHeaderText}>
                <Text style={styles.panelTitle}>Add a new friend</Text>
                <Text style={styles.panelSubtitle}>
                  Search by exact email address or username.
                </Text>
              </View>
            </View>

            <View style={styles.addFriendBox}>
              <View style={styles.addFriendInputWrapper}>
                <Ionicons name="at" size={19} color="#D0E7F8" />
                <TextInput
                  style={styles.addFriendInput}
                  placeholder="Email or username"
                  placeholderTextColor="#B5CEE4"
                  value={addFriendText}
                  onChangeText={(text) => {
                    setAddFriendText(text);
                    setSearchedUser(null);
                    setRequestSent(false);
                  }}
                  onSubmitEditing={handleAddFriend}
                  returnKeyType="search"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <TouchableOpacity
                style={styles.smallAddButton}
                activeOpacity={0.85}
                onPress={handleAddFriend}
              >
                <Ionicons name="search" size={20} color="#001A33" />
              </TouchableOpacity>
            </View>
          </View>

          {searchedUser && (
            <View style={styles.searchedUserCard}>
              <TouchableOpacity
                style={styles.searchedUserProfile}
                activeOpacity={0.8}
                onPress={() => openUserProfile(searchedUser)}
              >
                <View style={styles.avatarWrapper}>
                  <Image
                    source={{ uri: getAvatarUri(searchedUser) }}
                    style={styles.avatar}
                  />
                </View>

                <View style={styles.userTextArea}>
                  <Text style={styles.name} numberOfLines={1}>
                    {getDisplayName(searchedUser)}
                  </Text>
                  <Text style={styles.secondaryText} numberOfLines={1}>
                    {getSecondaryText(searchedUser)}
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.addResultButton,
                  requestSent && styles.requestedButton,
                ]}
                disabled={requestSent}
                activeOpacity={0.85}
                onPress={() => sendFriendRequest(searchedUser)}
              >
                <Ionicons
                  name={requestSent ? 'checkmark' : 'person-add-outline'}
                  size={18}
                  color={requestSent ? '#D9E5F1' : '#001A33'}
                />
                <Text
                  style={[
                    styles.addResultButtonText,
                    requestSent && styles.requestedButtonText,
                  ]}
                >
                  {requestSent ? 'Requested' : 'Add'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {friendRequests.length > 0 && (
            <View style={styles.requestsSection}>
              <View style={styles.sectionHeaderRow}>
                <View>
                  <Text style={styles.sectionTitle}>Friend Requests</Text>
                  <Text style={styles.sectionSubtitle}>
                    Players waiting for your response
                  </Text>
                </View>

                <View style={styles.sectionCountBadge}>
                  <Text style={styles.sectionCountText}>
                    {friendRequests.length}
                  </Text>
                </View>
              </View>

              {friendRequests.map(renderFriendRequest)}
            </View>
          )}
        </>
      )}

      <View style={styles.friendsSectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>
            {inviteMode ? 'Select a Friend' : 'My Friends'}
          </Text>
          <Text style={styles.sectionSubtitle}>
            {search
              ? `${filteredFriends.length} matching player${
                  filteredFriends.length === 1 ? '' : 's'
                }`
              : `${friends.length} friend${friends.length === 1 ? '' : 's'}`}
          </Text>
        </View>

        <View style={styles.friendsIconBox}>
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

      <View pointerEvents="none" style={styles.backgroundShade} />

      <View pointerEvents="none" style={styles.glowTop} />
      <View pointerEvents="none" style={styles.glowBottom} />

      <View pointerEvents="none" style={styles.backgroundLogoHalo} />
      <Image
        pointerEvents="none"
        source={require('../assets/trio-logo.png')}
        resizeMode="contain"
        fadeDuration={0}
        style={styles.backgroundLogo}
      />

      <SafeAreaView style={styles.safeArea}>
        <FlatList
          data={filteredFriends}
          keyExtractor={(item) => item.id || item.uid}
          renderItem={renderFriend}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <View style={styles.emptyIconBox}>
                <Ionicons
                  name={search ? 'search-outline' : 'people-outline'}
                  size={34}
                  color="#00E5FF"
                />
              </View>

              <Text style={styles.emptyTitle}>
                {search ? 'No matching friends' : 'No friends yet'}
              </Text>

              <Text style={styles.emptyText}>
                {search
                  ? 'Try searching with another name, username or email.'
                  : inviteMode
                  ? 'You need to add friends before sending a game invite.'
                  : 'Use the search box above to find your first Trio friend.'}
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

  backgroundLogoHalo: {
    position: 'absolute',
    top: 92,
    left: '12%',
    width: '76%',
    height: 330,
    borderRadius: 180,
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    zIndex: 1,
  },

  backgroundLogo: {
    position: 'absolute',
    top: 72,
    left: '4%',
    width: '92%',
    height: 370,
    opacity: 0.34,
    zIndex: 2,
  },

  backgroundShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 10, 34, 0.08)',
    zIndex: 0,
  },


  listContent: {
    paddingHorizontal: 18,
    paddingTop: 18,
  },

  glowTop: {
    position: 'absolute',
    top: -110,
    right: -90,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
  },

  glowBottom: {
    position: 'absolute',
    bottom: 40,
    left: -120,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(0, 229, 255, 0.10)',
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 22,
  },

  headerTextArea: {
    flex: 1,
    paddingRight: 16,
  },

  eyebrow: {
    color: '#00E5FF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.7,
    marginBottom: 6,
  },

  title: {
    color: '#FFFFFF',
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '800',
    letterSpacing: -0.8,
  },

  subtitle: {
    color: '#D8E8F7',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
  },

  headerIconBox: {
    width: 66,
    height: 66,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 229, 255, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.28)',
  },

  headerCount: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    marginTop: 2,
  },

  searchContainer: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 28, 78, 0.72)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.20)',
    paddingHorizontal: 16,
    marginBottom: 16,
  },

  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 15,
    paddingHorizontal: 12,
    paddingVertical: 0,
  },

  clearButton: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },

  addFriendPanel: {
    backgroundColor: 'rgba(0, 31, 88, 0.76)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.20)',
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 18,
    elevation: 5,
  },

  panelHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },

  panelIconBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 229, 255, 0.18)',
    marginRight: 11,
  },

  panelHeaderText: {
    flex: 1,
  },

  panelTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  panelSubtitle: {
    color: '#C2D7EA',
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2,
  },

  addFriendBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  addFriendInputWrapper: {
    flex: 1,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 20, 62, 0.76)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    paddingHorizontal: 14,
    marginRight: 10,
  },

  addFriendInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
    paddingHorizontal: 10,
    paddingVertical: 0,
  },

  smallAddButton: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: '#00E5FF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00E5FF',
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 4,
  },

  searchedUserCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 48, 112, 0.80)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.28)',
    padding: 13,
    marginBottom: 18,
  },

  searchedUserProfile: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },

  addResultButton: {
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00E5FF',
    borderRadius: 13,
    paddingHorizontal: 13,
    marginLeft: 10,
  },

  addResultButtonText: {
    color: '#001A33',
    fontSize: 13,
    fontWeight: '800',
    marginLeft: 6,
  },

  requestedButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.20)',
  },

  requestedButtonText: {
    color: '#D9E5F1',
  },

  requestsSection: {
    marginTop: 4,
    marginBottom: 8,
  },

  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: -0.25,
  },

  sectionSubtitle: {
    color: '#B5CEE4',
    fontSize: 12,
    marginTop: 3,
  },

  sectionCountBadge: {
    minWidth: 30,
    height: 30,
    paddingHorizontal: 9,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 209, 102, 0.13)',
    borderWidth: 1,
    borderColor: 'rgba(255, 209, 102, 0.22)',
  },

  sectionCountText: {
    color: '#FFD166',
    fontSize: 13,
    fontWeight: '800',
  },

  requestCard: {
    backgroundColor: 'rgba(0, 27, 76, 0.82)',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
    padding: 15,
    marginBottom: 12,
  },

  requestTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  userInfoRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 10,
  },

  pendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 209, 102, 0.1)',
    borderRadius: 11,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },

  pendingBadgeText: {
    color: '#FFD166',
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 4,
  },

  requestButtons: {
    flexDirection: 'row',
    marginTop: 15,
  },

  acceptButton: {
    flex: 1,
    height: 43,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00FF88',
    borderRadius: 14,
    marginRight: 7,
  },

  rejectButton: {
    flex: 1,
    height: 43,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 100, 124, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 100, 124, 0.28)',
    borderRadius: 14,
    marginLeft: 7,
  },

  acceptButtonText: {
    color: '#002718',
    fontSize: 13,
    fontWeight: '800',
    marginLeft: 6,
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    marginLeft: 6,
  },

  friendsSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    marginBottom: 13,
  },

  friendsIconBox: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 229, 255, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
  },

  friendCard: {
    backgroundColor: 'rgba(0, 27, 76, 0.82)',
    borderRadius: 23,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
    padding: 15,
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 15,
    elevation: 4,
  },

  friendProfileArea: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatarWrapper: {
    position: 'relative',
    marginRight: 12,
  },

  avatar: {
    width: 56,
    height: 56,
    borderRadius: 19,
    backgroundColor: '#00458A',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },

  onlineDot: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: '#003269',
  },

  onlineDotActive: {
    backgroundColor: '#00FF88',
  },

  onlineDotInactive: {
    backgroundColor: '#8CA0B8',
  },

  userTextArea: {
    flex: 1,
    minWidth: 0,
  },

  name: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.2,
  },

  secondaryText: {
    color: '#D8E8F7',
    fontSize: 12,
    marginTop: 3,
  },

  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },

  miniStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },

  miniStatusDotOnline: {
    backgroundColor: '#00FF88',
  },

  miniStatusDotOffline: {
    backgroundColor: '#8CA0B8',
  },

  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },

  statusTextOnline: {
    color: '#00FF88',
  },

  statusTextOffline: {
    color: '#B5C8DD',
  },

  cardDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    marginVertical: 14,
  },

  friendActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  messageButton: {
    flex: 1,
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00E5FF',
    borderRadius: 14,
    marginRight: 10,
  },

  messageButtonText: {
    color: '#001A33',
    fontSize: 13,
    fontWeight: '800',
    marginLeft: 7,
  },

  removeButton: {
    width: 46,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 100, 124, 0.1)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 100, 124, 0.2)',
  },

  fullInviteButton: {
    height: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00FF88',
    borderRadius: 15,
  },

  fullInviteButtonText: {
    color: '#001A33',
    fontSize: 14,
    fontWeight: '800',
    marginLeft: 8,
  },

  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 27, 76, 0.70)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
    paddingHorizontal: 30,
    paddingVertical: 34,
  },

  emptyIconBox: {
    width: 72,
    height: 72,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 229, 255, 0.16)',
    marginBottom: 15,
  },

  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },

  emptyText: {
    color: '#C4D5E7',
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    marginTop: 7,
  },

  footerSpace: {
    height: 32,
  },
});