import React, {
  useEffect,
  useState,
} from 'react';

import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';

import {
  LinearGradient,
} from 'expo-linear-gradient';

import {
  signOut,
} from 'firebase/auth';

import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  auth,
} from '../firebase';

export default function SettingsScreen({
  navigation,
}) {
  const [
    isDarkMode,
    setIsDarkMode,
  ] = useState(false);

  /*
   * Settings ekranı açıldığında
   * kayıtlı Dark Mode değerini getir.
   */
  useEffect(() => {
    const loadDarkMode = async () => {
      try {
        const savedDarkMode =
          await AsyncStorage.getItem(
            'trioDarkMode'
          );

        if (
          savedDarkMode !== null
        ) {
          setIsDarkMode(
            savedDarkMode === 'true'
          );
        }
      } catch (error) {
        console.log(
          'Dark mode load error:',
          error
        );
      }
    };

    loadDarkMode();
  }, []);

  /*
   * Dark Mode açılıp kapandığında
   * değeri cihazda sakla.
   *
   * Diğer oyun ekranları da
   * trioDarkMode değerini okuyacak.
   */
  const toggleDarkMode =
    async (value) => {
      try {
        setIsDarkMode(value);

        await AsyncStorage.setItem(
          'trioDarkMode',
          value
            ? 'true'
            : 'false'
        );
      } catch (error) {
        console.log(
          'Dark mode save error:',
          error
        );

        Alert.alert(
          'Error',
          'Dark Mode setting could not be saved.'
        );
      }
    };

  const handleLogout =
    async () => {
      try {
        await signOut(auth);

        navigation
          .getParent()
          ?.reset({
            index: 0,

            routes: [
              {
                name: 'Home',
              },
            ],
          });
      } catch (error) {
        Alert.alert(
          'Logout Error',
          error.message
        );
      }
    };

  return (
    <LinearGradient
      colors={
        isDarkMode
          ? [
              '#001225',
              '#000817',
              '#000000',
            ]
          : [
              '#00c6ff',
              '#0072ff',
              '#000',
            ]
      }
      style={
        styles.container
      }
    >
      <Text
        style={
          styles.header
        }
      >
        Settings
      </Text>

      <View
        style={
          styles.option
        }
      >
        <View>
          <Text
            style={
              styles.label
            }
          >
            Notifications
          </Text>

          <Text
            style={
              styles.optionDescription
            }
          >
            Game and message alerts
          </Text>
        </View>

        <Switch
          value={true}
        />
      </View>

      <View
        style={
          styles.option
        }
      >
        <View
          style={
            styles.optionTextContainer
          }
        >
          <Text
            style={
              styles.label
            }
          >
            Dark Mode
          </Text>

          <Text
            style={
              styles.optionDescription
            }
          >
            Darken TRIO and all game modes
          </Text>
        </View>

        <Switch
          value={isDarkMode}
          onValueChange={
            toggleDarkMode
          }
        />
      </View>

      <TouchableOpacity
        style={[
          styles.button,

          isDarkMode &&
            styles.darkButton,
        ]}
        onPress={() =>
          navigation.navigate(
            'ContactUs'
          )
        }
        activeOpacity={0.8}
      >
        <Text
          style={
            styles.buttonText
          }
        >
          Contact Support
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.button,

          isDarkMode &&
            styles.darkButton,
        ]}
        onPress={() =>
          navigation.navigate(
            'Privacy'
          )
        }
        activeOpacity={0.8}
      >
        <Text
          style={
            styles.buttonText
          }
        >
          Privacy Policy
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.button,

          isDarkMode &&
            styles.darkButton,
        ]}
        onPress={
          handleLogout
        }
        activeOpacity={0.8}
      >
        <Text
          style={
            styles.buttonText
          }
        >
          Log Out
        </Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
    },

    header: {
      fontSize: 26,

      fontWeight:
        'bold',

      marginBottom: 30,

      textAlign:
        'center',

      marginTop: 40,

      color: '#FFFFFF',
    },

    option: {
      flexDirection:
        'row',

      justifyContent:
        'space-between',

      alignItems:
        'center',

      marginBottom: 20,

      backgroundColor:
        'rgba(255,255,255,0.08)',

      borderRadius: 15,

      padding: 15,

      borderWidth: 1,

      borderColor:
        'rgba(255,255,255,0.14)',
    },

    optionTextContainer: {
      flex: 1,

      paddingRight: 15,
    },

    label: {
      fontSize: 18,

      color:
        '#FFFFFF',

      fontWeight:
        '600',
    },

    optionDescription: {
      color:
        'rgba(255,255,255,0.65)',

      fontSize: 12,

      marginTop: 4,
    },

    button: {
      backgroundColor:
        'rgba(255,255,255,0.15)',

      padding: 15,

      borderRadius: 12,

      marginTop: 15,

      borderWidth: 1,

      borderColor:
        'rgba(255,255,255,0.3)',
    },

    darkButton: {
      backgroundColor:
        'rgba(255,255,255,0.07)',

      borderColor:
        'rgba(255,255,255,0.16)',
    },

    buttonText: {
      color:
        '#FFFFFF',

      textAlign:
        'center',

      fontSize: 17,

      fontWeight:
        '500',
    },
  });