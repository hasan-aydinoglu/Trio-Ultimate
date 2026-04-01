import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient'; 
import Icon from 'react-native-vector-icons/FontAwesome'; 
import { createUserWithEmailAndPassword } from 'firebase/auth'; 
import { auth } from '../firebase'; 
const SignUp = ({ navigation }) => {
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignUp = () => {
    if (!name || !surname || !email || !password) {
      Alert.alert('All fields are required!');
      return;
    }

    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        console.log('User registered:', user);
        Alert.alert('Registration Successful');
        navigation.navigate('Home'); 
      })
      .catch((error) => {
        const errorMessage = error.message;
        console.log(errorMessage);
        Alert.alert('Error', errorMessage);
      });
  };

  const handleFacebookSignUp = () => {
    
    console.log('Sign up with Facebook');
  };

  const handleGmailSignUp = () => {
    
    console.log('Sign up with Gmail');
  };

  return (
    <LinearGradient
      colors={['#2C3E50', '#34495E']} 
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        
        <Text style={styles.title}>TRIO</Text>

        
        <TextInput
          style={styles.input}
          placeholder="Name"
          placeholderTextColor="#ccc"
          value={name}
          onChangeText={setName}
        />

       
        <TextInput
          style={styles.input}
          placeholder="Surname"
          placeholderTextColor="#ccc"
          value={surname}
          onChangeText={setSurname}
        />

       
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#ccc"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

       
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#ccc"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        
        <TouchableOpacity style={styles.button} onPress={handleSignUp}>
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>

        
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
    backgroundColor: '#ecf0f1', 
  },
  socialText: {
    marginLeft: 10,
    color: '#34495E', 
    fontSize: 16,
    fontWeight: 'bold',
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
});

export default SignUp;
