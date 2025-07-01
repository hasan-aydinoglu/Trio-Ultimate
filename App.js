import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Home from './screens/home.jsx'; // 📌 Home ekranını ekliyoruz
import GameScreen from './screens/GameScreen';
import Profile from './screens/profile';
import Settings from './screens/settings';
import { Ionicons } from '@expo/vector-icons';
import MainMenu from './screens/MainMenu.jsx';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        initialRouteName="Home" // 📌 açılışta Home açılsın
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName;
            if (route.name === 'Home') iconName = 'home';
            else if (route.name === 'Game') iconName = 'game-controller';
            else if (route.name === 'Profile') iconName = 'person';
            else if (route.name === 'Settings') iconName = 'settings';

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#1abc9c',
          tabBarInactiveTintColor: 'gray',
          headerShown: false,
        })}
      >
        <Tab.Screen name="Home" component={Home} />
        <Tab.Screen name="GameScreen" component={GameScreen} />
        <Tab.Screen name="Profile" component={Profile} />
        <Tab.Screen name="Settings" component={Settings} />
        <Tab.Screen name="Menu" component={MainMenu} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}