import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import * as ImagePicker from 'expo-image-picker';
import { auth, db, storage } from '../firebase';

import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  collection,
  getDocs,
} from 'firebase/firestore';

import {
  ref,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage';

const EditProfile = ({ navigation }) => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [avatar, setAvatar] = useState(require('../assets/avatar.png'));
  const [profileImage, setProfileImage] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    loadProfileData();

    const loadDarkMode = async () => {
      try {
        const savedDarkMode = await AsyncStorage.getItem('trioDarkMode');
        setIsDarkMode(savedDarkMode === 'true');
      } catch (error) {
        console.log('Dark mode load error:', error);
      }
    };

    loadDarkMode();

    const unsubscribeFocus = navigation.addListener('focus', () => {
      loadDarkMode();
      loadProfileData();
    });

    return unsubscribeFocus;
  }, [navigation]);

  const loadProfileData = async () => {
    const currentUser = auth.currentUser;

    if (!currentUser) return;

    try {
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));

      if (userDoc.exists()) {
        const data = userDoc.data();

        if (data.name) setName(data.name);
        if (data.username) setUsername(data.username);
        if (data.bio) setBio(data.bio);
        if (data.birthDate) setBirthDate(data.birthDate);

        if (data.profileImage) {
          setProfileImage(data.profileImage);
          setAvatar({ uri: data.profileImage });
        }
      }
    } catch (error) {
      console.log('Profile load error:', error);
    }
  };

  const uploadProfileImage = async (imageUri) => {
    const currentUser = auth.currentUser;

    if (!currentUser) return '';

    const response = await fetch(imageUri);
    const blob = await response.blob();

    const imageRef = ref(
      storage,
      `profileImages/${currentUser.uid}.jpg`
    );

    await uploadBytes(imageRef, blob);

    const downloadURL = await getDownloadURL(imageRef);

    return downloadURL;
  };

  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'Please allow access to your photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      const selectedImage = result.assets[0].uri;

      setProfileImage(selectedImage);
      setAvatar({ uri: selectedImage });
    }
  };

  const showDatePicker = () => {
    Keyboard.dismiss();
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = (date) => {
    setBirthDate(date.toDateString());
    hideDatePicker();
  };

  const updateFriendsCopies = async (profileData) => {
    const currentUser = auth.currentUser;

    if (!currentUser) return;

    const friendsSnapshot = await getDocs(
      collection(db, 'users', currentUser.uid, 'friends')
    );

    const updatePromises = friendsSnapshot.docs.map((friendDoc) => {
      const friendId = friendDoc.id;

      return setDoc(
        doc(db, 'users', friendId, 'friends', currentUser.uid),
        {
          uid: currentUser.uid,
          name: profileData.name,
          username: profileData.username,
          email: profileData.email,
          profileImage: profileData.profileImage,
          avatar: profileData.profileImage,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    });

    await Promise.all(updatePromises);
  };

  const handleSave = async () => {
    Keyboard.dismiss();

    const currentUser = auth.currentUser;

    if (!currentUser) {
      Alert.alert('Login Required', 'Please login first.');
      return;
    }

    try {
      let finalProfileImage = profileImage;

      if (
        profileImage &&
        !profileImage.startsWith('https://') &&
        !profileImage.startsWith('http://')
      ) {
        finalProfileImage = await uploadProfileImage(profileImage);
      }

      const profileData = {
        uid: currentUser.uid,
        name,
        username: username.trim().toLowerCase(),
        bio,
        birthDate,
        email: currentUser.email || '',
        profileImage: finalProfileImage,
        avatar: finalProfileImage,
        updatedAt: serverTimestamp(),
      };

      await setDoc(
        doc(db, 'users', currentUser.uid),
        profileData,
        { merge: true }
      );

      await updateFriendsCopies(profileData);

      Alert.alert('Profile Updated', 'Your profile has been saved.');
      navigation.goBack();
    } catch (error) {
      console.log('Profile save error:', error);
      Alert.alert('Error', 'Profile could not be saved.');
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <LinearGradient
        colors={
          isDarkMode
            ? ['#010814', '#002454', '#034B6A']
            : ['#041b3d', '#0072ff', '#00c6ff']
        }
        style={styles.container}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.headerArea}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => {
                Keyboard.dismiss();
                navigation.goBack();
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="arrow-back" size={23} color="#FFFFFF" />
            </TouchableOpacity>

            <Text style={styles.title}>Edit Profile</Text>
            <Text style={styles.subtitle}>
              Update your TRIO player profile
            </Text>
          </View>

          <View
            style={[
              styles.profileCard,
              isDarkMode && styles.profileCardDark,
            ]}
          >
            <TouchableOpacity
              onPress={pickImage}
              style={styles.avatarWrapper}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={
                  isDarkMode
                    ? ['#0B3359', '#061629']
                    : ['#19C6FF', '#006CE7']
                }
                style={styles.avatarGlow}
              >
                <Image source={avatar} style={styles.avatar} />
              </LinearGradient>

              <View style={styles.cameraIcon}>
                <Ionicons name="camera" size={19} color="#FFFFFF" />
              </View>
            </TouchableOpacity>

            <Text style={styles.photoTitle}>Profile Photo</Text>
            <Text style={styles.photoHint}>
              Tap the photo or button below to choose a new image
            </Text>

            <TouchableOpacity
              style={[
                styles.changePhotoButton,
                isDarkMode && styles.changePhotoButtonDark,
              ]}
              onPress={pickImage}
              activeOpacity={0.84}
            >
              <Ionicons name="image-outline" size={18} color="#FFFFFF" />
              <Text style={styles.changePhotoText}>
                Change Profile Photo
              </Text>
            </TouchableOpacity>
          </View>

          <View
            style={[
              styles.formCard,
              isDarkMode && styles.formCardDark,
            ]}
          >
            <Text
              style={[
                styles.sectionTitle,
                isDarkMode && styles.sectionTitleDark,
              ]}
            >
              Profile Details
            </Text>

            <Text style={styles.label}>Name</Text>
            <View
              style={[
                styles.inputWrapper,
                isDarkMode && styles.inputWrapperDark,
              ]}
            >
              <Ionicons
                name="person-outline"
                size={20}
                color={isDarkMode ? '#59C8FF' : '#0072FF'}
              />
              <TextInput
                style={[
                  styles.input,
                  isDarkMode && styles.inputDark,
                ]}
                placeholder="Enter your name"
                placeholderTextColor={isDarkMode ? '#70879F' : '#8B9BAD'}
                value={name}
                onChangeText={setName}
                returnKeyType="done"
                onSubmitEditing={Keyboard.dismiss}
              />
            </View>

            <Text style={styles.label}>Username</Text>
            <View
              style={[
                styles.inputWrapper,
                isDarkMode && styles.inputWrapperDark,
              ]}
            >
              <Ionicons
                name="at-outline"
                size={20}
                color={isDarkMode ? '#59C8FF' : '#0072FF'}
              />
              <TextInput
                style={[
                  styles.input,
                  isDarkMode && styles.inputDark,
                ]}
                placeholder="Enter username"
                placeholderTextColor={isDarkMode ? '#70879F' : '#8B9BAD'}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                returnKeyType="done"
                onSubmitEditing={Keyboard.dismiss}
              />
            </View>

            <Text style={styles.label}>Bio</Text>
            <View
              style={[
                styles.inputWrapper,
                styles.bioWrapper,
                isDarkMode && styles.inputWrapperDark,
              ]}
            >
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={20}
                color={isDarkMode ? '#59C8FF' : '#0072FF'}
                style={styles.bioIcon}
              />
              <TextInput
                style={[
                  styles.input,
                  styles.bioInput,
                  isDarkMode && styles.inputDark,
                ]}
                placeholder="Tell us about yourself"
                placeholderTextColor={isDarkMode ? '#70879F' : '#8B9BAD'}
                multiline
                value={bio}
                onChangeText={setBio}
                textAlignVertical="top"
                returnKeyType="done"
                blurOnSubmit={true}
                onSubmitEditing={Keyboard.dismiss}
              />
            </View>

            <Text style={styles.label}>Birth Date</Text>
            <TouchableOpacity
              style={[
                styles.dateButton,
                isDarkMode && styles.dateButtonDark,
              ]}
              onPress={showDatePicker}
              activeOpacity={0.84}
            >
              <Ionicons
                name="calendar-outline"
                size={20}
                color={isDarkMode ? '#59C8FF' : '#0072FF'}
              />
              <Text
                style={[
                  styles.dateText,
                  !birthDate && styles.datePlaceholder,
                  isDarkMode && styles.dateTextDark,
                ]}
              >
                {birthDate ? birthDate : 'Select Birth Date'}
              </Text>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={isDarkMode ? '#70879F' : '#8B9BAD'}
              />
            </TouchableOpacity>
          </View>

          <DateTimePickerModal
            isVisible={isDatePickerVisible}
            mode="date"
            onConfirm={handleConfirm}
            onCancel={hideDatePicker}
          />

          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            activeOpacity={0.86}
          >
            <LinearGradient
              colors={
                isDarkMode
                  ? ['#0E7FA5', '#07537A']
                  : ['#00C6FF', '#0072FF']
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.saveGradient}
            >
              <Ionicons
                name="checkmark-circle-outline"
                size={21}
                color="#FFFFFF"
              />
              <Text style={styles.buttonText}>Save Changes</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.cancelButton,
              isDarkMode && styles.cancelButtonDark,
            ]}
            onPress={() => {
              Keyboard.dismiss();
              navigation.goBack();
            }}
            activeOpacity={0.82}
          >
            <Ionicons
              name="close-circle-outline"
              size={20}
              color="#FFFFFF"
            />
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </ScrollView>
      </LinearGradient>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 55,
    paddingBottom: 45,
    alignItems: 'center',
  },

  headerArea: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 24,
  },

  backButton: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.13)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },

  title: {
    fontSize: 38,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'pacifico',
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 5,
  },

  subtitle: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
  },

  profileCard: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 28,
    paddingVertical: 24,
    paddingHorizontal: 18,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.23)',
  },

  profileCardDark: {
    backgroundColor: 'rgba(0,12,34,0.90)',
    borderColor: 'rgba(255,255,255,0.08)',
  },

  avatarWrapper: {
    position: 'relative',
    marginBottom: 13,
  },

  avatarGlow: {
    width: 142,
    height: 142,
    borderRadius: 71,
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatar: {
    width: 134,
    height: 134,
    borderRadius: 67,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },

  cameraIcon: {
    position: 'absolute',
    right: 2,
    bottom: 5,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#9B59B6',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },

  photoTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },

  photoHint: {
    maxWidth: 280,
    color: 'rgba(255,255,255,0.66)',
    fontSize: 12,
    lineHeight: 17,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 15,
  },

  changePhotoButton: {
    minHeight: 44,
    paddingHorizontal: 20,
    borderRadius: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(155,89,182,0.92)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },

  changePhotoButtonDark: {
    backgroundColor: 'rgba(122,67,145,0.75)',
  },

  changePhotoText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    marginLeft: 8,
  },

  formCard: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: 25,
    padding: 18,
    marginBottom: 18,
  },

  formCardDark: {
    backgroundColor: 'rgba(0,12,34,0.96)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },

  sectionTitle: {
    color: '#041B3D',
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 18,
  },

  sectionTitleDark: {
    color: '#FFFFFF',
  },

  label: {
    width: '100%',
    color: '#6B7A8C',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 7,
    marginLeft: 2,
  },

  inputWrapper: {
    width: '100%',
    minHeight: 52,
    borderRadius: 17,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    marginBottom: 16,
    backgroundColor: '#F2F7FC',
    borderWidth: 1,
    borderColor: '#DDE8F2',
  },

  inputWrapperDark: {
    backgroundColor: 'rgba(0,25,62,0.88)',
    borderColor: 'rgba(255,255,255,0.09)',
  },

  input: {
    flex: 1,
    color: '#1F2D3D',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 10,
    paddingVertical: 0,
  },

  inputDark: {
    color: '#FFFFFF',
  },

  bioWrapper: {
    minHeight: 100,
    alignItems: 'flex-start',
    paddingTop: 15,
  },

  bioIcon: {
    marginTop: 1,
  },

  bioInput: {
    minHeight: 76,
    paddingTop: 0,
  },

  dateButton: {
    width: '100%',
    minHeight: 52,
    borderRadius: 17,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    backgroundColor: '#F2F7FC',
    borderWidth: 1,
    borderColor: '#DDE8F2',
  },

  dateButtonDark: {
    backgroundColor: 'rgba(0,25,62,0.88)',
    borderColor: 'rgba(255,255,255,0.09)',
  },

  dateText: {
    flex: 1,
    color: '#1F2D3D',
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 10,
  },

  dateTextDark: {
    color: '#FFFFFF',
  },

  datePlaceholder: {
    color: '#8B9BAD',
    fontWeight: '600',
  },

  saveButton: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: '#0072FF',
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.26,
    shadowRadius: 12,
    elevation: 8,
  },

  saveGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  cancelButton: {
    width: '100%',
    height: 54,
    borderRadius: 27,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(80,97,115,0.78)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
  },

  cancelButtonDark: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderColor: 'rgba(255,255,255,0.10)',
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    marginLeft: 8,
  },
});

export default EditProfile;