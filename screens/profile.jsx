import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Image, ScrollView } from 'react-native';
import LottieView from 'lottie-react-native';
import { useFocusEffect } from '@react-navigation/native';

const Profile = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      const timer = setTimeout(() => setIsLoading(false), 2500);
      return () => clearTimeout(timer);
    }, [])
  );

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <LottieView
          source={require('../assets/animations/loadingThree.json')}
          autoPlay
          loop
          style={{ width: 200, height: 200 }}
        />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <Image
          source={{ uri: 'https://randomuser.me/api/portraits/men/1.jpg' }}
          style={styles.profileImage}
        />
        <Text style={styles.username}>Hasan</Text>
      </View>

      {/* Stats */}
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

      {/* Story Section */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.storiesContainer}>
        {[...Array(6)].map((_, i) => (
          <View key={i} style={styles.story}>
            <Image
              source={{ uri: `https://randomuser.me/api/portraits/women/${i + 10}.jpg` }}
              style={styles.storyImage}
            />
            <Text style={styles.storyText}>Story {i + 1}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Buttons */}
      <View style={styles.buttonsContainer}>
        <Pressable style={styles.button}>
          <Text style={styles.buttonText}>Gönderiler</Text>
        </Pressable>
        <Pressable style={styles.button}>
          <Text style={styles.buttonText}>Storyler</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
};

export default Profile;

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    padding: 20,
    backgroundColor: '#fff',
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
    fontSize: 22,
    fontWeight: 'bold',
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
  },
  statLabel: {
    color: '#888',
  },
  storiesContainer: {
    marginVertical: 20,
  },
  story: {
    alignItems: 'center',
    marginRight: 15,
  },
  storyImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: '#ff9800',
  },
  storyText: {
    marginTop: 5,
    fontSize: 12,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  button: {
    backgroundColor: '#2196f3',
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
