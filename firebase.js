import { initializeApp } from 'firebase/app';

import {
  initializeAuth,
  getReactNativePersistence,
} from 'firebase/auth';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { getFirestore } from 'firebase/firestore';

import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyB8ebzpmkVSHKJqUQhFEnHdCmbs0CD_w4I",

  authDomain: "trio-app-e3bea.firebaseapp.com",

  projectId: "trio-app-e3bea",

  storageBucket: "trio-app-e3bea.firebasestorage.app",

  messagingSenderId: "299604098277",

  appId: "1:299604098277:web:33a7db3ef425965a25a80c",

  measurementId: "G-K1Z8M2BJVV"
};

const app = initializeApp(firebaseConfig);

let auth;

try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(
      AsyncStorage
    ),
  });
} catch (e) {
  const { getAuth } = require(
    'firebase/auth'
  );

  auth = getAuth(app);
}

const db = getFirestore(app);

const storage = getStorage(app);

export { auth, db, storage };