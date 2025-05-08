import React, { useEffect, useState } from 'react';
import { View, Text, Button } from 'react-native';
import { auth } from './firebase';  // Firebase yapılandırma dosyanızı içe aktarın
import { signInWithEmailAndPassword } from 'firebase/auth';

const Home = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Kullanıcıyı kontrol et
    const unsubscribe = auth.onAuthStateChanged(setUser);
    return () => unsubscribe();
  }, []);

  const handleLogin = () => {
    signInWithEmailAndPassword(auth, 'email@example.com', 'password123')
      .then((userCredential) => {
        const user = userCredential.user;
        console.log(user);
      })
      .catch((error) => {
        console.error(error.message);
      });
  };

  return (
    <View>
      {user ? (
        <Text>Hoş geldiniz, {user.email}</Text>
      ) : (
        <Button title="Giriş Yap" onPress={handleLogin} />
      )}
    </View>
  );
};

export default Home;
