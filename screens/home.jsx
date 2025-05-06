import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient'; // Linear Gradient modülünü ekliyoruz

const Home = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignIn = () => {
    // Burada giriş işlemi yapılabilir
    console.log('Sign in with email:', email, 'Password:', password);
  };

  return (
    <LinearGradient
      colors={['#2C3E50', '#34495E']} // Daha koyu tonlarda gradient arka plan
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Modern TRIO yazısı ve şık bir font */}
        <Text style={styles.title}>TRIO</Text>

        {/* Email Input */}
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#ccc"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

        {/* Password Input */}
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#ccc"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {/* Forgot Password */}
        <TouchableOpacity style={styles.forgotPassword}>
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>

        {/* Sign In Button */}
        <Pressable style={styles.button} onPress={handleSignIn}>
          <Text style={styles.buttonText}>Sign In</Text>
        </Pressable>

        {/* Sign Up Button */}
        <View style={styles.signUpContainer}>
          <Text style={styles.signUpText}>Don't have an account?</Text>
          <TouchableOpacity onPress={() => console.log('Navigate to Sign Up')}>
            <Text style={styles.signUpLink}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  title: {
    fontSize: 60,
    fontWeight: 'bold',
    color: '#ecf0f1', // Açık gri
    marginBottom: 40,
    textAlign: 'center',
    fontFamily: 'Poppins', // Modern bir font ekliyoruz
    textShadowColor: '#2C3E50',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
  },
  input: {
    width: '100%',
    padding: 15,
    marginVertical: 10,
    borderRadius: 25,
    backgroundColor: '#34495E', // Koyu gri renk
    borderColor: '#7f8c8d', // Açık gri kenar
    borderWidth: 1,
    fontSize: 16,
    color: '#ecf0f1', // Açık gri yazı
  },
  button: {
    backgroundColor: '#1abc9c', // Yeşilimsi ton
    paddingVertical: 15,
    borderRadius: 25,
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: 10,
  },
  forgotPasswordText: {
    color: '#1abc9c', // Yeşilimsi renk
    fontSize: 14,
  },
  signUpContainer: {
    flexDirection: 'row',
    marginTop: 20,
    justifyContent: 'center',
  },
  signUpText: {
    color: '#ecf0f1', // Açık gri
    fontSize: 14,
  },
  signUpLink: {
    color: '#1abc9c', // Yeşilimsi renk
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 5,
  },
});

export default Home;
