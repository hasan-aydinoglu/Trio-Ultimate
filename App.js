import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import {
  NavigationContainer,
  createNavigationContainerRef,
} from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
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

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const navigationRef = createNavigationContainerRef();

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
        tabBarIcon: ({ focused, color }) => {
          let iconName = 'ellipse';

          if (route.name === 'GameMode') iconName = 'game-controller';
          else if (route.name === 'Messages') iconName = 'chatbubble-ellipses';
          else if (route.name === 'Friends') iconName = 'people';
          else if (route.name === 'Profile') iconName = 'person-circle';
          else if (route.name === 'Settings') iconName = 'settings';

          if (focused) {
            return (
              <LinearGradient
                colors={['#00c6ff', '#0072ff']}
                style={styles.activeIconBox}
              >
                <Ionicons name={iconName} size={23} color="#fff" />
              </LinearGradient>
            );
          }

          return (
            <View style={styles.inactiveIconBox}>
              <Ionicons name={iconName} size={22} color={color} />
            </View>
          );
        },

        tabBarActiveTintColor: '#ffffff',
        tabBarInactiveTintColor: '#8A94A6',
        headerShown: false,

        tabBarStyle: styles.tabBar,
        tabBarItemStyle: styles.tabBarItem,
        tabBarLabelStyle: styles.tabBarLabel,

        tabBarBadgeStyle: styles.badge,
      })}
    >
      <Tab.Screen
        name="GameMode"
        component={GameModeScreen}
        options={{
          title: 'Game',
          tabBarBadge: gameInviteCount > 0 ? gameInviteCount : undefined,
        }}
      />

      <Tab.Screen
        name="Messages"
        component={Messages}
        options={{
          title: 'Messages',
          tabBarBadge: unreadMessageCount > 0 ? unreadMessageCount : undefined,
        }}
      />

      <Tab.Screen
        name="Friends"
        component={Friends}
        options={{
          title: 'Friends',
          tabBarBadge: friendRequestCount > 0 ? friendRequestCount : undefined,
        }}
      />

      <Tab.Screen name="Profile" component={Profile} />
      <Tab.Screen name="Settings" component={Settings} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const [friendRequestCount, setFriendRequestCount] = useState(0);
  const [gameInviteCount, setGameInviteCount] = useState(0);

  const processedAcceptedInvites = useRef({});

  useEffect(() => {
    async function prepare() {
      try {
        await Font.loadAsync({
          pacifico: require('./assets/fonts/Pacifico-Regular.ttf'),
        });
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUserId(user.uid);
      } else {
        setCurrentUserId(null);
        setUnreadMessageCount(0);
        setFriendRequestCount(0);
        setGameInviteCount(0);
        processedAcceptedInvites.current = {};
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!currentUserId) return;

    const friendRequestsQuery = query(
      collection(db, 'friendRequests'),
      where('toUserId', '==', currentUserId),
      where('status', '==', 'pending')
    );

    const unsubscribe = onSnapshot(
      friendRequestsQuery,
      (snapshot) => {
        setFriendRequestCount(snapshot.size);
      },
      (error) => {
        console.log('Friend request badge error:', error);
      }
    );

    return () => unsubscribe();
  }, [currentUserId]);

  useEffect(() => {
    if (!currentUserId) return;

    const unreadMessagesQuery = query(
      collection(db, 'chats'),
      where('lastMessageReceiverId', '==', currentUserId),
      where('lastMessageRead', '==', false)
    );

    const unsubscribe = onSnapshot(
      unreadMessagesQuery,
      (snapshot) => {
        setUnreadMessageCount(snapshot.size);
      },
      (error) => {
        console.log('Unread message badge error:', error);
      }
    );

    return () => unsubscribe();
  }, [currentUserId]);

  useEffect(() => {
    if (!currentUserId) return;

    const gameInvitesQuery = query(
      collection(db, 'gameInvites'),
      where('toUserId', '==', currentUserId),
      where('status', '==', 'pending')
    );

    const unsubscribe = onSnapshot(
      gameInvitesQuery,
      (snapshot) => {
        setGameInviteCount(snapshot.size);
      },
      (error) => {
        console.log('Game invite badge error:', error);
      }
    );

    return () => unsubscribe();
  }, [currentUserId]);

  useEffect(() => {
    if (!currentUserId) return;

    const acceptedInvitesQuery = query(
      collection(db, 'gameInvites'),
      where('fromUserId', '==', currentUserId),
      where('status', '==', 'accepted')
    );

    const unsubscribe = onSnapshot(
      acceptedInvitesQuery,
      async (snapshot) => {
        snapshot.docChanges().forEach(async (change) => {
          const inviteId = change.doc.id;

          if (processedAcceptedInvites.current[inviteId]) return;

          const invite = {
            id: inviteId,
            ...change.doc.data(),
          };

          processedAcceptedInvites.current[inviteId] = true;

          const gameScreens = {
            1: 'GameScreen',
            2: 'GameScreen2',
            3: 'GameScreen3',
            4: 'GameScreen4',
            5: 'GameScreen5',
          };

          const screenName = gameScreens[invite.gameType] || 'GameScreen';

          if (navigationRef.isReady()) {
            navigationRef.navigate(screenName, {
              roomId: invite.roomId,
              gameType: invite.gameType,
              isOnline: true,
              inviteId: invite.id,
              invitedBy: invite.fromUserId,
              acceptedBy: invite.toUserId,
            });
          }

          await updateDoc(doc(db, 'gameInvites', invite.id), {
            status: 'started',
          });
        });
      },
      (error) => {
        console.log('Accepted game invite listener error:', error);
      }
    );

    return () => unsubscribe();
  }, [currentUserId]);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <NavigationContainer ref={navigationRef} onReady={onLayoutRootView}>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="SplashIntro" component={SplashIntro} />

        <Stack.Screen name="TabNavigator">
          {(props) => (
            <TabNavigator
              {...props}
              unreadMessageCount={unreadMessageCount}
              friendRequestCount={friendRequestCount}
              gameInviteCount={gameInviteCount}
            />
          )}
        </Stack.Screen>

        <Stack.Screen name="MainMenu" component={MainMenu} />
        <Stack.Screen name="Friends" component={Friends} />
        <Stack.Screen name="EditProfile" component={EditProfile} />
        <Stack.Screen name="SignUp" component={SignUp} />

        <Stack.Screen name="ChatScreen" component={ChatScreen} />
        <Stack.Screen name="UserProfileScreen" component={UserProfileScreen} />

        <Stack.Screen
          name="OnlineRoomSetupScreen"
          component={OnlineRoomSetupScreen}
        />

        <Stack.Screen name="OnlineLobbyScreen" component={OnlineLobbyScreen} />

        <Stack.Screen name="GameScreen" component={GameScreen} />
        <Stack.Screen name="GameScreen2" component={GameScreen2} />
        <Stack.Screen name="GameScreen3" component={GameScreen3} />
        <Stack.Screen name="GameScreen4" component={GameScreen4} />
        <Stack.Screen name="GameScreen5" component={GameScreen5} />

        <Stack.Screen name="Privacy" component={PrivacyScreen} />
        <Stack.Screen name="ContactUs" component={ContactUsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    left: 18,
    right: 18,
    bottom: 18,
    height: 78,
    borderRadius: 32,
    backgroundColor: 'rgba(17, 24, 39, 0.96)',
    borderTopWidth: 0,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 20 : 12,
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