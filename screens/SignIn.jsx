import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  TouchableOpacity,
} from 'react-native';

import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';

import {
  signInWithEmailAndPassword,
  signInWithCredential,
  GoogleAuthProvider,
} from 'firebase/auth';

import { auth } from '../firebase';

WebBrowser.maybeCompleteAuthSession();

export default function SignIn({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId:
      '299604098277-bm08castn3kjbi5dotgglqvim77tv10j.apps.googleusercontent.com',
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const idToken =
        response.authentication?.idToken ||
        response.params?.id_token;

      if (!idToken) {
        Alert.alert('Google Error', 'ID token alınamadı.');
        return;
      }

      const credential = GoogleAuthProvider.credential(idToken);

      signInWithCredential(auth, credential)
        .then(() => {
          Alert.alert('Success', 'Google ile giriş yapıldı');
          navigation.replace('GameModeScreen');
        })
        .catch((error) => {
          Alert.alert('Google Login Error', error.message);
        });
    }
  }, [response]);

  const handleSignIn = () => {
    signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        Alert.alert('Success', 'Giriş yapıldı');
        navigation.replace('GameModeScreen');
      })
      .catch((error) => {
        Alert.alert('Hata', error.message);
      });
  };

  const handleGoogleSignIn = async () => {
    Alert.alert('Google', 'Butona basıldı');
    console.log('Google button pressed');

    try {
      const result = await promptAsync();
      console.log('Google result:', result);
    } catch (error) {
      console.log('Google error:', error);
      Alert.alert('Google Error', error.message);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Giriş Yap</Text>

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={{ marginBottom: 10, borderWidth: 1, padding: 10 }}
      />

      <TextInput
        placeholder="Şifre"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{ marginBottom: 10, borderWidth: 1, padding: 10 }}
      />

      <Button title="Giriş Yap" onPress={handleSignIn} />

      <View style={{ height: 15 }} />

      <TouchableOpacity
        onPress={handleGoogleSignIn}
        activeOpacity={0.7}
        style={{
          backgroundColor: '#fff',
          borderWidth: 1,
          borderColor: '#ddd',
          padding: 12,
          borderRadius: 8,
          alignItems: 'center',
          marginBottom: 10,
        }}
      >
        <Text style={{ fontWeight: 'bold' }}>Sign in with Google</Text>
      </TouchableOpacity>

      <Button
        title="Kayıt Ol"
        onPress={() => navigation.navigate('SignUp')}
        color="gray"
      />
    </View>
  );
}