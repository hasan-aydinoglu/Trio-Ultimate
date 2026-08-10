import React, {
  useEffect,
  useState,
} from 'react';

import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';

import {
  LinearGradient,
} from 'expo-linear-gradient';

import {
  Ionicons,
} from '@expo/vector-icons';

import {
  auth,
  db,
} from '../firebase';

import {
  doc,
  collection,
  onSnapshot,
  getDoc,
  getDocs,
  addDoc,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';

export default function UserProfileScreen({
  navigation,
  route,
}) {
  const routeUser =
    route.params?.user || {};

  const userId =
    route.params?.userId ||
    route.params?.uid ||
    route.params?.profileUserId ||
    route.params?.selectedUserId ||
    routeUser.uid ||
    routeUser.userId ||
    routeUser.id;

  const [
    profileUser,
    setProfileUser,
  ] = useState(routeUser);

  const [
    friendsCount,
    setFriendsCount,
  ] = useState(0);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    friendshipStatus,
    setFriendshipStatus,
  ] = useState('loading');

  const [
    sendingRequest,
    setSendingRequest,
  ] = useState(false);

  const currentUser =
    auth.currentUser;

  const isOwnProfile =
    currentUser?.uid === userId;

  /*
   * Rakibin profil bilgilerini
   * Firestore'dan gerçek zamanlı getir.
   */
  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return undefined;
    }

    const unsubscribeProfile =
      onSnapshot(
        doc(
          db,
          'users',
          userId
        ),
        (snapshot) => {
          if (snapshot.exists()) {
            setProfileUser({
              id:
                snapshot.id,

              uid:
                snapshot.id,

              userId:
                snapshot.id,

              ...snapshot.data(),
            });
          }

          setLoading(false);
        },
        (error) => {
          console.log(
            'User profile error:',
            error
          );

          setLoading(false);
        }
      );

    const unsubscribeFriends =
      onSnapshot(
        collection(
          db,
          'users',
          userId,
          'friends'
        ),
        (snapshot) => {
          setFriendsCount(
            snapshot.size
          );
        },
        (error) => {
          console.log(
            'Friends count error:',
            error
          );
        }
      );

    return () => {
      unsubscribeProfile();
      unsubscribeFriends();
    };
  }, [userId]);

  /*
   * Bu oyuncu zaten arkadaşımız mı?
   *
   * users/{myUid}/friends/{opponentUid}
   * dokümanını gerçek zamanlı takip eder.
   */
  useEffect(() => {
    const loggedUser =
      auth.currentUser;

    if (
      !loggedUser ||
      !userId
    ) {
      setFriendshipStatus(
        'none'
      );

      return undefined;
    }

    if (
      loggedUser.uid ===
      userId
    ) {
      setFriendshipStatus(
        'self'
      );

      return undefined;
    }

    const friendRef =
      doc(
        db,
        'users',
        loggedUser.uid,
        'friends',
        userId
      );

    const unsubscribeFriend =
      onSnapshot(
        friendRef,
        (snapshot) => {
          if (
            snapshot.exists()
          ) {
            setFriendshipStatus(
              'friends'
            );
          } else {
            setFriendshipStatus(
              (currentStatus) =>
                currentStatus ===
                'requested'
                  ? 'requested'
                  : 'none'
            );
          }
        },
        (error) => {
          console.log(
            'Friend status error:',
            error
          );

          setFriendshipStatus(
            'none'
          );
        }
      );

    return () =>
      unsubscribeFriend();
  }, [userId]);

  /*
   * Daha önce bu oyuncuya gönderilmiş
   * bekleyen arkadaşlık isteği var mı?
   */
  useEffect(() => {
    const loggedUser =
      auth.currentUser;

    if (
      !loggedUser ||
      !userId ||
      loggedUser.uid === userId
    ) {
      return undefined;
    }

    const requestQuery =
      query(
        collection(
          db,
          'friendRequests'
        ),

        where(
          'fromUserId',
          '==',
          loggedUser.uid
        ),

        where(
          'toUserId',
          '==',
          userId
        ),

        where(
          'status',
          '==',
          'pending'
        )
      );

    const unsubscribeRequest =
      onSnapshot(
        requestQuery,
        (snapshot) => {
          if (
            !snapshot.empty
          ) {
            setFriendshipStatus(
              'requested'
            );
          } else {
            setFriendshipStatus(
              (currentStatus) => {
                if (
                  currentStatus ===
                  'friends'
                ) {
                  return 'friends';
                }

                return 'none';
              }
            );
          }
        },
        (error) => {
          console.log(
            'Friend request status error:',
            error
          );
        }
      );

    return () =>
      unsubscribeRequest();
  }, [userId]);

  /*
   * Arkadaşlık isteği gönderir.
   *
   * Friends ekranındaki mevcut
   * friendRequests yapısıyla aynıdır.
   */
  const sendFriendRequest =
    async () => {
      const loggedUser =
        auth.currentUser;

      if (!loggedUser) {
        Alert.alert(
          'Login Required',
          'Please login first.'
        );

        return;
      }

      if (!userId) {
        Alert.alert(
          'Error',
          'User could not be found.'
        );

        return;
      }

      if (
        loggedUser.uid === userId
      ) {
        Alert.alert(
          'Error',
          'You cannot add yourself.'
        );

        return;
      }

      if (
        friendshipStatus ===
        'friends'
      ) {
        Alert.alert(
          'Already Friends',
          'This player is already your friend.'
        );

        return;
      }

      if (
        friendshipStatus ===
        'requested'
      ) {
        Alert.alert(
          'Already Sent',
          'Friend request already sent.'
        );

        return;
      }

      try {
        setSendingRequest(true);

        /*
         * Tekrar kontrol:
         * Kullanıcı zaten arkadaş mı?
         */
        const friendSnapshot =
          await getDoc(
            doc(
              db,
              'users',
              loggedUser.uid,
              'friends',
              userId
            )
          );

        if (
          friendSnapshot.exists()
        ) {
          setFriendshipStatus(
            'friends'
          );

          Alert.alert(
            'Already Friends',
            'This player is already your friend.'
          );

          return;
        }

        /*
         * Tekrar kontrol:
         * Daha önce istek gönderilmiş mi?
         */
        const existingRequestQuery =
          query(
            collection(
              db,
              'friendRequests'
            ),

            where(
              'fromUserId',
              '==',
              loggedUser.uid
            ),

            where(
              'toUserId',
              '==',
              userId
            ),

            where(
              'status',
              '==',
              'pending'
            )
          );

        const existingRequestSnapshot =
          await getDocs(
            existingRequestQuery
          );

        if (
          !existingRequestSnapshot.empty
        ) {
          setFriendshipStatus(
            'requested'
          );

          Alert.alert(
            'Already Sent',
            'Friend request already sent.'
          );

          return;
        }

        /*
         * Kendi profil bilgilerimizi al.
         */
        const currentUserSnapshot =
          await getDoc(
            doc(
              db,
              'users',
              loggedUser.uid
            )
          );

        const currentUserData =
          currentUserSnapshot.exists()
            ? currentUserSnapshot.data()
            : {};

        /*
         * Mevcut Friends sistemiyle
         * aynı formatta friendRequest oluştur.
         */
        await addDoc(
          collection(
            db,
            'friendRequests'
          ),
          {
            fromUserId:
              loggedUser.uid,

            fromName:
              currentUserData.name ||
              currentUserData.fullName ||
              '',

            fromUsername:
              currentUserData.username ||
              '',

            fromEmail:
              loggedUser.email ||
              currentUserData.email ||
              '',

            fromProfileImage:
              currentUserData.profileImage ||
              currentUserData.avatar ||
              currentUserData.photoURL ||
              '',

            toUserId:
              userId,

            toName:
              profileUser.name ||
              profileUser.fullName ||
              '',

            toUsername:
              profileUser.username ||
              '',

            toEmail:
              profileUser.email ||
              '',

            toProfileImage:
              profileUser.profileImage ||
              profileUser.avatar ||
              profileUser.photoURL ||
              profileUser.photo ||
              '',

            status:
              'pending',

            createdAt:
              serverTimestamp(),
          }
        );

        setFriendshipStatus(
          'requested'
        );

        Alert.alert(
          'Request Sent',
          `Friend request sent to ${
            profileUser.name ||
            profileUser.username ||
            'Player'
          }.`
        );
      } catch (error) {
        console.log(
          'Send friend request error:',
          error
        );

        Alert.alert(
          'Error',
          error.message ||
            'Friend request could not be sent.'
        );
      } finally {
        setSendingRequest(false);
      }
    };

  const avatarUri =
    profileUser.profileImage ||
    profileUser.photoURL ||
    profileUser.photo ||
    profileUser.image ||
    profileUser.avatar ||
    'https://i.pravatar.cc/150?img=1';

  const gamesPlayed =
    Number(
      profileUser.gamesPlayed ??
        profileUser.totalGames ??
        profileUser.games ??
        0
    );

  const wins =
    Number(
      profileUser.wins ??
        profileUser.totalWins ??
        profileUser.gamesWon ??
        0
    );

  /*
   * Arkadaşlık butonunun
   * görünüşünü belirler.
   */
  const renderFriendButton =
    () => {
      if (
        isOwnProfile ||
        friendshipStatus ===
          'self'
      ) {
        return null;
      }

      if (
        friendshipStatus ===
        'loading'
      ) {
        return (
          <View
            style={[
              styles.friendButton,
              styles.friendButtonLoading,
            ]}
          >
            <ActivityIndicator
              size="small"
              color="#FFFFFF"
            />
          </View>
        );
      }

      if (
        friendshipStatus ===
        'friends'
      ) {
        return (
          <View
            style={[
              styles.friendButton,
              styles.friendsButton,
            ]}
          >
            <Ionicons
              name="checkmark-circle"
              size={20}
              color="#FFFFFF"
            />

            <Text
              style={
                styles.friendButtonText
              }
            >
              Friends
            </Text>
          </View>
        );
      }

      if (
        friendshipStatus ===
        'requested'
      ) {
        return (
          <View
            style={[
              styles.friendButton,
              styles.requestedButton,
            ]}
          >
            <Ionicons
              name="time-outline"
              size={20}
              color="#FFFFFF"
            />

            <Text
              style={
                styles.friendButtonText
              }
            >
              Requested
            </Text>
          </View>
        );
      }

      return (
        <TouchableOpacity
          style={[
            styles.friendButton,
            styles.addFriendButton,
          ]}
          onPress={
            sendFriendRequest
          }
          activeOpacity={0.85}
          disabled={
            sendingRequest
          }
        >
          {sendingRequest ? (
            <ActivityIndicator
              size="small"
              color="#FFFFFF"
            />
          ) : (
            <>
              <Ionicons
                name="person-add"
                size={20}
                color="#FFFFFF"
              />

              <Text
                style={
                  styles.friendButtonText
                }
              >
                Add Friend
              </Text>
            </>
          )}
        </TouchableOpacity>
      );
    };

  if (loading) {
    return (
      <LinearGradient
        colors={[
          '#00c6ff',
          '#0072ff',
          '#000',
        ]}
        style={
          styles.loadingContainer
        }
      >
        <ActivityIndicator
          size="large"
          color="#FFFFFF"
        />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={[
        '#00c6ff',
        '#0072ff',
        '#000',
      ]}
      style={
        styles.container
      }
    >
      <TouchableOpacity
        style={
          styles.backButton
        }
        onPress={() =>
          navigation.goBack()
        }
        activeOpacity={0.8}
      >
        <Ionicons
          name="arrow-back"
          size={30}
          color="#FFFFFF"
        />
      </TouchableOpacity>

      <Image
        source={{
          uri: avatarUri,
        }}
        style={
          styles.bigAvatar
        }
      />

      <Text
        style={
          styles.name
        }
      >
        {`${profileUser.name || 'Player'} ${
          profileUser.surname || ''
        }`.trim()}
      </Text>

      <Text
        style={
          styles.username
        }
      >
        {profileUser.username
          ? `@${profileUser.username.replace(
              '@',
              ''
            )}`
          : profileUser.email ||
            '@player'}
      </Text>

      {renderFriendButton()}

      <View
        style={
          styles.statsContainer
        }
      >
        <View
          style={
            styles.statBox
          }
        >
          <Ionicons
            name="people"
            size={25}
            color="#00e5ff"
          />

          <Text
            style={
              styles.statNumber
            }
          >
            {friendsCount}
          </Text>

          <Text
            style={
              styles.statLabel
            }
          >
            Friends
          </Text>
        </View>

        <View
          style={
            styles.statDivider
          }
        />

        <View
          style={
            styles.statBox
          }
        >
          <Ionicons
            name="game-controller"
            size={25}
            color="#ffd166"
          />

          <Text
            style={
              styles.statNumber
            }
          >
            {gamesPlayed}
          </Text>

          <Text
            style={
              styles.statLabel
            }
          >
            Games
          </Text>
        </View>

        <View
          style={
            styles.statDivider
          }
        />

        <View
          style={
            styles.statBox
          }
        >
          <Ionicons
            name="trophy"
            size={25}
            color="#00ff88"
          />

          <Text
            style={
              styles.statNumber
            }
          >
            {wins}
          </Text>

          <Text
            style={
              styles.statLabel
            }
          >
            Wins
          </Text>
        </View>
      </View>

      <Text
        style={
          styles.infoText
        }
      >
        Status:{' '}
        {profileUser.online
          ? 'Online'
          : 'Offline'}
      </Text>

      <Text
        style={
          styles.infoText
        }
      >
        Email:{' '}
        {profileUser.email ||
          'No email'}
      </Text>

      <Text
        style={
          styles.infoText
        }
      >
        Bio:{' '}
        {profileUser.bio ||
          'No bio yet'}
      </Text>

      {!isOwnProfile && (
        <TouchableOpacity
          style={
            styles.messageButton
          }
          activeOpacity={0.85}
          onPress={() =>
            navigation.navigate(
              'ChatScreen',
              {
                conversation: {
                  ...profileUser,
                  id:
                    userId,
                  uid:
                    userId,
                  userId:
                    userId,
                },
              }
            )
          }
        >
          <Ionicons
            name="chatbubble-ellipses"
            size={19}
            color="#FFFFFF"
          />

          <Text
            style={
              styles.buttonText
            }
          >
            Message
          </Text>
        </TouchableOpacity>
      )}
    </LinearGradient>
  );
}

