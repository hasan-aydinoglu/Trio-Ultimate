import React, { useEffect } from 'react';
import { View, Image, StyleSheet, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const SplashIntro = ({ navigation }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('TabNavigator');
    }, 2500); 
    return () => clearTimeout(timer);
  }, []);

  return (
    <LinearGradient colors={['#00c6ff', '#0072ff']} style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Image
        source={require('../assets/trio-logo.png')} 
        style={styles.logo}
        resizeMode="contain"
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  logo: { width: 300, height: 300 },
});

export default SplashIntro;