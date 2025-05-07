import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient'; // Linear Gradient modülünü ekliyoruz
import Icon from 'react-native-vector-icons/FontAwesome'; // Facebook ve Gmail ikonları için

const Home = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignIn = () => {
    console.log('Sign in with email:', email, 'Password:', password);
  };

  const handleSignUp = () => {
    console.log('Navigate to Sign Up');
    navigation.navigate('SignUp'); // Bu, Sign Up sayfasına yönlendirir
  };

  const handleFacebookSignIn = () => {
    // Facebook sayfasına yönlendirme
    const facebookUrl = 'https://www.facebook.com';
    Linking.openURL(facebookUrl).catch(err => console.error('Error opening Facebook:', err));
  };

  const handleGmailSignIn = () => {
    console.log('Sign in with Gmail');
  };

  return (
    <LinearGradient
      colors={['#2C3E50', '#34495E']} // Daha koyu tonlarda gradient arka plan
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
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
          <TouchableOpacity onPress={handleSignUp}>
            <Text style={styles.signUpLink}>Sign Up</Text>
          </TouchableOpacity>
        </View>

        {/* Social Media Sign In */}
        <View style={styles.socialContainer}>
          <TouchableOpacity style={styles.socialButton} onPress={handleFacebookSignIn}>
            <Icon name="facebook" size={20} color="#3b5998" style={styles.icon} />
            <Text style={styles.socialText}>Facebook</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.socialButton} onPress={handleGmailSignIn}>
            <Icon name="google" size={20} color="#db4437" style={styles.icon} />
            <Text style={styles.socialText}>Gmail</Text>
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
    color: '#ecf0f1', 
    marginBottom: 40,
    textAlign: 'center',
    fontFamily: 'Poppins', 
    textShadowColor: '#2C3E50',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
  },
  input: {
    width: '100%',
    padding: 15,
    marginVertical: 10,
    borderRadius: 25,
    backgroundColor: '#34495E', 
    borderColor: '#7f8c8d', 
    borderWidth: 1,
    fontSize: 16,
    color: '#ecf0f1', 
  },
  button: {
    backgroundColor: '#1abc9c', 
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
    color: '#1abc9c', 
    fontSize: 14,
  },
  signUpContainer: {
    flexDirection: 'row',
    marginTop: 20,
    justifyContent: 'center',
  },
  signUpText: {
    color: '#ecf0f1', 
    fontSize: 14,
  },
  signUpLink: {
    color: '#1abc9c',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 30,
    width: '100%',
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 30, 
    backgroundColor: '#ecf0f1', 
    width: '40%', 
    marginTop: 20,
  },
  socialText: {
    marginLeft: 10,
    color: '#34495E', 
    fontSize: 16,
    fontWeight: 'bold',
  },
  icon: {
    borderRadius: 10, 
    padding: 10,
  },
});

export default Home;
