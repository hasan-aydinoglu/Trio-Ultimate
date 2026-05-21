import React, { useEffect, useState } from 'react';

import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { auth } from '../firebase';

import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
} from 'firebase/auth';

const Home = ({ navigation }) => {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {

    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        setUser(currentUser);
      }
    );

    return () => unsubscribe();

  }, []);

  const handleSignIn = () => {

    if (!email || !password) {

      Alert.alert(
        'Warning',
        'Please enter your email and password.'
      );

      return;
    }

    signInWithEmailAndPassword(auth, email, password)

      .then((userCredential) => {

        Alert.alert(
          'Success',
          `Welcome ${userCredential.user.email}`
        );

        navigation.navigate('TabNavigator', {
          screen: 'GameMode',
        });

      })

      .catch((error) => {

        Alert.alert(
          'Error',
          error.message
        );

      });
  };

  return (

    <LinearGradient
      colors={['#01040B', '#031327', '#041B38', '#020814']}
      style={styles.container}
    >

      <View style={styles.bgGlowOne} />
      <View style={styles.bgGlowTwo} />
      <View style={styles.bgGlowThree} />
      <View style={styles.bgCircleOne} />
      <View style={styles.bgCircleTwo} />

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >

        <View style={styles.logoWrapper}>
          <Text style={styles.logo}>Trio</Text>
        </View>

        <View style={styles.cardWrapper}>

          <View style={styles.card}>

            <Text style={styles.title}>
              Login to Trio
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#BFC6D4"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />

            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#BFC6D4"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <Pressable
              style={styles.loginButton}
              onPress={handleSignIn}
            >
              <Text style={styles.loginButtonText}>
                Login
              </Text>
            </Pressable>

            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>
                Forgot Password?
              </Text>
            </TouchableOpacity>

            <View style={styles.signUpRow}>

              <Text style={styles.signUpText}>
                Don&apos;t have an account?
              </Text>

              <TouchableOpacity
                onPress={() => navigation.navigate('SignUp')}
              >
                <Text style={styles.signUpLink}>
                  {' '}Sign Up
                </Text>
              </TouchableOpacity>

            </View>

            <Text style={styles.orText}>
              Or
            </Text>

            <TouchableOpacity
              style={[styles.socialButton, styles.googleButton]}
            >

              <Ionicons
                name="logo-google"
                size={20}
                color="#ffffff"
              />

              <Text style={styles.socialButtonText}>
                {' '}Sign in with Google
              </Text>

            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.socialButton, styles.facebookButton]}
            >

              <Ionicons
                name="logo-facebook"
                size={20}
                color="#ffffff"
              />

              <Text style={styles.socialButtonText}>
                {' '}Sign in with Facebook
              </Text>

            </TouchableOpacity>

          </View>

        </View>

        {user && (

          <View style={styles.userBox}>

            <Text style={styles.userText}>
              Welcome, {user.email}
            </Text>

          </View>

        )}

      </ScrollView>

    </LinearGradient>
  );
};

const styles = StyleSheet.create({

  container: {
    flex: 1,
  },

  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },

  logoWrapper: {
    alignItems: 'center',
    marginBottom: 30,
  },

  logo: {
    fontSize: 42,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  cardWrapper: {
    justifyContent: 'center',
  },

  card: {
    backgroundColor: 'rgba(35, 56, 125, 0.34)',
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },

  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 24,
  },

  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },

  loginButton: {
    backgroundColor: '#38D67A',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },

  loginButtonText: {
    color: '#fff',
    fontWeight: '700',
  },

  forgotPassword: {
    alignItems: 'center',
    marginTop: 12,
  },

  forgotPasswordText: {
    color: '#ccc',
  },

  signUpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 14,
  },

  signUpText: {
    color: '#ccc',
  },

  signUpLink: {
    color: '#38D67A',
    fontWeight: '700',
  },

  orText: {
    textAlign: 'center',
    marginVertical: 12,
    color: '#fff',
  },

  socialButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    marginTop: 10,
    borderWidth: 1,
  },

  googleButton: {
    backgroundColor: '#DB4437',
    borderColor: '#DB4437',
  },

  facebookButton: {
    backgroundColor: '#1877F2',
    borderColor: '#1877F2',
  },

  socialButtonText: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: '700',
  },

  userBox: {
    marginTop: 20,
    alignItems: 'center',
  },

  userText: {
    color: '#38D67A',
  },

  bgGlowOne: {
    position: 'absolute',
    top: 120,
    left: -40,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(0,132,255,0.14)',
  },

  bgGlowTwo: {
    position: 'absolute',
    top: 260,
    right: -60,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(54,110,255,0.15)',
  },

  bgGlowThree: {
    position: 'absolute',
    bottom: 120,
    left: 30,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(0,214,255,0.08)',
  },

  bgCircleOne: {
    position: 'absolute',
    top: 170,
    right: 35,
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 2,
    borderColor: 'rgba(49,97,255,0.22)',
  },

  bgCircleTwo: {
    position: 'absolute',
    bottom: 180,
    left: 45,
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 2,
    borderColor: 'rgba(0,163,255,0.14)',
  },

});

export default Home;