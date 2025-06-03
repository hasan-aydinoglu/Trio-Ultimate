import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import { auth } from './firebase'; // Firebase yapılandırmanız
import { onAuthStateChanged } from 'firebase/auth';
import Home from './screens/home';
import SignUp from './screens/SignUp';

export default function App() {
  const [isUserSignedIn, setIsUserSignedIn] = React.useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsUserSignedIn(true);
        console.log('Kullanıcı oturum açtı:', user);
      } else {
        setIsUserSignedIn(false);
        console.log('Kullanıcı çıkış yaptı.');
      }
    });

    // Temizlik fonksiyonu
    return () => unsubscribe();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      {isUserSignedIn &&
        <Home />
      }
      {!isUserSignedIn &&
        <SignUp />
      }
    </View>
  );
}
