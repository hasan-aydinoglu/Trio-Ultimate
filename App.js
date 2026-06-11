import React, { useState, useEffect, useCallback } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

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

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

SplashScreen.preventAutoHideAsync();

function TabNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="GameMode"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;

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
        options={{ title: 'Game' }}
      />

      <Tab.Screen name="Messages" component={Messages} />
      <Tab.Screen name="Friends" component={Friends} />
      <Tab.Screen name="Profile" component={Profile} />
      <Tab.Screen name="Settings" component={Settings} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);

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
        <Stack.Screen name="TabNavigator" component={TabNavigator} />
        <Stack.Screen name="MainMenu" component={MainMenu} />
        <Stack.Screen name="Friends" component={Friends} />
        <Stack.Screen name="EditProfile" component={EditProfile} />
        <Stack.Screen name="SignUp" component={SignUp} />

        <Stack.Screen
          name="OnlineRoomSetupScreen"
          component={OnlineRoomSetupScreen}
        />

        <Stack.Screen
          name="OnlineLobbyScreen"
          component={OnlineLobbyScreen}
        />

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