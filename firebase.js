// firebase.js
import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
} catch (e) {
  // Eğer initializeAuth zaten yapılmışsa hata verir, bu durumda getAuth kullan
  // Ama react-native Firebase modülü için getAuth genellikle hata verir.
  // Bu yüzden try-catch içinde ikinci opsiyon olarak fallback veriyoruz.
  const { getAuth } = require('firebase/auth');
  auth = getAuth(app);
}

export { auth };
