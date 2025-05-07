import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native'; // Eğer animasyon kullanacaksanız

const SplashScreen = ({ navigation }) => {
  useEffect(() => {
    // Splash screen gösterildikten sonra, ana sayfaya yönlendir
    const timer = setTimeout(() => {
      navigation.replace('Home'); // 'Home' yerine ana sayfanızın adını yazın
    }, 3000); // 3 saniye sonra yönlendir

    return () => clearTimeout(timer); // Temizleme
  }, [navigation]);

  return (
    <LinearGradient
      colors={['#2C3E50', '#34495E']} // Renk geçişi
      style={styles.container}
    >
      <LottieView
        source={require('../assets/animations/modernLoader.json')} // Animasyon dosyanız
        autoPlay
        loop
        style={styles.animation}
      />
      <Text style={styles.title}>TRIO</Text>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  animation: {
    width: 150,
    height: 150,
  },
  title: {
    fontSize: 50,
    fontWeight: 'bold',
    color: '#ecf0f1',
    marginTop: 20,
  },
});

export default SplashScreen;
