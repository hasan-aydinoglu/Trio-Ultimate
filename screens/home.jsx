import React, {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  TouchableOpacity,
  ScrollView,
  Alert,
  Animated,
  Easing,
  Image,
  StatusBar,
} from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';

import { auth } from '../firebase';

import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signInWithCredential,
  GoogleAuthProvider,
} from 'firebase/auth';

WebBrowser.maybeCompleteAuthSession();

const Home = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState(null);

  const [
    loginAnimationVisible,
    setLoginAnimationVisible,
  ] = useState(false);

  const [
    isSigningIn,
    setIsSigningIn,
  ] = useState(false);

  const overlayOpacity =
    useRef(new Animated.Value(0)).current;

  const logoOpacity =
    useRef(new Animated.Value(0)).current;

  const logoScale =
    useRef(new Animated.Value(0.58)).current;

  const logoTranslateY =
    useRef(new Animated.Value(24)).current;

  const glowOpacity =
    useRef(new Animated.Value(0)).current;

  const glowScale =
    useRef(new Animated.Value(0.55)).current;

  const welcomeOpacity =
    useRef(new Animated.Value(0)).current;

  const welcomeTranslateY =
    useRef(new Animated.Value(14)).current;

  const lineScale =
    useRef(new Animated.Value(0)).current;

  const [
    request,
    response,
    promptAsync,
  ] = Google.useIdTokenAuthRequest({
    iosClientId:
      '299604098277-4jl88m3ucgs47hrqk5ij3jng1vheg78e.apps.googleusercontent.com',

    webClientId:
      '299604098277-bm08castn3kjbi5dotgglqvim77tv10j.apps.googleusercontent.com',
  });

  useEffect(() => {
    const unsubscribe =
      onAuthStateChanged(
        auth,
        (currentUser) => {
          setUser(currentUser);
        }
      );

    return () => unsubscribe();
  }, []);

  const resetLoginAnimationValues = () => {
    overlayOpacity.setValue(0);
    logoOpacity.setValue(0);
    logoScale.setValue(0.58);
    logoTranslateY.setValue(24);
    glowOpacity.setValue(0);
    glowScale.setValue(0.55);
    welcomeOpacity.setValue(0);
    welcomeTranslateY.setValue(14);
    lineScale.setValue(0);
  };

  const openGameMode = () => {
    navigation.navigate(
      'TabNavigator',
      {
        screen: 'GameMode',
      }
    );
  };

  const playLoginSuccessAnimation = () => {
    resetLoginAnimationValues();

    setLoginAnimationVisible(true);

    requestAnimationFrame(() => {
      Animated.sequence([
        Animated.parallel([
          Animated.timing(
            overlayOpacity,
            {
              toValue: 1,
              duration: 220,
              useNativeDriver: true,
            }
          ),

          Animated.timing(
            glowOpacity,
            {
              toValue: 0.88,
              duration: 420,
              useNativeDriver: true,
            }
          ),

          Animated.timing(
            glowScale,
            {
              toValue: 1.18,
              duration: 850,
              easing:
                Easing.out(
                  Easing.cubic
                ),
              useNativeDriver: true,
            }
          ),

          Animated.timing(
            logoOpacity,
            {
              toValue: 1,
              duration: 350,
              useNativeDriver: true,
            }
          ),

          Animated.timing(
            logoTranslateY,
            {
              toValue: 0,
              duration: 620,
              easing:
                Easing.out(
                  Easing.cubic
                ),
              useNativeDriver: true,
            }
          ),

          Animated.spring(
            logoScale,
            {
              toValue: 1,
              friction: 5,
              tension: 58,
              useNativeDriver: true,
            }
          ),
        ]),

        Animated.parallel([
          Animated.timing(
            welcomeOpacity,
            {
              toValue: 1,
              duration: 340,
              useNativeDriver: true,
            }
          ),

          Animated.timing(
            welcomeTranslateY,
            {
              toValue: 0,
              duration: 360,
              easing:
                Easing.out(
                  Easing.cubic
                ),
              useNativeDriver: true,
            }
          ),

          Animated.timing(
            lineScale,
            {
              toValue: 1,
              duration: 430,
              easing:
                Easing.out(
                  Easing.cubic
                ),
              useNativeDriver: true,
            }
          ),
        ]),

        Animated.delay(650),

        Animated.parallel([
          Animated.timing(
            overlayOpacity,
            {
              toValue: 0,
              duration: 260,
              useNativeDriver: true,
            }
          ),

          Animated.timing(
            glowOpacity,
            {
              toValue: 0,
              duration: 220,
              useNativeDriver: true,
            }
          ),
        ]),
      ]).start(() => {
        setLoginAnimationVisible(false);
        setIsSigningIn(false);

        openGameMode();
      });
    });
  };

  useEffect(() => {
    if (response?.type !== 'success') {
      return;
    }

    const completeGoogleSignIn =
      async () => {
        const idToken =
          response.authentication?.idToken ||
          response.params?.id_token;

        if (!idToken) {
          setIsSigningIn(false);

          Alert.alert(
            'Google Error',
            'Google ID token alınamadı.'
          );

          return;
        }

        try {
          setIsSigningIn(true);

          const credential =
            GoogleAuthProvider.credential(
              idToken
            );

          await signInWithCredential(
            auth,
            credential
          );

          playLoginSuccessAnimation();
        } catch (error) {
          setIsSigningIn(false);

          Alert.alert(
            'Google Login Error',
            error.message
          );
        }
      };

    completeGoogleSignIn();
  }, [response]);

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert(
        'Warning',
        'Please enter your email and password.'
      );

      return;
    }

    if (isSigningIn) {
      return;
    }

    try {
      setIsSigningIn(true);

      await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      playLoginSuccessAnimation();
    } catch (error) {
      setIsSigningIn(false);

      Alert.alert(
        'Error',
        error.message
      );
    }
  };

  const handleGoogleSignIn = async () => {
    if (isSigningIn) {
      return;
    }

    try {
      setIsSigningIn(true);

      console.log(
        'Google button pressed'
      );

      const result =
        await promptAsync();

      console.log(
        'Google result:',
        result
      );

      if (
        result?.type !== 'success'
      ) {
        setIsSigningIn(false);
      }
    } catch (error) {
      setIsSigningIn(false);

      Alert.alert(
        'Google Error',
        error.message
      );
    }
  };

  const handleFacebookSignIn = () => {
    Alert.alert(
      'Facebook Login',
      'Facebook login için önce Meta Developer App ID eklememiz gerekiyor.'
    );
  };

  return (
    <LinearGradient
      colors={[
        '#01040B',
        '#031327',
        '#041B38',
        '#020814',
      ]}
      style={styles.container}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor="#01040B"
      />

      <View
        pointerEvents="none"
        style={styles.bgGlowOne}
      />

      <View
        pointerEvents="none"
        style={styles.bgGlowTwo}
      />

      <View
        pointerEvents="none"
        style={styles.bgGlowThree}
      />

      <View
        pointerEvents="none"
        style={styles.bgCircleOne}
      />

      <View
        pointerEvents="none"
        style={styles.bgCircleTwo}
      />

      <ScrollView
        contentContainerStyle={
          styles.scrollContainer
        }
        showsVerticalScrollIndicator={
          false
        }
        keyboardShouldPersistTaps="handled"
      >
        <View
          style={
            styles.logoWrapper
          }
        >
          <Text style={styles.logo}>
            Trio
          </Text>
        </View>

        <View
          style={
            styles.cardWrapper
          }
        >
          <View style={styles.card}>
            <Text
              style={styles.title}
            >
              Login to Trio
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#BFC6D4"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={setEmail}
              editable={!isSigningIn}
            />

            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#BFC6D4"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              editable={!isSigningIn}
              onSubmitEditing={
                handleSignIn
              }
            />

            <Pressable
              style={[
                styles.loginButton,
                isSigningIn &&
                  styles.buttonDisabled,
              ]}
              onPress={
                handleSignIn
              }
              disabled={
                isSigningIn
              }
            >
              <Text
                style={
                  styles.loginButtonText
                }
              >
                {isSigningIn
                  ? 'Signing in...'
                  : 'Login'}
              </Text>
            </Pressable>

            <TouchableOpacity
              style={
                styles.forgotPassword
              }
              disabled={
                isSigningIn
              }
            >
              <Text
                style={
                  styles.forgotPasswordText
                }
              >
                Forgot Password?
              </Text>
            </TouchableOpacity>

            <View
              style={styles.signUpRow}
            >
              <Text
                style={
                  styles.signUpText
                }
              >
                Don&apos;t have an
                account?
              </Text>

              <TouchableOpacity
                disabled={
                  isSigningIn
                }
                onPress={() =>
                  navigation.navigate(
                    'SignUp'
                  )
                }
              >
                <Text
                  style={
                    styles.signUpLink
                  }
                >
                  {' '}
                  Sign Up
                </Text>
              </TouchableOpacity>
            </View>

            <Text
              style={styles.orText}
            >
              Or
            </Text>

            <TouchableOpacity
              style={[
                styles.socialButton,
                styles.googleButton,
                isSigningIn &&
                  styles.buttonDisabled,
              ]}
              onPress={
                handleGoogleSignIn
              }
              activeOpacity={0.8}
              disabled={
                isSigningIn ||
                !request
              }
            >
              <Ionicons
                name="logo-google"
                size={20}
                color="#FFFFFF"
              />

              <Text
                style={
                  styles.socialButtonText
                }
              >
                Sign in with Google
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.socialButton,
                styles.facebookButton,
              ]}
              onPress={
                handleFacebookSignIn
              }
              activeOpacity={0.8}
              disabled={
                isSigningIn
              }
            >
              <Ionicons
                name="logo-facebook"
                size={20}
                color="#FFFFFF"
              />

              <Text
                style={
                  styles.socialButtonText
                }
              >
                Sign in with Facebook
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {user &&
          !loginAnimationVisible && (
            <View
              style={
                styles.userBox
              }
            >
              <Text
                style={
                  styles.userText
                }
              >
                Welcome, {user.email}
              </Text>
            </View>
          )}
      </ScrollView>

      {loginAnimationVisible && (
        <Animated.View
          style={[
            styles.successOverlay,
            {
              opacity:
                overlayOpacity,
            },
          ]}
        >
          <LinearGradient
            colors={[
              '#071D50',
              '#043A8D',
              '#006FE8',
              '#031636',
              '#00040C',
            ]}
            locations={[
              0,
              0.27,
              0.5,
              0.77,
              1,
            ]}
            style={
              styles.successGradient
            }
          >
            <View
              pointerEvents="none"
              style={
                styles.successTopGlow
              }
            />

            <View
              pointerEvents="none"
              style={
                styles.successBottomGlow
              }
            />

            <Animated.View
              pointerEvents="none"
              style={[
                styles.successLogoGlow,
                {
                  opacity:
                    glowOpacity,

                  transform: [
                    {
                      scale:
                        glowScale,
                    },
                  ],
                },
              ]}
            />

            <Animated.View
              style={[
                styles.successLogoCircle,
                {
                  opacity:
                    logoOpacity,

                  transform: [
                    {
                      translateY:
                        logoTranslateY,
                    },
                    {
                      scale:
                        logoScale,
                    },
                  ],
                },
              ]}
            >
              <Image
                source={require('../assets/trio-logo.png')}
                style={
                  styles.successLogo
                }
                resizeMode="cover"
              />
            </Animated.View>

            <Animated.View
              style={[
                styles.successTextArea,
                {
                  opacity:
                    welcomeOpacity,

                  transform: [
                    {
                      translateY:
                        welcomeTranslateY,
                    },
                  ],
                },
              ]}
            >
              <Text
                style={
                  styles.welcomeSmall
                }
              >
                WELCOME TO
              </Text>

              <Text
                style={
                  styles.welcomeTitle
                }
              >
                TRIO
              </Text>

              <Animated.View
                style={[
                  styles.welcomeLine,
                  {
                    transform: [
                      {
                        scaleX:
                          lineScale,
                      },
                    ],
                  },
                ]}
              />

              <Text
                style={
                  styles.welcomeTagline
                }
              >
                THINK • CALCULATE • WIN
              </Text>
            </Animated.View>
          </LinearGradient>
        </Animated.View>
      )}
    </LinearGradient>
  );
};

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
    },

    scrollContainer: {
      flexGrow: 1,
      justifyContent:
        'center',
      paddingHorizontal: 20,
      paddingVertical: 30,
    },

    logoWrapper: {
      alignItems:
        'center',
      marginBottom: 30,
    },

    logo: {
      fontSize: 42,
      fontWeight: '800',
      color: '#FFFFFF',
    },

    cardWrapper: {
      justifyContent:
        'center',
    },

    card: {
      backgroundColor:
        'rgba(35, 56, 125, 0.34)',
      borderRadius: 28,
      padding: 24,
      borderWidth: 1,
      borderColor:
        'rgba(255,255,255,0.10)',
    },

    title: {
      fontSize: 30,
      fontWeight: '800',
      color: '#FFFFFF',
      textAlign: 'center',
      marginBottom: 24,
    },

    input: {
      backgroundColor: '#FFFFFF',
      color: '#111827',
      borderRadius: 12,
      padding: 14,
      marginBottom: 12,
    },

    loginButton: {
      backgroundColor: '#38D67A',
      padding: 15,
      borderRadius: 12,
      alignItems: 'center',
      marginTop: 10,
    },

    loginButtonText: {
      color: '#FFFFFF',
      fontWeight: '700',
    },

    buttonDisabled: {
      opacity: 0.58,
    },

    forgotPassword: {
      alignItems:
        'center',
      marginTop: 12,
    },

    forgotPasswordText: {
      color: '#CCCCCC',
    },

    signUpRow: {
      flexDirection: 'row',
      justifyContent:
        'center',
      marginTop: 14,
    },

    signUpText: {
      color: '#CCCCCC',
    },

    signUpLink: {
      color: '#38D67A',
      fontWeight: '700',
    },

    orText: {
      textAlign: 'center',
      marginVertical: 12,
      color: '#FFFFFF',
    },

    socialButton: {
      flexDirection: 'row',
      justifyContent:
        'center',
      alignItems: 'center',
      padding: 14,
      borderRadius: 12,
      marginTop: 10,
      borderWidth: 1,
    },

    googleButton: {
      backgroundColor: '#DB4437',
      borderColor: '#DB4437',
    },

    facebookButton: {
      backgroundColor: '#1877F2',
      borderColor: '#1877F2',
    },

    socialButtonText: {
      color: '#FFFFFF',
      marginLeft: 8,
      fontWeight: '700',
    },

    userBox: {
      marginTop: 20,
      alignItems: 'center',
    },

    userText: {
      color: '#38D67A',
    },

    bgGlowOne: {
      position: 'absolute',
      top: 120,
      left: -40,
      width: 260,
      height: 260,
      borderRadius: 130,
      backgroundColor:
        'rgba(0,132,255,0.14)',
    },

    bgGlowTwo: {
      position: 'absolute',
      top: 260,
      right: -60,
      width: 260,
      height: 260,
      borderRadius: 130,
      backgroundColor:
        'rgba(54,110,255,0.15)',
    },

    bgGlowThree: {
      position: 'absolute',
      bottom: 120,
      left: 30,
      width: 220,
      height: 220,
      borderRadius: 110,
      backgroundColor:
        'rgba(0,214,255,0.08)',
    },

    bgCircleOne: {
      position: 'absolute',
      top: 170,
      right: 35,
      width: 180,
      height: 180,
      borderRadius: 90,
      borderWidth: 2,
      borderColor:
        'rgba(49,97,255,0.22)',
    },

    bgCircleTwo: {
      position: 'absolute',
      bottom: 180,
      left: 45,
      width: 220,
      height: 220,
      borderRadius: 110,
      borderWidth: 2,
      borderColor:
        'rgba(0,163,255,0.14)',
    },

    successOverlay: {
      ...StyleSheet.absoluteFillObject,
      zIndex: 999,
      elevation: 999,
    },

    successGradient: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },

    successTopGlow: {
      position: 'absolute',
      top: -170,
      right: -140,
      width: 430,
      height: 430,
      borderRadius: 215,
      backgroundColor:
        'rgba(0,198,255,0.16)',
    },

    successBottomGlow: {
      position: 'absolute',
      bottom: -180,
      left: -140,
      width: 430,
      height: 430,
      borderRadius: 215,
      backgroundColor:
        'rgba(0,114,255,0.14)',
    },

    successLogoGlow: {
      position: 'absolute',
      width: 275,
      height: 275,
      borderRadius: 138,
      backgroundColor:
        'rgba(52,188,255,0.27)',
    },

    successLogoCircle: {
      width: 220,
      height: 220,
      borderRadius: 110,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      backgroundColor: '#FFFFFF',
      borderWidth: 3,
      borderColor:
        'rgba(176,232,255,0.95)',
      shadowColor: '#00C6FF',
      shadowOffset: {
        width: 0,
        height: 0,
      },
      shadowOpacity: 0.7,
      shadowRadius: 23,
      elevation: 15,
    },

    successLogo: {
      width: '100%',
      height: '100%',
      borderRadius: 110,
    },

    successTextArea: {
      alignItems: 'center',
      marginTop: 28,
    },

    welcomeSmall: {
      color:
        'rgba(182,230,255,0.84)',
      fontSize: 12,
      fontWeight: '800',
      letterSpacing: 4,
    },

    welcomeTitle: {
      color: '#FFFFFF',
      fontSize: 40,
      lineHeight: 48,
      fontWeight: '900',
      letterSpacing: 4,
      marginTop: 5,
      textShadowColor:
        'rgba(0,198,255,0.42)',
      textShadowOffset: {
        width: 0,
        height: 3,
      },
      textShadowRadius: 12,
    },

    welcomeLine: {
      width: 145,
      height: 2,
      borderRadius: 2,
      backgroundColor:
        '#00C6FF',
      marginTop: 8,
      marginBottom: 13,
    },

    welcomeTagline: {
      color:
        'rgba(255,255,255,0.78)',
      fontSize: 10,
      fontWeight: '900',
      letterSpacing: 2,
    },
  });

export default Home;
