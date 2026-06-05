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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../firebase';

const EditProfile = ({ navigation }) => {
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [avatar, setAvatar] = useState(require('../assets/avatar.png'));

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      const savedProfile = await AsyncStorage.getItem('userProfile');

      if (savedProfile) {
        const profileData = JSON.parse(savedProfile);

        if (profileData.name) setName(profileData.name);
        if (profileData.bio) setBio(profileData.bio);
        if (profileData.birthDate) setBirthDate(profileData.birthDate);
        if (profileData.profileImage) {
          setAvatar({ uri: profileData.profileImage });
        }
      }
    } catch (error) {
      console.log('Profile load error:', error);
    }
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
      quality: 0.8,
    });

    if (!result.canceled) {
      const selectedImage = result.assets[0].uri;

      setAvatar({ uri: selectedImage });

      await AsyncStorage.setItem('profileImage', selectedImage);
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

  const handleSave = async () => {
    Keyboard.dismiss();

    try {
      let profileImage = '';

      if (avatar && avatar.uri) {
        profileImage = avatar.uri;
      } else {
        const savedImage = await AsyncStorage.getItem('profileImage');
        profileImage = savedImage || '';
      }

      const profileData = {
        name,
        bio,
        birthDate,
        profileImage,
        email: auth.currentUser?.email || '',
      };

      await AsyncStorage.setItem('userProfile', JSON.stringify(profileData));

      Alert.alert(
        'Profile Updated',
        `Name: ${name}\nBio: ${bio}\nBirth Date: ${
          birthDate ? birthDate : 'Not set'
        }`
      );

      navigation.goBack();
    } catch (error) {
      console.log('Profile save error:', error);
      Alert.alert('Error', 'Profile could not be saved.');
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <LinearGradient
        colors={['#00c6ff', '#0072ff', '#000']}
        style={styles.container}
      >
        <Text style={styles.title}>Edit Profile</Text>

        <TouchableOpacity onPress={pickImage} style={styles.avatarWrapper}>
          <Image source={avatar} style={styles.avatar} />

          <View style={styles.cameraIcon}>
            <Ionicons name="camera" size={20} color="#fff" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.changePhotoButton} onPress={pickImage}>
          <Ionicons name="image-outline" size={18} color="#fff" />
          <Text style={styles.buttonText}>  Change Profile Photo</Text>
        </TouchableOpacity>

        <Text style={styles.label}>Username</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your name"
          placeholderTextColor="#ccc"
          value={name}
          onChangeText={setName}
          returnKeyType="done"
          onSubmitEditing={Keyboard.dismiss}
        />

        <Text style={styles.label}>Bio</Text>
        <TextInput
          style={[styles.input, { height: 80 }]}
          placeholder="Tell us about yourself"
          placeholderTextColor="#ccc"
          multiline
          value={bio}
          onChangeText={setBio}
          returnKeyType="done"
          blurOnSubmit={true}
          onSubmitEditing={Keyboard.dismiss}
        />

        <TouchableOpacity style={styles.dateButton} onPress={showDatePicker}>
          <Ionicons name="calendar" size={20} color="#fff" />
          <Text style={styles.buttonText}>
            {'  '}
            {birthDate ? birthDate : 'Select Birth Date'}
          </Text>
        </TouchableOpacity>

        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="date"
          onConfirm={handleConfirm}
          onCancel={hideDatePicker}
        />

        <TouchableOpacity style={styles.button} onPress={handleSave}>
          <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
          <Text style={styles.buttonText}>  Save Changes</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#95a5a6' }]}
          onPress={() => {
            Keyboard.dismiss();
            navigation.goBack();
          }}
        >
          <Ionicons name="arrow-back" size={20} color="#fff" />
          <Text style={styles.buttonText}>  Cancel</Text>
        </TouchableOpacity>
      </LinearGradient>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  title: {
    fontSize: 45,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 30,
    fontFamily: 'pacifico',
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },

  avatarWrapper: {
    position: 'relative',
    marginBottom: 12,
  },

  avatar: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 3,
    borderColor: '#1abc9c',
  },

  cameraIcon: {
    position: 'absolute',
    right: 5,
    bottom: 5,
    backgroundColor: '#1abc9c',
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },

  changePhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16a085',
    padding: 12,
    borderRadius: 25,
    width: '80%',
    justifyContent: 'center',
    marginBottom: 20,
  },

  label: {
    color: '#ecf0f1',
    fontSize: 16,
    marginBottom: 10,
    alignSelf: 'flex-start',
  },

  input: {
    width: '100%',
    padding: 15,
    marginBottom: 20,
    borderRadius: 25,
    backgroundColor: '#34495E',
    borderColor: '#7f8c8d',
    borderWidth: 1,
    fontSize: 16,
    color: '#ecf0f1',
  },

  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1abc9c',
    padding: 15,
    borderRadius: 25,
    width: '80%',
    justifyContent: 'center',
    marginVertical: 10,
  },

  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2980b9',
    padding: 15,
    borderRadius: 25,
    width: '80%',
    justifyContent: 'center',
    marginVertical: 10,
  },

  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EditProfile;