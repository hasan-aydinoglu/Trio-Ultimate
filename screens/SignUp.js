import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient'; // Linear Gradient modülünü ekliyoruz
import Icon from 'react-native-vector-icons/FontAwesome'; // Facebook ve Gmail ikonları için

const SignUp = ({ navigation }) => {
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignUp = () => {
    // Burada kullanıcı kaydı yapılabilir
    console.log('Sign up with:', { name, surname, email, password });
    navigation.navigate('Home'); // Başarılı kayıt sonrası home sayfasına yönlendir
  };

  const handleFacebookSignUp = () => {
    // Facebook ile giriş yapılabilir
    console.log('Sign up with Facebook');
  };

  const handleGmailSignUp = () => {
    // Gmail ile giriş yapılabilir
    console.log('Sign up with Gmail');
  };

  return (
    <LinearGradient
      colors={['#2C3E50', '#34495E']} // Daha koyu tonlarda gradient arka plan
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* TRIO Yazısı */}
        <Text style={styles.title}>TRIO</Text>

        {/* Name Input */}
        <TextInput
          style={styles.input}
          placeholder="Name"
          placeholderTextColor="#ccc"
          value={name}
          onChangeText={setName}
        />

        {/* Surname Input */}
        <TextInput
          style={styles.input}
          placeholder="Surname"
          placeholderTextColor="#ccc"
          value={surname}
          onChangeText={setSurname}
        />

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

        {/* Sign Up Button */}
        <TouchableOpacity style={styles.button} onPress={handleSignUp}>
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>

        {/* Social Media Sign Up */}
        <View style={styles.socialContainer}>
          <TouchableOpacity style={styles.socialButton} onPress={handleFacebookSignUp}>
            <Icon name="facebook" size={30} color="#3b5998" />
            <Text style={styles.socialText}>Facebook</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.socialButton} onPress={handleGmailSignUp}>
            <Icon name="google" size={30} color="#db4437" />
            <Text style={styles.socialText}>Gmail</Text>
          </TouchableOpacity>
        </View>

        {/* Back to Sign In Button */}
        <View style={styles.signUpContainer}>
          <Text style={styles.signUpText}>Already have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Home')}>
            <Text style={styles.signUpLink}>Sign In</Text>
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
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    backgroundColor: '#ecf0f1', // Açık renk
  },
  socialText: {
    marginLeft: 10,
    color: '#34495E', // Koyu gri
    fontSize: 16,
    fontWeight: 'bold',
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

export default SignUp;
