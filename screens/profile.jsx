import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Image, ScrollView, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const Profile = () => {
  const [fadeAnim] = useState(new Animated.Value(0)); // Animasyon state

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1200,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <LinearGradient colors={['#1e1e3f', '#0a0a23']} style={styles.gradient}>
      <Animated.ScrollView style={[styles.container, { opacity: fadeAnim }]}>
        <View style={styles.profileHeader}>
          <Image
            source={{ uri: 'https://randomuser.me/api/portraits/men/1.jpg' }}
            style={styles.profileImage}
          />
          <Text style={styles.username}>Hasan</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>24</Text>
            <Text style={styles.statLabel}>Gönderi</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>1.2K</Text>
            <Text style={styles.statLabel}>Takipçi</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>130</Text>
            <Text style={styles.statLabel}>Takip</Text>
          </View>
        </View>

        <View style={styles.buttonsContainer}>
          <Pressable style={styles.button}>
            <Text style={styles.buttonText}>Gönderiler</Text>
          </Pressable>
          <Pressable style={styles.button}>
            <Text style={styles.buttonText}>Oyunlar</Text>
          </Pressable>
        </View>
      </Animated.ScrollView>
    </LinearGradient>
  );
};

export default Profile;

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    padding: 20,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#f44336',
  },
  username: {
    marginTop: 10,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 15,
  },
  stat: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  statLabel: {
    color: '#ccc',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  button: {
    backgroundColor: '#ff9800',
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
