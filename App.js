import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';

import {
  View,
  Text,
  Image,
  StyleSheet,
  Platform,
  Animated,
  Easing,
  StatusBar,
} from 'react-native';

import {
  NavigationContainer,
  createNavigationContainerRef,
} from '@react-navigation/native';

import {
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';

import {
  createNativeStackNavigator,
} from '@react-navigation/native-stack';

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

import { auth, db } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';

import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  getDoc,
  updateDoc,
} from 'firebase/firestore';

import Home from './screens/home';
import GameScreen from './screens/GameScreen';
import GameModeScreen from './screens/GameModeScreen';
import Profile from './screens/profile';
import Settings from './screens/settings';
import MainMenu from './screens/MainMenu';
import Friends from './screens/Friends';
import Messages from './screens/Messages';
import SplashIntro from './screens/SplashIntro';
import EditProfile from './screens/EditProfile';
import PrivacyScreen from './screens/PrivacyScreen';
import ContactUsScreen from './screens/ContactUsScreen';
import GameScreen2 from './screens/GameScreen2';
import GameScreen3 from './screens/GameScreen3';
import GameScreen4 from './screens/GameScreen4';
import GameScreen5 from './screens/GameScreen5';
import SignUp from './screens/SignUp';
import OnlineLobbyScreen from './screens/OnlineLobbyScreen';
import OnlineRoomSetupScreen from './screens/OnlineRoomSetupScreen';
import ChatScreen from './screens/ChatScreen';
import UserProfileScreen from './screens/UserProfileScreen';
import Notifications from './screens/Notifications';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const navigationRef = createNavigationContainerRef();

/*
 * Firestore'dan oyuncunun gerçek adını ve
 * profil fotoğrafını getirir.
 */
const getUserGameProfile = async (
  userId,
  playerId
) => {
  try {
    if (!userId) {
      return {
        id: playerId,
        uid: null,
        name: `Player ${playerId}`,
        photo: null,
        image: null,
        avatar: null,
      };
    }

    const userRef = doc(
      db,
      'users',
      userId
    );

    const userSnapshot = await getDoc(
      userRef
    );

    if (!userSnapshot.exists()) {
      return {
        id: playerId,
        uid: userId,
        name: `Player ${playerId}`,
        photo: null,
        image: null,
        avatar: null,
      };
    }

    const userData = userSnapshot.data();

    const playerName =
      userData.username ||
      userData.name ||
      userData.fullName ||
      userData.displayName ||
      userData.email ||
      `Player ${playerId}`;

    const playerPhoto =
      userData.profileImage ||
      userData.photoURL ||
      userData.image ||
      userData.avatar ||
      userData.avatarUrl ||
      userData.profilePhoto ||
      null;

    return {
      id: playerId,
      uid: userId,
      name: playerName,
      photo: playerPhoto,
      image: playerPhoto,
      avatar: playerPhoto,
    };
  } catch (error) {
    console.log(
      'Game player profile load error:',
      error
    );

    return {
      id: playerId,
      uid: userId,
      name: `Player ${playerId}`,
      photo: null,
      image: null,
      avatar: null,
    };
  }
};

SplashScreen.preventAutoHideAsync();

