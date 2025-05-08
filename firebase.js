import auth from '@react-native-firebase/auth';
import { useState, useEffect } from 'react';

const Home = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(setUser);
    return subscriber; // Unsubscribe on unmount
  }, []);

  return (
    <View>
      {user ? <Text>Welcome {user.displayName}</Text> : <Text>Please log in</Text>}
    </View>
  );
};
