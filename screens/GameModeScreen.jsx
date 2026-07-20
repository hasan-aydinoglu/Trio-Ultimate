import React, { useEffect, useState } from 'react';

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  StatusBar,
  SafeAreaView,
  Image,
} from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { auth, db } from '../firebase';

import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
} from 'firebase/firestore';

export default function GameModeScreen({ navigation }) {
  const [gameInvites, setGameInvites] = useState([]);

  useEffect(() => {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      return;
    }

    const gameInvitesQuery = query(
      collection(db, 'gameInvites'),
      where('toUserId', '==', currentUser.uid),
      where('status', '==', 'pending')
    );

    const unsubscribe = onSnapshot(
      gameInvitesQuery,
      (snapshot) => {
        const invites = snapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        }));

        setGameInvites(invites);
      },
      (error) => {
        console.log('Game invites load error:', error);
      }
    );

    return () => unsubscribe();
  }, []);

  const createOnlineRoom = () => {
    navigation.navigate('OnlineRoomSetupScreen');
  };

  const acceptInvite = async (invite) => {
    try {
      await updateDoc(doc(db, 'gameInvites', invite.id), {
        status: 'accepted',
      });

      navigation.navigate('OnlineLobbyScreen', {
        roomId: invite.roomId,
        gameType: invite.gameType,
      });
    } catch (error) {
      Alert.alert(
        'Error',
        error?.message ||
          'The invitation could not be accepted.'
      );
    }
  };

  const declineInvite = async (invite) => {
    try {
      await updateDoc(doc(db, 'gameInvites', invite.id), {
        status: 'declined',
      });
    } catch (error) {
      Alert.alert(
        'Error',
        error?.message ||
          'The invitation could not be declined.'
      );
    }
  };

  const handlePress = (mode) => {
    if (mode >= 1 && mode <= 5) {
      navigation.navigate('OnlineLobbyScreen', {
        gameType: mode,
      });

      return;
    }

    Alert.alert(
      'Coming Soon',
      `Game Type ${mode} will be added soon.`
    );
  };

  const gameModes = [
    {
      id: 1,
      title: 'Classic Trio',
      subtitle: 'Original Trio rules',
      icon: 'grid-outline',
      colors: ['#087BFF', '#0045AE'],
    },
    {
      id: 2,
      title: 'Priority',
      subtitle: 'Operation priority',
      icon: 'calculator-outline',
      colors: ['#8B38F2', '#4E159B'],
    },
    {
      id: 3,
      title: 'Hidden Card',
      subtitle: 'Test your memory',
      icon: 'eye-off-outline',
      colors: ['#FF8B0A', '#B84300'],
    },
    {
      id: 4,
      title: 'Formula',
      subtitle: 'Fixed calculation',
      icon: 'flask-outline',
      colors: ['#0CCDB0', '#006960'],
    },
    {
      id: 5,
      title: 'Card Hunt',
      subtitle: 'Find the blue card',
      icon: 'diamond-outline',
      colors: ['#F33170', '#8A123D'],
    },
  ];

  const currentUserName =
    auth.currentUser?.displayName ||
    auth.currentUser?.email?.split('@')[0] ||
    'Player';

  return (
    <LinearGradient
      colors={[
        '#08A8FF',
        '#0069E9',
        '#003B9F',
        '#001B4C',
        '#000713',
      ]}
      locations={[0, 0.2, 0.43, 0.7, 1]}
      style={styles.container}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor="#08A8FF"
      />

      <SafeAreaView style={styles.safeArea}>
        <View
          pointerEvents="none"
          style={styles.topGlow}
        />

        <View
          pointerEvents="none"
          style={styles.middleGlow}
        />

        <View
          pointerEvents="none"
          style={styles.bottomGlow}
        />

        <Image
          pointerEvents="none"
          source={require('../assets/trio-logo.png')}
          style={styles.backgroundLogo}
          resizeMode="contain"
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Image
                source={require('../assets/trio-logo.png')}
                style={styles.trioLogo}
                resizeMode="contain"
              />

              <View style={styles.headerUserText}>
                <Text style={styles.greeting}>
                  Welcome back,
                </Text>

                <Text
                  style={styles.username}
                  numberOfLines={1}
                >
                  {currentUserName}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.notificationButton}
              activeOpacity={0.8}
            >
              <Ionicons
                name="notifications-outline"
                size={25}
                color="#FFFFFF"
              />

              {gameInvites.length > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>
                    {gameInvites.length > 9
                      ? '9+'
                      : gameInvites.length}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.brandArea}>
            <Text style={styles.brandText}>
              Think. Calculate. Win.
            </Text>

            <Text style={styles.brandSubtitle}>
              Select a game mode and start playing.
            </Text>
          </View>

          {gameInvites.length > 0 && (
            <View style={styles.inviteSection}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleRow}>
                  <Ionicons
                    name="game-controller"
                    size={20}
                    color="#64C7FF"
                  />

                  <Text style={styles.sectionTitle}>
                    Game invitations
                  </Text>
                </View>

                <View style={styles.sectionCount}>
                  <Text style={styles.sectionCountText}>
                    {gameInvites.length}
                  </Text>
                </View>
              </View>

              {gameInvites.map((invite) => {
                const inviterName =
                  invite.fromUsername ||
                  invite.fromName ||
                  'Player';

                return (
                  <View
                    key={invite.id}
                    style={styles.inviteCard}
                  >
                    <View style={styles.inviteTopRow}>
                      <LinearGradient
                        colors={['#4798FF', '#1453D7']}
                        style={styles.avatar}
                      >
                        <Text style={styles.avatarText}>
                          {inviterName
                            .charAt(0)
                            .toUpperCase()}
                        </Text>
                      </LinearGradient>

                      <View style={styles.inviteDetails}>
                        <Text
                          style={styles.inviteName}
                          numberOfLines={1}
                        >
                          {inviterName}
                        </Text>

                        <Text style={styles.inviteDescription}>
                          Invited you to Game Type{' '}
                          {invite.gameType || 1}
                        </Text>

                        {invite.roomId ? (
                          <View style={styles.roomInfo}>
                            <Text style={styles.roomLabel}>
                              ROOM ID
                            </Text>

                            <Text
                              style={styles.roomValue}
                              numberOfLines={1}
                            >
                              {invite.roomId}
                            </Text>
                          </View>
                        ) : null}
                      </View>

                      <Ionicons
                        name="game-controller"
                        size={23}
                        color="#B7DDFF"
                      />
                    </View>

                    <View style={styles.inviteActions}>
                      <TouchableOpacity
                        style={styles.declineButton}
                        onPress={() =>
                          declineInvite(invite)
                        }
                        activeOpacity={0.8}
                      >
                        <Text style={styles.declineText}>
                          Decline
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.acceptButton}
                        onPress={() =>
                          acceptInvite(invite)
                        }
                        activeOpacity={0.8}
                      >
                        <LinearGradient
                          colors={['#08DDA6', '#007B64']}
                          style={styles.acceptGradient}
                        >
                          <Text style={styles.acceptText}>
                            Accept
                          </Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Ionicons
                name="grid"
                size={19}
                color="#64C7FF"
              />

              <Text style={styles.sectionTitle}>
                Choose game mode
              </Text>
            </View>
          </View>

          <View style={styles.modesContainer}>
            {gameModes.map((mode) => (
              <TouchableOpacity
                key={mode.id}
                style={styles.modeCardWrapper}
                onPress={() => handlePress(mode.id)}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={mode.colors}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.modeCard}
                >
                  <View style={styles.modeIcon}>
                    <Ionicons
                      name={mode.icon}
                      size={29}
                      color="#FFFFFF"
                    />
                  </View>

                  <View style={styles.modeContent}>
                    <Text style={styles.modeTitle}>
                      {mode.title}
                    </Text>

                    <Text style={styles.modeSubtitle}>
                      {mode.subtitle}
                    </Text>
                  </View>

                  <View style={styles.modeRight}>
                    <View style={styles.modeNumber}>
                      <Text style={styles.modeNumberText}>
                        {mode.id}
                      </Text>
                    </View>

                    <Ionicons
                      name="chevron-forward"
                      size={24}
                      color="#FFFFFF"
                    />
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={styles.createRoomButton}
            onPress={createOnlineRoom}
            activeOpacity={0.88}
          >
            <LinearGradient
              colors={[
                'rgba(0,102,255,0.90)',
                'rgba(0,31,86,0.96)',
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.createRoomGradient}
            >
              <View style={styles.createRoomIcon}>
                <Ionicons
                  name="people"
                  size={27}
                  color="#69B8FF"
                />
              </View>

              <View style={styles.createRoomContent}>
                <Text style={styles.createRoomTitle}>
                  Create Online Room
                </Text>

                <Text style={styles.createRoomSubtitle}>
                  Invite friends and play together
                </Text>
              </View>

              <View style={styles.createRoomArrow}>
                <Ionicons
                  name="chevron-forward"
                  size={26}
                  color="#FFFFFF"
                />
              </View>
            </LinearGradient>
          </TouchableOpacity>

          <Text style={styles.footerText}>
            TRIO • THINK • CALCULATE • WIN
          </Text>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000713',
  },

  safeArea: {
    flex: 1,
    overflow: 'hidden',
  },

  scrollContent: {
    paddingHorizontal: 17,
    paddingTop: 12,
    paddingBottom: 120,
  },

  topGlow: {
    position: 'absolute',
    top: -150,
    left: -120,
    width: 470,
    height: 470,
    borderRadius: 235,
    backgroundColor: 'rgba(0,225,255,0.16)',
  },

  middleGlow: {
    position: 'absolute',
    top: 300,
    right: -220,
    width: 450,
    height: 450,
    borderRadius: 225,
    backgroundColor: 'rgba(0,80,255,0.13)',
  },

  bottomGlow: {
    position: 'absolute',
    bottom: -230,
    left: -120,
    width: 500,
    height: 500,
    borderRadius: 250,
    backgroundColor: 'rgba(0,92,255,0.08)',
  },

  backgroundLogo: {
    position: 'absolute',
    top: 55,
    alignSelf: 'center',
    width: 300,
    height: 300,
    opacity: 0.12,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 5,
  },

  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 10,
  },

  trioLogo: {
    width: 64,
    height: 64,
    marginRight: 10,
  },

  headerUserText: {
    flex: 1,
  },

  greeting: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 13,
    fontWeight: '600',
  },

  username: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    marginTop: 1,
  },

  notificationButton: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: 'rgba(0,37,115,0.42)',
    borderWidth: 1.5,
    borderColor: 'rgba(70,177,255,0.70)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  notificationBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FF4169',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },

  notificationBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },

  brandArea: {
    minHeight: 135,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 18,
  },

  brandText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.4,
  },

  brandSubtitle: {
    color: 'rgba(255,255,255,0.67)',
    fontSize: 12,
    marginTop: 5,
  },

  inviteSection: {
    marginBottom: 22,
  },

  sectionHeader: {
    minHeight: 34,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 11,
  },

  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    textTransform: 'uppercase',
    marginLeft: 8,
    letterSpacing: 0.2,
  },

  sectionCount: {
    minWidth: 34,
    height: 28,
    borderRadius: 9,
    backgroundColor: '#1475FF',
    borderWidth: 1,
    borderColor: 'rgba(119,194,255,0.70)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },

  sectionCountText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },

  inviteCard: {
    backgroundColor: 'rgba(0,23,67,0.80)',
    borderWidth: 1.5,
    borderColor: 'rgba(18,117,234,0.60)',
    borderRadius: 19,
    padding: 14,
    marginBottom: 10,
  },

  inviteTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatar: {
    width: 49,
    height: 49,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(135,202,255,0.70)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  avatarText: {
    color: '#FFFFFF',
    fontSize: 23,
    fontWeight: '900',
  },

  inviteDetails: {
    flex: 1,
  },

  inviteName: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '900',
  },

  inviteDescription: {
    color: 'rgba(255,255,255,0.80)',
    fontSize: 12,
    marginTop: 2,
  },

  roomInfo: {
    marginTop: 7,
  },

  roomLabel: {
    color: '#20A8FF',
    fontSize: 9,
    fontWeight: '900',
  },

  roomValue: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    marginTop: 1,
  },

  inviteActions: {
    flexDirection: 'row',
    marginTop: 12,
  },

  declineButton: {
    flex: 1,
    height: 41,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: '#FF3F75',
    backgroundColor: 'rgba(255,35,101,0.04)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },

  declineText: {
    color: '#FF7398',
    fontSize: 13,
    fontWeight: '900',
  },

  acceptButton: {
    flex: 1,
    height: 41,
    borderRadius: 11,
    overflow: 'hidden',
    marginLeft: 6,
  },

  acceptGradient: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#00E5B2',
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },

  acceptText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },

  modesContainer: {
    width: '100%',
  },

  modeCardWrapper: {
    width: '100%',
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 11,
  },

  modeCard: {
    minHeight: 88,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.28)',
    borderRadius: 18,
    paddingHorizontal: 13,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },

  modeIcon: {
    width: 55,
    height: 55,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.30)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },

  modeContent: {
    flex: 1,
  },

  modeTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '900',
    textTransform: 'uppercase',
  },

  modeSubtitle: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: 12,
    marginTop: 4,
  },

  modeRight: {
    height: 59,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginLeft: 8,
  },

  modeNumber: {
    minWidth: 27,
    height: 24,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.30)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },

  modeNumberText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },

  createRoomButton: {
    borderRadius: 20,
    overflow: 'hidden',
    marginTop: 3,
    borderWidth: 1.5,
    borderColor: '#0088FF',
  },

  createRoomGradient: {
    minHeight: 84,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
  },

  createRoomIcon: {
    width: 56,
    height: 56,
    borderRadius: 17,
    backgroundColor: 'rgba(0,54,145,0.62)',
    borderWidth: 1,
    borderColor: 'rgba(31,127,255,0.52)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },

  createRoomContent: {
    flex: 1,
  },

  createRoomTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    textTransform: 'uppercase',
  },

  createRoomSubtitle: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 11,
    marginTop: 4,
  },

  createRoomArrow: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: 'rgba(0,43,114,0.64)',
    borderWidth: 1,
    borderColor: 'rgba(21,104,221,0.58)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  footerText: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.7,
    textAlign: 'center',
    marginTop: 27,
  },
});