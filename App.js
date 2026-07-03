import React, { useState, useEffect, useCallback } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

import { auth, db } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import {
  collection,
  query,
  where,
  onSnapshot,
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
        tabBarIcon: ({ color, size }) => {
          let iconName = 'ellipse';

          if (route.name === 'GameMode') iconName = 'game-controller';
          else if (route.name === 'Messages') iconName = 'chatbox';
          else if (route.name === 'Friends') iconName = 'people';
          else if (route.name === 'Profile') iconName = 'person';
          else if (route.name === 'Settings') iconName = 'settings';

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#1abc9c',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
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
          tabBarBadge: unreadMessageCount > 0 ? unreadMessageCount : undefined,
        }}
      />

      <Tab.Screen
        name="Friends"
        component={Friends}
        options={{
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

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <NavigationContainer onReady={onLayoutRootView}>
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