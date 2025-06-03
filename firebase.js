import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage'; // AsyncStorage kullanımı

const firebaseConfig = {
  apiKey: "AIzaSyB8ebzpmkVSHKJqUQhFEnHdCmbs0CD_w4I",
  authDomain: "trio-app-e3bea.firebaseapp.com",
  projectId: "trio-app-e3bea",
  storageBucket: "trio-app-e3bea.appspot.com",
  messagingSenderId: "299604098277",
  appId: "1:299604098277:web:33a7db3ef425965a25a80c",
  measurementId: "G-K1Z8M2BJVV"
};

const app = initializeApp(firebaseConfig);

// Auth için persistence yapılandırması ekle
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

export { auth };