function TabNavigator({
  unreadMessageCount,
  friendRequestCount,
  gameInviteCount,
}) {
  return (
    <Tab.Navigator
      initialRouteName="GameMode"
      screenOptions={({ route }) => ({
        headerShown: false,

        animation: 'fade',

        tabBarIcon: ({
          focused,
          color,
        }) => {
          let iconName = 'ellipse';

          if (route.name === 'GameMode') {
            iconName = 'game-controller';
          } else if (
            route.name === 'Messages'
          ) {
            iconName =
              'chatbubble-ellipses';
          } else if (
            route.name === 'Friends'
          ) {
            iconName = 'people';
          } else if (
            route.name === 'Profile'
          ) {
            iconName = 'person-circle';
          } else if (
            route.name === 'Settings'
          ) {
            iconName = 'settings';
          }

          if (focused) {
            return (
              <LinearGradient
                colors={[
                  '#00c6ff',
                  '#0072ff',
                ]}
                style={
                  styles.activeIconBox
                }
              >
                <Ionicons
                  name={iconName}
                  size={23}
                  color="#fff"
                />
              </LinearGradient>
            );
          }

          return (
            <View
              style={
                styles.inactiveIconBox
              }
            >
              <Ionicons
                name={iconName}
                size={22}
                color={color}
              />
            </View>
          );
        },

        tabBarActiveTintColor:
          '#ffffff',

        tabBarInactiveTintColor:
          '#8A94A6',

        tabBarStyle: styles.tabBar,

        tabBarItemStyle:
          styles.tabBarItem,

        tabBarLabelStyle:
          styles.tabBarLabel,

        tabBarBadgeStyle:
          styles.badge,
      })}
    >
      <Tab.Screen
        name="GameMode"
        component={GameModeScreen}
        options={{
          title: 'Game',

          tabBarBadge:
            gameInviteCount > 0
              ? gameInviteCount
              : undefined,
        }}
      />

      <Tab.Screen
        name="Messages"
        component={Messages}
        options={{
          title: 'Messages',

          tabBarBadge:
            unreadMessageCount > 0
              ? unreadMessageCount
              : undefined,
        }}
      />

      <Tab.Screen
        name="Friends"
        component={Friends}
        options={{
          title: 'Friends',

          tabBarBadge:
            friendRequestCount > 0
              ? friendRequestCount
              : undefined,
        }}
      />

      <Tab.Screen
        name="Profile"
        component={Profile}
      />

      <Tab.Screen
        name="Settings"
        component={Settings}
      />
    </Tab.Navigator>
  );
}


function TrioAnimatedIntro() {
  const logoOpacity =
    useRef(new Animated.Value(0)).current;

  const logoScale =
    useRef(new Animated.Value(0.55)).current;

  const logoTranslateY =
    useRef(new Animated.Value(28)).current;

  const glowOpacity =
    useRef(new Animated.Value(0)).current;

  const glowScale =
    useRef(new Animated.Value(0.6)).current;

  const textOpacity =
    useRef(new Animated.Value(0)).current;

  const textTranslateY =
    useRef(new Animated.Value(14)).current;

  const flashOpacity =
    useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.sequence([
      Animated.parallel([
        Animated.timing(
          glowOpacity,
          {
            toValue: 0.85,
            duration: 300,
            useNativeDriver: true,
          }
        ),

        Animated.timing(
          glowScale,
          {
            toValue: 1.15,
            duration: 900,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }
        ),

        Animated.timing(
          logoOpacity,
          {
            toValue: 1,
            duration: 360,
            useNativeDriver: true,
          }
        ),

        Animated.timing(
          logoTranslateY,
          {
            toValue: 0,
            duration: 620,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }
        ),

        Animated.spring(
          logoScale,
          {
            toValue: 1,
            friction: 5,
            tension: 55,
            useNativeDriver: true,
          }
        ),
      ]),

      Animated.parallel([
        Animated.timing(
          textOpacity,
          {
            toValue: 1,
            duration: 420,
            useNativeDriver: true,
          }
        ),

        Animated.timing(
          textTranslateY,
          {
            toValue: 0,
            duration: 420,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }
        ),

        Animated.sequence([
          Animated.timing(
            flashOpacity,
            {
              toValue: 0.8,
              duration: 160,
              useNativeDriver: true,
            }
          ),

          Animated.timing(
            flashOpacity,
            {
              toValue: 0,
              duration: 500,
              useNativeDriver: true,
            }
          ),
        ]),
      ]),
    ]);

    animation.start();

    return () => {
      animation.stop();
    };
  }, [
    flashOpacity,
    glowOpacity,
    glowScale,
    logoOpacity,
    logoScale,
    logoTranslateY,
    textOpacity,
    textTranslateY,
  ]);

  return (
    <LinearGradient
      colors={[
        '#071C4C',
        '#043A8D',
        '#006FEA',
        '#021A45',
        '#00040D',
      ]}
      locations={[
        0,
        0.25,
        0.48,
        0.74,
        1,
      ]}
      style={styles.introContainer}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor="#071C4C"
      />

      <View
        pointerEvents="none"
        style={styles.introTopGlow}
      />

      <View
        pointerEvents="none"
        style={styles.introBottomGlow}
      />

      <Animated.View
        pointerEvents="none"
        style={[
          styles.introGlow,
          {
            opacity: glowOpacity,
            transform: [
              {
                scale: glowScale,
              },
            ],
          },
        ]}
      />

      <Animated.View
        style={[
          styles.introLogoContainer,
          {
            opacity: logoOpacity,
            transform: [
              {
                translateY:
                  logoTranslateY,
              },
              {
                scale:
                  logoScale,
              },
            ],
          },
        ]}
      >
        <Image
          source={require('./assets/trio-logo.png')}
          style={styles.introLogo}
          resizeMode="cover"
        />
      </Animated.View>

      <Animated.View
        style={[
          styles.introFlash,
          {
            opacity:
              flashOpacity,
          },
        ]}
      />

      <Animated.View
        style={[
          styles.introTextArea,
          {
            opacity:
              textOpacity,

            transform: [
              {
                translateY:
                  textTranslateY,
              },
            ],
          },
        ]}
      >
        <Text style={styles.introTagline}>
          THINK • CALCULATE • WIN
        </Text>

        <Text style={styles.introSubtext}>
          TRIO
        </Text>
      </Animated.View>

      <View style={styles.introLoading}>
        <View
          style={[
            styles.introDot,
            styles.introDotActive,
          ]}
        />

        <View style={styles.introDot} />
        <View style={styles.introDot} />
      </View>
    </LinearGradient>
  );
}

