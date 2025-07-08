import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

export default function SplashIntro() {
  const navigation = useNavigation();
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    // Logo animasyonu
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: true,
    }).start(() => {
      // 3 saniye sonra ana sayfaya yönlendirme
      navigation.replace('TabNavigator');
      SplashScreen.hideAsync();
    });
  }, []);

  return (
    <View style={styles.container}>
      <Animated.Image
        source={require('../assets/splash.png')}
        style={[styles.logo, { opacity: fadeAnim }]}
        resizeMode="contain"
      />
      <Animated.Text style={[styles.title, { opacity: fadeAnim }]}>
        TRIO
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  logo: { width: 250, height: 250, marginBottom: 20 },
  title: { fontSize: 50, color: '#00c6ff', fontFamily: 'pacifico' },
});