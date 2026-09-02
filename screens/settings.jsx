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
  ScrollView,
  TextInput,
  ActivityIndicator,
} from 'react-native';

import {
  LinearGradient,
} from 'expo-linear-gradient';

import {
  Ionicons,
} from '@expo/vector-icons';

import {
  signOut,
  deleteUser,
} from 'firebase/auth';

import {
  collection,
  query,
  where,
  getDocs,
  doc,
  deleteDoc,
  writeBatch,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';

import {
  ref,
  deleteObject,
} from 'firebase/storage';

import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  auth,
  db,
  storage,
} from '../firebase';

const DELETE_REASONS = [
  'I no longer use TRIO',
  'I created another account',
  'Technical issues',
  'Privacy concerns',
  'I do not enjoy the game anymore',
  'Too many notifications',
  'Other',
];

export default function SettingsScreen({
  navigation,
}) {
  const [
    isDarkMode,
    setIsDarkMode,
  ] = useState(false);

  const [
    showDeleteForm,
    setShowDeleteForm,
  ] = useState(false);

  const [
    emailConfirmation,
    setEmailConfirmation,
  ] = useState('');

  const [
    selectedReason,
    setSelectedReason,
  ] = useState('');

  const [
    feedback,
    setFeedback,
  ] = useState('');

  const [
    understandsDeletion,
    setUnderstandsDeletion,
  ] = useState(false);

  const [
    isDeleting,
    setIsDeleting,
  ] = useState(false);

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

    const unsubscribeFocus =
      navigation.addListener(
        'focus',
        loadDarkMode
      );

    return unsubscribeFocus;
  }, [navigation]);

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

  const resetDeleteForm = () => {
    setEmailConfirmation('');
    setSelectedReason('');
    setFeedback('');
    setUnderstandsDeletion(false);
    setShowDeleteForm(false);
  };

  const deleteDocumentRefs =
    async (documentRefs) => {
      const uniqueRefs = [];
      const seenPaths =
        new Set();

      documentRefs.forEach(
        (documentRef) => {
          if (
            !documentRef ||
            seenPaths.has(
              documentRef.path
            )
          ) {
            return;
          }

          seenPaths.add(
            documentRef.path
          );

          uniqueRefs.push(
            documentRef
          );
        }
      );

      const batchSize = 400;

      for (
        let index = 0;
        index < uniqueRefs.length;
        index += batchSize
      ) {
        const batch =
          writeBatch(db);

        uniqueRefs
          .slice(
            index,
            index + batchSize
          )
          .forEach(
            (documentRef) => {
              batch.delete(
                documentRef
              );
            }
          );

        await batch.commit();
      }
    };

  const deleteFriendConnections =
    async (userId) => {
      const friendsSnapshot =
        await getDocs(
          collection(
            db,
            'users',
            userId,
            'friends'
          )
        );

      const refs = [];

      friendsSnapshot.docs.forEach(
        (friendDocument) => {
          const friendData =
            friendDocument.data();

          const friendId =
            friendData.uid ||
            friendDocument.id;

          refs.push(
            friendDocument.ref
          );

          if (friendId) {
            refs.push(
              doc(
                db,
                'users',
                friendId,
                'friends',
                userId
              )
            );
          }
        }
      );

      await deleteDocumentRefs(
        refs
      );
    };

  const deleteFriendRequests =
    async (userId) => {
      const [
        sent,
        received,
      ] = await Promise.all([
        getDocs(
          query(
            collection(
              db,
              'friendRequests'
            ),
            where(
              'fromUserId',
              '==',
              userId
            )
          )
        ),

        getDocs(
          query(
            collection(
              db,
              'friendRequests'
            ),
            where(
              'toUserId',
              '==',
              userId
            )
          )
        ),
      ]);

      await deleteDocumentRefs([
        ...sent.docs.map(
          (item) => item.ref
        ),

        ...received.docs.map(
          (item) => item.ref
        ),
      ]);
    };

  const deleteGameInvites =
    async (userId) => {
      const [
        sent,
        received,
      ] = await Promise.all([
        getDocs(
          query(
            collection(
              db,
              'gameInvites'
            ),
            where(
              'fromUserId',
              '==',
              userId
            )
          )
        ),

        getDocs(
          query(
            collection(
              db,
              'gameInvites'
            ),
            where(
              'toUserId',
              '==',
              userId
            )
          )
        ),
      ]);

      await deleteDocumentRefs([
        ...sent.docs.map(
          (item) => item.ref
        ),

        ...received.docs.map(
          (item) => item.ref
        ),
      ]);
    };

  const deleteUserChats =
    async (userId) => {
      const chatsSnapshot =
        await getDocs(
          query(
            collection(
              db,
              'chats'
            ),
            where(
              'users',
              'array-contains',
              userId
            )
          )
        );

      for (
        const chatDocument
        of chatsSnapshot.docs
      ) {
        const messagesSnapshot =
          await getDocs(
            collection(
              db,
              'chats',
              chatDocument.id,
              'messages'
            )
          );

        await deleteDocumentRefs(
          messagesSnapshot.docs.map(
            (messageDocument) =>
              messageDocument.ref
          )
        );

        await deleteDoc(
          chatDocument.ref
        );
      }
    };

  const deleteProfileImage =
    async (userId) => {
      try {
        await deleteObject(
          ref(
            storage,
            `profileImages/${userId}.jpg`
          )
        );
      } catch (error) {
        if (
          error?.code !==
          'storage/object-not-found'
        ) {
          console.log(
            'Profile image delete error:',
            error
          );
        }
      }
    };

  const saveDeletionFeedback =
    async () => {
      try {
        await addDoc(
          collection(
            db,
            'accountDeletionFeedback'
          ),
          {
            reason:
              selectedReason,

            feedback:
              feedback.trim(),

            createdAt:
              serverTimestamp(),
          }
        );
      } catch (error) {
        console.log(
          'Deletion feedback save error:',
          error
        );
      }
    };

  const validateDeleteForm =
    () => {
      const currentUser =
        auth.currentUser;

      if (!currentUser) {
        Alert.alert(
          'Account Error',
          'No signed-in TRIO account was found.'
        );

        return false;
      }

      const enteredEmail =
        emailConfirmation
          .trim()
          .toLowerCase();

      const currentEmail =
        currentUser.email
          ?.trim()
          .toLowerCase();

      if (!enteredEmail) {
        Alert.alert(
          'Email Required',
          'Please enter the email address connected to your TRIO account.'
        );

        return false;
      }

      if (
        currentEmail &&
        enteredEmail !==
          currentEmail
      ) {
        Alert.alert(
          'Email Does Not Match',
          'The email address you entered does not match the signed-in TRIO account.'
        );

        return false;
      }

      if (!selectedReason) {
        Alert.alert(
          'Reason Required',
          'Please select why you are deleting your TRIO account.'
        );

        return false;
      }

      if (!understandsDeletion) {
        Alert.alert(
          'Confirmation Required',
          'Please confirm that you understand account deletion is permanent.'
        );

        return false;
      }

      return true;
    };

  const performDeleteAccount =
    async () => {
      if (
        !validateDeleteForm() ||
        isDeleting
      ) {
        return;
      }

      Alert.alert(
        'Delete TRIO Account?',
        'Your account, profile, friends, messages and related account data will be permanently deleted. This cannot be undone.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },

          {
            text: 'Delete Permanently',
            style: 'destructive',

            onPress: async () => {
              const currentUser =
                auth.currentUser;

              if (!currentUser) {
                Alert.alert(
                  'Account Error',
                  'No signed-in TRIO account was found.'
                );

                return;
              }

              try {
                setIsDeleting(
                  true
                );

                const userId =
                  currentUser.uid;

                await saveDeletionFeedback();

                await deleteFriendConnections(
                  userId
                );

                await deleteFriendRequests(
                  userId
                );

                await deleteGameInvites(
                  userId
                );

                await deleteUserChats(
                  userId
                );

                await deleteProfileImage(
                  userId
                );

                await deleteDoc(
                  doc(
                    db,
                    'users',
                    userId
                  )
                );

                await deleteUser(
                  currentUser
                );

                setIsDeleting(
                  false
                );

                Alert.alert(
                  'Account Deleted',
                  'Your TRIO account has been permanently deleted.',
                  [
                    {
                      text: 'OK',

                      onPress:
                        () => {
                          navigation
                            .getParent()
                            ?.reset({
                              index: 0,

                              routes: [
                                {
                                  name:
                                    'Home',
                                },
                              ],
                            });
                        },
                    },
                  ]
                );
              } catch (error) {
                console.log(
                  'Delete account error:',
                  error
                );

                setIsDeleting(
                  false
                );

                if (
                  error?.code ===
                  'auth/requires-recent-login'
                ) {
                  Alert.alert(
                    'Sign In Again',
                    'For security, please log out and sign in again, then return to Settings and delete your account.'
                  );

                  return;
                }

                Alert.alert(
                  'Delete Account Error',
                  error?.message ||
                    'Your account could not be deleted. Please try again.'
                );
              }
            },
          },
        ]
      );
    };

  /*
   * Delete Account ayrı bir navigation route değildir.
   * Aynı Settings ekranının içinde ikinci görünüm açılır.
   */
  if (showDeleteForm) {
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
                '#063C7A',
                '#003271',
                '#00152F',
                '#000000',
              ]
        }
        style={
          styles.container
        }
      >
        <ScrollView
          contentContainerStyle={
            styles.deleteScrollContent
          }
          showsVerticalScrollIndicator={
            false
          }
          keyboardShouldPersistTaps="handled"
        >
          <View
            style={
              styles.deleteHeader
            }
          >
            <TouchableOpacity
              style={
                styles.backButton
              }
              onPress={
                resetDeleteForm
              }
              activeOpacity={0.8}
              disabled={
                isDeleting
              }
            >
              <Ionicons
                name="arrow-back"
                size={23}
                color="#FFFFFF"
              />
            </TouchableOpacity>

            <View
              style={
                styles.deleteHeaderText
              }
            >
              <Text
                style={
                  styles.deleteHeaderTitle
                }
              >
                Delete Account
              </Text>

              <Text
                style={
                  styles.deleteHeaderSubtitle
                }
              >
                Permanently remove your TRIO account
              </Text>
            </View>
          </View>

          <View
            style={
              styles.warningCard
            }
          >
            <Ionicons
              name="warning-outline"
              size={28}
              color="#FF7288"
            />

            <View
              style={
                styles.warningTextArea
              }
            >
              <Text
                style={
                  styles.warningTitle
                }
              >
                This action is permanent
              </Text>

              <Text
                style={
                  styles.warningText
                }
              >
                Your profile, friends, messages and related TRIO account data will be permanently removed.
              </Text>
            </View>
          </View>

          <View
            style={
              styles.formCard
            }
          >
            <Text
              style={
                styles.sectionTitle
              }
            >
              Confirm your account
            </Text>

            <Text
              style={
                styles.sectionDescription
              }
            >
              Enter the email address connected to your current TRIO account.
            </Text>

            <View
              style={
                styles.inputWrapper
              }
            >
              <Ionicons
                name="mail-outline"
                size={19}
                color="#BBD7EA"
              />

              <TextInput
                style={
                  styles.input
                }
                placeholder="Account email"
                placeholderTextColor="#91A9BC"
                value={
                  emailConfirmation
                }
                onChangeText={
                  setEmailConfirmation
                }
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={
                  !isDeleting
                }
              />
            </View>
          </View>

          <View
            style={
              styles.formCard
            }
          >
            <Text
              style={
                styles.sectionTitle
              }
            >
              Why are you leaving?
            </Text>

            <Text
              style={
                styles.sectionDescription
              }
            >
              Select the main reason for deleting your account.
            </Text>

            {DELETE_REASONS.map(
              (reason) => {
                const selected =
                  selectedReason ===
                  reason;

                return (
                  <TouchableOpacity
                    key={
                      reason
                    }
                    style={[
                      styles.reasonButton,

                      selected &&
                        styles.reasonButtonSelected,
                    ]}
                    onPress={() =>
                      setSelectedReason(
                        reason
                      )
                    }
                    activeOpacity={0.82}
                    disabled={
                      isDeleting
                    }
                  >
                    <View
                      style={[
                        styles.radioOuter,

                        selected &&
                          styles.radioOuterSelected,
                      ]}
                    >
                      {selected && (
                        <View
                          style={
                            styles.radioInner
                          }
                        />
                      )}
                    </View>

                    <Text
                      style={[
                        styles.reasonText,

                        selected &&
                          styles.reasonTextSelected,
                      ]}
                    >
                      {reason}
                    </Text>
                  </TouchableOpacity>
                );
              }
            )}
          </View>

          <View
            style={
              styles.formCard
            }
          >
            <Text
              style={
                styles.sectionTitle
              }
            >
              Additional feedback
            </Text>

            <Text
              style={
                styles.sectionDescription
              }
            >
              Optional — tell us what we could improve.
            </Text>

            <TextInput
              style={
                styles.feedbackInput
              }
              placeholder="Tell us more..."
              placeholderTextColor="#91A9BC"
              value={
                feedback
              }
              onChangeText={
                setFeedback
              }
              multiline
              maxLength={500}
              textAlignVertical="top"
              editable={
                !isDeleting
              }
            />

            <Text
              style={
                styles.characterCount
              }
            >
              {feedback.length}/500
            </Text>
          </View>

          <View
            style={
              styles.confirmationCard
            }
          >
            <View
              style={
                styles.confirmationTextArea
              }
            >
              <Text
                style={
                  styles.confirmationTitle
                }
              >
                I understand
              </Text>

              <Text
                style={
                  styles.confirmationText
                }
              >
                Account deletion is permanent and cannot be undone.
              </Text>
            </View>

            <Switch
              value={
                understandsDeletion
              }
              onValueChange={
                setUnderstandsDeletion
              }
              disabled={
                isDeleting
              }
            />
          </View>

          <TouchableOpacity
            style={[
              styles.permanentDeleteButton,

              (
                isDeleting ||
                !emailConfirmation.trim() ||
                !selectedReason ||
                !understandsDeletion
              ) &&
                styles.permanentDeleteButtonDisabled,
            ]}
            onPress={
              performDeleteAccount
            }
            activeOpacity={0.85}
            disabled={
              isDeleting ||
              !emailConfirmation.trim() ||
              !selectedReason ||
              !understandsDeletion
            }
          >
            {isDeleting ? (
              <View
                style={
                  styles.loadingRow
                }
              >
                <ActivityIndicator
                  size="small"
                  color="#FFFFFF"
                />

                <Text
                  style={
                    styles.permanentDeleteButtonText
                  }
                >
                  Deleting Account...
                </Text>
              </View>
            ) : (
              <>
                <Ionicons
                  name="trash-outline"
                  size={20}
                  color="#FFFFFF"
                />

                <Text
                  style={
                    styles.permanentDeleteButtonText
                  }
                >
                  Permanently Delete Account
                </Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={
              styles.keepAccountButton
            }
            onPress={
              resetDeleteForm
            }
            activeOpacity={0.8}
            disabled={
              isDeleting
            }
          >
            <Text
              style={
                styles.keepAccountButtonText
              }
            >
              Keep My Account
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </LinearGradient>
    );
  }

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
              '#000000',
            ]
      }
      style={
        styles.container
      }
    >
      <ScrollView
        contentContainerStyle={
          styles.scrollContent
        }
        showsVerticalScrollIndicator={
          false
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
            value={
              isDarkMode
            }
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

        <View
          style={
            styles.dangerSection
          }
        >
          <Text
            style={
              styles.dangerTitle
            }
          >
            Account
          </Text>

          <Text
            style={
              styles.dangerDescription
            }
          >
            Permanently delete your TRIO account and associated data.
          </Text>

          <TouchableOpacity
            style={
              styles.deleteButton
            }
            onPress={() =>
              setShowDeleteForm(
                true
              )
            }
            activeOpacity={0.82}
          >
            <Text
              style={
                styles.deleteButtonText
              }
            >
              Delete Account
            </Text>

            <Text
              style={
                styles.deleteArrow
              }
            >
              ›
            </Text>
          </TouchableOpacity>
        </View>

        <View
          style={
            styles.bottomSpace
          }
        />
      </ScrollView>
    </LinearGradient>
  );
}

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
    },

    scrollContent: {
      flexGrow: 1,
      padding: 20,
      paddingBottom: 120,
    },

    deleteScrollContent: {
      flexGrow: 1,
      paddingHorizontal: 18,
      paddingTop: 54,
      paddingBottom: 120,
    },

    header: {
      fontSize: 26,
      fontWeight: 'bold',
      marginBottom: 30,
      textAlign: 'center',
      marginTop: 40,
      color: '#FFFFFF',
    },

    option: {
      flexDirection: 'row',
      justifyContent:
        'space-between',
      alignItems: 'center',
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
      color: '#FFFFFF',
      fontWeight: '600',
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
      color: '#FFFFFF',
      textAlign: 'center',
      fontSize: 17,
      fontWeight: '500',
    },

    dangerSection: {
      marginTop: 32,
      padding: 18,
      borderRadius: 18,
      backgroundColor:
        'rgba(255,59,92,0.10)',
      borderWidth: 1,
      borderColor:
        'rgba(255,94,118,0.35)',
    },

    dangerTitle: {
      color: '#FFFFFF',
      fontSize: 18,
      fontWeight: '800',
    },

    dangerDescription: {
      color:
        'rgba(255,255,255,0.68)',
      fontSize: 12,
      lineHeight: 18,
      marginTop: 6,
      marginBottom: 15,
    },

    deleteButton: {
      minHeight: 52,
      borderRadius: 13,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-between',
      paddingHorizontal: 16,
      backgroundColor:
        '#E53955',
      borderWidth: 1,
      borderColor:
        'rgba(255,255,255,0.18)',
    },

    deleteButtonText: {
      color: '#FFFFFF',
      fontSize: 15,
      fontWeight: '800',
    },

    deleteArrow: {
      color: '#FFFFFF',
      fontSize: 26,
      lineHeight: 28,
    },

    bottomSpace: {
      height: 20,
    },

    deleteHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 22,
    },

    backButton: {
      width: 46,
      height: 46,
      borderRadius: 15,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        'rgba(255,255,255,0.10)',
      borderWidth: 1,
      borderColor:
        'rgba(255,255,255,0.16)',
      marginRight: 13,
    },

    deleteHeaderText: {
      flex: 1,
    },

    deleteHeaderTitle: {
      color: '#FFFFFF',
      fontSize: 25,
      fontWeight: '900',
    },

    deleteHeaderSubtitle: {
      color:
        'rgba(255,255,255,0.60)',
      fontSize: 12,
      marginTop: 3,
    },

    warningCard: {
      flexDirection: 'row',
      padding: 16,
      borderRadius: 19,
      backgroundColor:
        'rgba(229,57,85,0.13)',
      borderWidth: 1,
      borderColor:
        'rgba(255,114,136,0.40)',
      marginBottom: 15,
    },

    warningTextArea: {
      flex: 1,
      marginLeft: 12,
    },

    warningTitle: {
      color: '#FFFFFF',
      fontSize: 15,
      fontWeight: '800',
    },

    warningText: {
      color:
        'rgba(255,255,255,0.70)',
      fontSize: 12,
      lineHeight: 18,
      marginTop: 5,
    },

    formCard: {
      backgroundColor:
        'rgba(0,22,61,0.80)',
      borderRadius: 20,
      borderWidth: 1,
      borderColor:
        'rgba(255,255,255,0.11)',
      padding: 16,
      marginBottom: 14,
    },

    sectionTitle: {
      color: '#FFFFFF',
      fontSize: 17,
      fontWeight: '800',
    },

    sectionDescription: {
      color:
        'rgba(255,255,255,0.62)',
      fontSize: 12,
      lineHeight: 18,
      marginTop: 5,
      marginBottom: 13,
    },

    inputWrapper: {
      minHeight: 52,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor:
        'rgba(0,13,38,0.90)',
      borderRadius: 15,
      borderWidth: 1,
      borderColor:
        'rgba(255,255,255,0.12)',
      paddingHorizontal: 14,
    },

    input: {
      flex: 1,
      color: '#FFFFFF',
      fontSize: 15,
      marginLeft: 10,
      paddingVertical: 13,
    },

    reasonButton: {
      minHeight: 48,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 13,
      paddingVertical: 10,
      borderRadius: 14,
      backgroundColor:
        'rgba(255,255,255,0.05)',
      borderWidth: 1,
      borderColor:
        'rgba(255,255,255,0.08)',
      marginBottom: 8,
    },

    reasonButtonSelected: {
      backgroundColor:
        'rgba(0,198,255,0.13)',
      borderColor:
        'rgba(0,198,255,0.52)',
    },

    radioOuter: {
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 2,
      borderColor:
        '#7893A8',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 11,
    },

    radioOuterSelected: {
      borderColor:
        '#00C6FF',
    },

    radioInner: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor:
        '#00C6FF',
    },

    reasonText: {
      flex: 1,
      color:
        'rgba(255,255,255,0.76)',
      fontSize: 14,
      fontWeight: '600',
    },

    reasonTextSelected: {
      color: '#FFFFFF',
      fontWeight: '800',
    },

    feedbackInput: {
      minHeight: 110,
      color: '#FFFFFF',
      fontSize: 14,
      lineHeight: 20,
      padding: 13,
      borderRadius: 15,
      backgroundColor:
        'rgba(0,13,38,0.90)',
      borderWidth: 1,
      borderColor:
        'rgba(255,255,255,0.12)',
    },

    characterCount: {
      color:
        'rgba(255,255,255,0.42)',
      fontSize: 10,
      textAlign: 'right',
      marginTop: 7,
    },

    confirmationCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor:
        'rgba(255,255,255,0.07)',
      borderRadius: 18,
      borderWidth: 1,
      borderColor:
        'rgba(255,255,255,0.12)',
      padding: 15,
      marginBottom: 18,
    },

    confirmationTextArea: {
      flex: 1,
      paddingRight: 12,
    },

    confirmationTitle: {
      color: '#FFFFFF',
      fontSize: 15,
      fontWeight: '800',
    },

    confirmationText: {
      color:
        'rgba(255,255,255,0.62)',
      fontSize: 11,
      lineHeight: 17,
      marginTop: 4,
    },

    permanentDeleteButton: {
      minHeight: 54,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 16,
      backgroundColor:
        '#E53955',
      paddingHorizontal: 15,
      borderWidth: 1,
      borderColor:
        'rgba(255,255,255,0.18)',
    },

    permanentDeleteButtonDisabled: {
      opacity: 0.42,
    },

    permanentDeleteButtonText: {
      color: '#FFFFFF',
      fontSize: 15,
      fontWeight: '900',
      marginLeft: 8,
    },

    loadingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },

    keepAccountButton: {
      minHeight: 50,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 10,
      borderRadius: 15,
      backgroundColor:
        'rgba(255,255,255,0.07)',
      borderWidth: 1,
      borderColor:
        'rgba(255,255,255,0.11)',
    },

    keepAccountButtonText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '700',
    },
  });
