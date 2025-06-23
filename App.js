import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import Home from './screens/home.jsx';
import SignUp from './screens/SignUp.jsx';
import GameScreen from './screens/GameScreen.jsx'; // 🆕 bunu ekliyoruz

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
  <>
    <Stack.Screen name="Home" component={Home} />
    <Stack.Screen name="SignUp" component={SignUp} />
    <Stack.Screen name="GameScreen" component={GameScreen} />
  </>
</Stack.Navigator>

    </NavigationContainer>
  );
}