export default function App() {
  const [
    appIsReady,
    setAppIsReady,
  ] = useState(false);

  const [
    showIntro,
    setShowIntro,
  ] = useState(true);

  const [
    currentUserId,
    setCurrentUserId,
  ] = useState(null);

  const [
    unreadMessageCount,
    setUnreadMessageCount,
  ] = useState(0);

  const [
    friendRequestCount,
    setFriendRequestCount,
  ] = useState(0);

  const [
    gameInviteCount,
    setGameInviteCount,
  ] = useState(0);

  const processedAcceptedInvites =
    useRef({});

  useEffect(() => {
    async function prepare() {
      try {
        await Font.loadAsync({
          pacifico: require(
            './assets/fonts/Pacifico-Regular.ttf'
          ),
        });
      } catch (error) {
        console.warn(error);
      } finally {
        setAppIsReady(true);

        try {
          await SplashScreen.hideAsync();
        } catch (error) {
          console.log(
            'Native splash hide error:',
            error
          );
        }
      }
    }

    prepare();
  }, []);

  /*
   * TRIO animasyonlu açılış ekranı.
   * Navigation'dan bağımsız çalışır.
   */
  useEffect(() => {
    if (!appIsReady) {
      return undefined;
    }

    setShowIntro(true);

    const introTimer =
      setTimeout(() => {
        setShowIntro(false);
      }, 3200);

    return () => {
      clearTimeout(introTimer);
    };
  }, [appIsReady]);

  /*
   * Giriş yapan kullanıcıyı takip eder.
   */
  useEffect(() => {
    const unsubscribeAuth =
      onAuthStateChanged(
        auth,
        (user) => {
          if (user) {
            setCurrentUserId(
              user.uid
            );
          } else {
            setCurrentUserId(null);

            setUnreadMessageCount(0);

            setFriendRequestCount(0);

            setGameInviteCount(0);

            processedAcceptedInvites.current =
              {};
          }
        }
      );

    return () =>
      unsubscribeAuth();
  }, []);

  /*
   * Arkadaşlık isteklerini takip eder.
   */
  useEffect(() => {
    if (!currentUserId) {
      return undefined;
    }

    const friendRequestsQuery =
      query(
        collection(
          db,
          'friendRequests'
        ),
        where(
          'toUserId',
          '==',
          currentUserId
        ),
        where(
          'status',
          '==',
          'pending'
        )
      );

    const unsubscribe = onSnapshot(
      friendRequestsQuery,
      (snapshot) => {
        setFriendRequestCount(
          snapshot.size
        );
      },
      (error) => {
        console.log(
          'Friend request badge error:',
          error
        );
      }
    );

    return () => unsubscribe();
  }, [currentUserId]);

  /*
   * Okunmamış mesajları takip eder.
   */
  useEffect(() => {
    if (!currentUserId) {
      return undefined;
    }

    const unreadMessagesQuery =
      query(
        collection(db, 'chats'),
        where(
          'lastMessageReceiverId',
          '==',
          currentUserId
        ),
        where(
          'lastMessageRead',
          '==',
          false
        )
      );

    const unsubscribe = onSnapshot(
      unreadMessagesQuery,
      (snapshot) => {
        setUnreadMessageCount(
          snapshot.size
        );
      },
      (error) => {
        console.log(
          'Unread message badge error:',
          error
        );
      }
    );

    return () => unsubscribe();
  }, [currentUserId]);

  /*
   * Bekleyen oyun davetlerini takip eder.
   */
  useEffect(() => {
    if (!currentUserId) {
      return undefined;
    }

    const gameInvitesQuery = query(
      collection(
        db,
        'gameInvites'
      ),
      where(
        'toUserId',
        '==',
        currentUserId
      ),
      where(
        'status',
        '==',
        'pending'
      )
    );

    const unsubscribe = onSnapshot(
      gameInvitesQuery,
      (snapshot) => {
        setGameInviteCount(
          snapshot.size
        );
      },
      (error) => {
        console.log(
          'Game invite badge error:',
          error
        );
      }
    );

    return () => unsubscribe();
  }, [currentUserId]);

  /*
   * Gönderilen oyun daveti kabul edilince:
   *
   * 1. Davet eden oyuncunun profilini getirir.
   * 2. Daveti kabul eden rakibin profilini getirir.
   * 3. Gerçek isimleri ve fotoğrafları
   *    oyun ekranına players parametresiyle yollar.
   * 4. Oyunu otomatik açar.
   */
  useEffect(() => {
    if (!currentUserId) {
      return undefined;
    }

    const acceptedInvitesQuery =
      query(
        collection(
          db,
          'gameInvites'
        ),
        where(
          'fromUserId',
          '==',
          currentUserId
        ),
        where(
          'status',
          '==',
          'accepted'
        )
      );

    const unsubscribe = onSnapshot(
      acceptedInvitesQuery,
      async (snapshot) => {
        const changes =
          snapshot.docChanges();

        for (const change of changes) {
          const inviteId =
            change.doc.id;

          if (
            processedAcceptedInvites
              .current[inviteId]
          ) {
            continue;
          }

          const invite = {
            id: inviteId,
            ...change.doc.data(),
          };

          processedAcceptedInvites.current[
            inviteId
          ] = true;

          try {
            /*
             * Davet eden kişi Player 1,
             * daveti kabul eden kişi Player 2.
             */
            const [
              invitingPlayer,
              invitedPlayer,
            ] = await Promise.all([
              getUserGameProfile(
                invite.fromUserId,
                1
              ),

              getUserGameProfile(
                invite.toUserId,
                2
              ),
            ]);

            const gamePlayers = [
              invitingPlayer,
              invitedPlayer,
            ];

            const gameScreens = {
              1: 'GameScreen',
              2: 'GameScreen2',
              3: 'GameScreen3',
              4: 'GameScreen4',
              5: 'GameScreen5',
            };

            const screenName =
              gameScreens[
                invite.gameType
              ] || 'GameScreen';

            if (
              navigationRef.isReady()
            ) {
              navigationRef.navigate(
                screenName,
                {
                  roomId:
                    invite.roomId,

                  gameType:
                    invite.gameType,

                  isOnline: true,

                  inviteId:
                    invite.id,

                  invitedBy:
                    invite.fromUserId,

                  acceptedBy:
                    invite.toUserId,

                  opponentUserId:
                    invite.toUserId,

                  players:
                    gamePlayers,
                }
              );
            }

            await updateDoc(
              doc(
                db,
                'gameInvites',
                invite.id
              ),
              {
                status: 'started',
              }
            );
          } catch (error) {
            console.log(
              'Online game start error:',
              error
            );

            delete processedAcceptedInvites
              .current[inviteId];
          }
        }
      },
      (error) => {
        console.log(
          'Accepted game invite listener error:',
          error
        );
      }
    );

    return () => unsubscribe();
  }, [currentUserId]);

  const onLayoutRootView =
    useCallback(async () => {
      if (appIsReady) {
        await SplashScreen.hideAsync();
      }
    }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  if (showIntro) {
    return (
      <TrioAnimatedIntro />
    );
  }

  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={onLayoutRootView}
    >
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,

          animation:
            'slide_from_right',

          animationDuration: 320,

          gestureEnabled: true,

          fullScreenGestureEnabled:
            true,
        }}
      >
        <Stack.Screen
          name="Home"
          component={Home}
          options={{
            animation: 'fade',
          }}
        />

        <Stack.Screen
          name="SplashIntro"
          component={SplashIntro}
          options={{
            animation: 'fade',
          }}
        />

        <Stack.Screen
          name="TabNavigator"
          options={{
            animation: 'fade',
          }}
        >
          {(props) => (
            <TabNavigator
              {...props}
              unreadMessageCount={
                unreadMessageCount
              }
              friendRequestCount={
                friendRequestCount
              }
              gameInviteCount={
                gameInviteCount
              }
            />
          )}
        </Stack.Screen>

        <Stack.Screen
          name="MainMenu"
          component={MainMenu}
          options={{
            animation:
              'fade_from_bottom',
          }}
        />

        <Stack.Screen
          name="Friends"
          component={Friends}
          options={{
            animation:
              'slide_from_right',
          }}
        />

        <Stack.Screen
          name="EditProfile"
          component={EditProfile}
          options={{
            animation:
              'slide_from_bottom',

            gestureEnabled: true,
          }}
        />

        <Stack.Screen
          name="SignUp"
          component={SignUp}
          options={{
            animation:
              'fade_from_bottom',
          }}
        />

        <Stack.Screen
          name="ChatScreen"
          component={ChatScreen}
          options={{
            animation:
              'slide_from_right',
          }}
        />

        <Stack.Screen
          name="UserProfileScreen"
          component={
            UserProfileScreen
          }
          options={{
            animation:
              'slide_from_right',
          }}
        />

        <Stack.Screen
          name="Notifications"
          component={Notifications}
          options={{
            animation:
              'slide_from_right',
          }}
        />

        <Stack.Screen
          name="OnlineRoomSetupScreen"
          component={
            OnlineRoomSetupScreen
          }
          options={{
            animation:
              'fade_from_bottom',
          }}
        />

        <Stack.Screen
          name="OnlineLobbyScreen"
          component={
            OnlineLobbyScreen
          }
          options={{
            animation:
              'slide_from_right',
          }}
        />

        <Stack.Screen
          name="GameScreen"
          component={GameScreen}
          options={{
            animation:
              'fade_from_bottom',

            gestureEnabled: false,
          }}
        />

        <Stack.Screen
          name="GameScreen2"
          component={GameScreen2}
          options={{
            animation:
              'fade_from_bottom',

            gestureEnabled: false,
          }}
        />

        <Stack.Screen
          name="GameScreen3"
          component={GameScreen3}
          options={{
            animation:
              'fade_from_bottom',

            gestureEnabled: false,
          }}
        />

        <Stack.Screen
          name="GameScreen4"
          component={GameScreen4}
          options={{
            animation:
              'fade_from_bottom',

            gestureEnabled: false,
          }}
        />

        <Stack.Screen
          name="GameScreen5"
          component={GameScreen5}
          options={{
            animation:
              'fade_from_bottom',

            gestureEnabled: false,
          }}
        />

        <Stack.Screen
          name="Privacy"
          component={PrivacyScreen}
          options={{
            animation:
              'slide_from_right',
          }}
        />

        <Stack.Screen
          name="ContactUs"
          component={
            ContactUsScreen
          }
          options={{
            animation:
              'slide_from_right',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  introContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  introTopGlow: {
    position: 'absolute',
    top: -180,
    right: -150,
    width: 450,
    height: 450,
    borderRadius: 225,
    backgroundColor:
      'rgba(0,198,255,0.16)',
  },

  introBottomGlow: {
    position: 'absolute',
    bottom: -190,
    left: -150,
    width: 450,
    height: 450,
    borderRadius: 225,
    backgroundColor:
      'rgba(0,114,255,0.14)',
  },

  introGlow: {
    position: 'absolute',
    width: 270,
    height: 270,
    borderRadius: 135,
    backgroundColor:
      'rgba(52,188,255,0.27)',
  },

  introLogoContainer: {
    width: 230,
    height: 230,
    borderRadius: 115,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: 'rgba(176,232,255,0.95)',
    shadowColor: '#00C6FF',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.65,
    shadowRadius: 22,
    elevation: 14,
  },

  introLogo: {
    width: '100%',
    height: '100%',
    borderRadius: 115,
  },

  introFlash: {
    position: 'absolute',
    width: 330,
    height: 5,
    borderRadius: 3,
    backgroundColor:
      'rgba(160,232,255,0.82)',
    shadowColor: '#00C6FF',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.9,
    shadowRadius: 14,
    elevation: 8,
  },

  introTextArea: {
    alignItems: 'center',
    marginTop: 4,
  },

  introTagline: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 2.6,
    textAlign: 'center',
    textShadowColor:
      'rgba(0,0,0,0.30)',
    textShadowOffset: {
      width: 0,
      height: 2,
    },
    textShadowRadius: 5,
  },

  introSubtext: {
    color:
      'rgba(164,227,255,0.72)',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 5,
    marginTop: 10,
  },

  introLoading: {
    position: 'absolute',
    bottom: 58,
    flexDirection: 'row',
    alignItems: 'center',
  },

  introDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 4,
    backgroundColor:
      'rgba(255,255,255,0.30)',
  },

  introDotActive: {
    width: 22,
    backgroundColor: '#00C6FF',
  },

  tabBar: {
    position: 'absolute',

    left: 18,
    right: 18,
    bottom: 18,

    height: 78,

    borderRadius: 32,

    backgroundColor:
      'rgba(17, 24, 39, 0.96)',

    borderTopWidth: 0,

    paddingTop: 10,

    paddingBottom:
      Platform.OS === 'ios'
        ? 20
        : 12,

    shadowColor: '#00c6ff',

    shadowOffset: {
      width: 0,
      height: 8,
    },

    shadowOpacity: 0.25,

    shadowRadius: 18,

    elevation: 15,
  },

  tabBarItem: {
    height: 60,
  },

  tabBarLabel: {
    fontSize: 11,

    fontWeight: '700',

    marginTop: 4,
  },

  activeIconBox: {
    width: 44,

    height: 34,

    borderRadius: 18,

    justifyContent: 'center',

    alignItems: 'center',

    shadowColor: '#00c6ff',

    shadowOffset: {
      width: 0,
      height: 4,
    },

    shadowOpacity: 0.45,

    shadowRadius: 8,

    elevation: 8,
  },

  inactiveIconBox: {
    width: 44,

    height: 34,

    justifyContent: 'center',

    alignItems: 'center',
  },

  badge: {
    backgroundColor: '#ff3b5c',

    color: '#fff',

    fontSize: 10,

    fontWeight: '800',

    minWidth: 18,

    height: 18,

    borderRadius: 9,

    marginTop: 6,
  },
});