const styles =
  StyleSheet.create({
    loadingContainer: {
      flex: 1,
      justifyContent:
        'center',
      alignItems:
        'center',
    },

    container: {
      flex: 1,
      alignItems:
        'center',
      paddingTop: 70,
      paddingHorizontal: 20,
    },

    backButton: {
      position:
        'absolute',

      top: 55,
      left: 18,

      zIndex: 10,

      width: 44,
      height: 44,

      borderRadius: 22,

      justifyContent:
        'center',

      alignItems:
        'center',

      backgroundColor:
        'rgba(0,0,0,0.18)',
    },

    bigAvatar: {
      width: 190,
      height: 190,

      borderRadius: 95,

      borderWidth: 4,

      borderColor:
        '#FFFFFF',

      marginBottom: 25,
    },

    name: {
      color:
        '#FFFFFF',

      fontSize: 30,

      fontWeight:
        'bold',

      textAlign:
        'center',
    },

    username: {
      color:
        '#B8EAFF',

      fontSize: 17,

      marginTop: 5,

      marginBottom: 18,
    },

    friendButton: {
      minWidth: 165,

      height: 48,

      borderRadius: 24,

      flexDirection:
        'row',

      alignItems:
        'center',

      justifyContent:
        'center',

      paddingHorizontal: 24,

      marginBottom: 22,

      gap: 8,

      shadowColor:
        '#000',

      shadowOffset: {
        width: 0,
        height: 5,
      },

      shadowOpacity: 0.2,

      shadowRadius: 8,

      elevation: 6,
    },

    addFriendButton: {
      backgroundColor:
        '#1769FF',
    },

    requestedButton: {
      backgroundColor:
        'rgba(255,255,255,0.22)',

      borderWidth: 1,

      borderColor:
        'rgba(255,255,255,0.35)',
    },

    friendsButton: {
      backgroundColor:
        '#12B981',
    },

    friendButtonLoading: {
      backgroundColor:
        'rgba(255,255,255,0.18)',
    },

    friendButtonText: {
      color:
        '#FFFFFF',

      fontSize: 16,

      fontWeight:
        '800',
    },

    statsContainer: {
      width: '100%',

      flexDirection:
        'row',

      alignItems:
        'center',

      backgroundColor:
        'rgba(255,255,255,0.15)',

      borderRadius: 18,

      paddingVertical: 17,

      marginBottom: 22,
    },

    statBox: {
      flex: 1,

      alignItems:
        'center',
    },

    statNumber: {
      color:
        '#FFFFFF',

      fontSize: 22,

      fontWeight:
        'bold',

      marginTop: 5,
    },

    statLabel: {
      color:
        '#DDDDDD',

      fontSize: 13,

      marginTop: 2,
    },

    statDivider: {
      width: 1,

      height: 50,

      backgroundColor:
        'rgba(255,255,255,0.3)',
    },

    infoText: {
      width: '100%',

      color:
        '#FFFFFF',

      fontSize: 16,

      marginBottom: 12,

      backgroundColor:
        'rgba(255,255,255,0.15)',

      padding: 14,

      borderRadius: 14,
    },

    messageButton: {
      marginTop: 16,

      backgroundColor:
        '#1ABC9C',

      minWidth: 165,

      height: 48,

      borderRadius: 24,

      flexDirection:
        'row',

      justifyContent:
        'center',

      alignItems:
        'center',

      gap: 8,
    },

    buttonText: {
      color:
        '#FFFFFF',

      fontSize: 17,

      fontWeight:
        'bold',
    },
  });