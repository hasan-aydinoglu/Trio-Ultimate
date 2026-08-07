import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { auth, db } from '../firebase';
import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';

const tableNumbers = [
  3, 7, 3, 5, 8, 4, 9,
  5, 1, 8, 6, 5, 2, 7,
  8, 6, 2, 4, 9, 1, 9,
  2, 6, 4, 7, 5, 5, 3,
  7, 4, 3, 2, 1, 6, 3,
  2, 1, 4, 8, 3, 9, 5,
  1, 8, 6, 7, 2, 4, 6,
];

const blueCards = [
  20,
  24,
  27,
  30,
  32,
  36,
  40,
  44,
  45,
  48,
  50,
];

const players = [
  {
    id: 1,
    name: 'Player 1',
    photo: null,
  },
  {
    id: 2,
    name: 'Player 2',
    photo: null,
  },
];

const shuffleArray = (array) => {
  return [...array].sort(() => Math.random() - 0.5);
};

export default function GameScreen5({
  navigation,
  route,
}) {
  const [cards, setCards] = useState(() =>
    shuffleArray(tableNumbers)
  );

  const [openedCards, setOpenedCards] = useState([]);
  const [wonBlueCards, setWonBlueCards] = useState([]);
  const [playerTurn, setPlayerTurn] = useState(1);
  const [showRules, setShowRules] = useState(true);
  const [profileImage, setProfileImage] = useState(null);

  const [
    loggedInPlayerName,
    setLoggedInPlayerName,
  ] = useState('Player 1');

  const routePlayers =
    route?.params?.players || players;

  const goToGameMenu = () => {
    navigation.reset({
      index: 0,
      routes: [
        {
          name: 'TabNavigator',
          params: {
            screen: 'GameMode',
          },
        },
      ],
    });
  };

  const leaveGame = () => {
    const isOnline =
      route?.params?.isOnline === true;

    Alert.alert(
      'Leave Game?',
      isOnline
        ? 'If you leave now, the match will end and your opponent will be declared the winner.'
        : 'Are you sure you want to leave this game?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Leave Game',
          style: 'destructive',
          onPress: async () => {
            try {
              const inviteId =
                route?.params?.inviteId;

              const currentUser =
                auth.currentUser;

              if (isOnline && inviteId) {
                const invitedBy =
                  route?.params?.invitedBy;

                const acceptedBy =
                  route?.params?.acceptedBy;

                const winnerId =
                  currentUser?.uid === invitedBy
                    ? acceptedBy || null
                    : invitedBy || null;

                await updateDoc(
                  doc(
                    db,
                    'gameInvites',
                    inviteId
                  ),
                  {
                    status: 'abandoned',
                    leftBy:
                      currentUser?.uid || null,
                    winnerId,
                    endedAt:
                      serverTimestamp(),
                  }
                );
              }
            } catch (error) {
              console.log(
                'Leave game update error:',
                error
              );
            } finally {
              goToGameMenu();
            }
          },
        },
      ]
    );
  };

  const renderBackgroundDecor = () => (
    <View pointerEvents="none" style={styles.backgroundDecor}>
      <View style={[styles.glowOrb, styles.glowOrbOne]} />
      <View style={[styles.glowOrb, styles.glowOrbTwo]} />
      <View style={[styles.glowOrb, styles.glowOrbThree]} />
      <Text style={[styles.cardSymbol, styles.cardSymbolOne]}>◆</Text>
      <Text style={[styles.cardSymbol, styles.cardSymbolTwo]}>?</Text>
      <Text style={[styles.cardSymbol, styles.cardSymbolThree]}>✦</Text>
    </View>
  );

  const renderExitButton = () => {
    return (
      <TouchableOpacity
        style={styles.exitButton}
        onPress={leaveGame}
        activeOpacity={0.8}
      >
        <Text style={styles.exitButtonText}>
          ✕ Exit
        </Text>
      </TouchableOpacity>
    );
  };

  useEffect(() => {
    const loadProfileImage = async () => {
      try {
        const savedProfile =
          await AsyncStorage.getItem(
            'userProfile'
          );

        const savedImage =
          await AsyncStorage.getItem(
            'profileImage'
          );

        if (savedProfile) {
          const profileData =
            JSON.parse(savedProfile);

          const storedProfileImage =
            profileData.profileImage ||
            profileData.photoURL ||
            profileData.image ||
            profileData.avatar ||
            profileData.avatarUrl ||
            profileData.profilePhoto ||
            null;

          const storedProfileName =
            profileData.username ||
            profileData.name ||
            profileData.fullName ||
            profileData.displayName ||
            null;

          if (storedProfileName) {
            setLoggedInPlayerName(
              storedProfileName
            );
          }

          if (storedProfileImage) {
            setProfileImage(
              storedProfileImage
            );

            return;
          }
        }

        if (savedImage) {
          setProfileImage(savedImage);
        }
      } catch (error) {
        console.log(
          'Profile image load error:',
          error
        );
      }
    };

    const loadLoggedInPlayerData =
      async () => {
        try {
          const user = auth.currentUser;

          if (!user) {
            return;
          }

          const userRef = doc(
            db,
            'users',
            user.uid
          );

          const userSnap =
            await getDoc(userRef);

          if (userSnap.exists()) {
            const data = userSnap.data();

            setLoggedInPlayerName(
              data.username ||
                data.name ||
                data.fullName ||
                data.displayName ||
                user.displayName ||
                user.email ||
                'Player 1'
            );

            const firestoreProfileImage =
              data.profileImage ||
              data.photoURL ||
              data.image ||
              data.avatar ||
              data.avatarUrl ||
              data.profilePhoto ||
              user.photoURL ||
              null;

            if (firestoreProfileImage) {
              setProfileImage(
                firestoreProfileImage
              );
            }
          } else {
            setLoggedInPlayerName(
              user.displayName ||
                user.email ||
                'Player 1'
            );

            if (user.photoURL) {
              setProfileImage(
                user.photoURL
              );
            }
          }
        } catch (error) {
          console.log(
            'User data load error:',
            error
          );
        }
      };

    loadProfileImage();
    loadLoggedInPlayerData();
  }, []);

  const getPlayerPhoto = (playerId) => {
    if (playerId === 1 && profileImage) {
      return profileImage;
    }

    const player = routePlayers.find(
      (item) => item.id === playerId
    );

    return (
      player?.photo ||
      player?.image ||
      player?.avatar ||
      player?.avatarUrl ||
      player?.profileImage ||
      player?.photoURL ||
      null
    );
  };

  const getPlayerName = (playerId) => {
    if (playerId === 1) {
      return loggedInPlayerName;
    }

    const player = routePlayers.find(
      (item) => item.id === playerId
    );

    return (
      player?.name ||
      player?.username ||
      player?.displayName ||
      `Player ${playerId}`
    );
  };

  const renderPlayerCard = (playerId) => {
    const photo = getPlayerPhoto(playerId);
    const isActive =
      playerTurn === playerId;

    return (
      <View
        style={[
          styles.playerCard,
          isActive &&
            styles.activePlayerCard,
        ]}
      >
        <LinearGradient
          colors={
            isActive
              ? ['#7b1fa2', '#ce93d8']
              : [
                  'rgba(255,255,255,0.10)',
                  'rgba(255,255,255,0.02)',
                ]
          }
          style={styles.avatarGlow}
        >
          {photo ? (
            <Image
              source={{ uri: photo }}
              style={styles.profileImage}
            />
          ) : (
            <View
              style={styles.defaultAvatar}
            >
              <Text
                style={
                  styles.defaultAvatarText
                }
              >
                P{playerId}
              </Text>
            </View>
          )}
        </LinearGradient>

        <Text style={styles.playerName}>
          {getPlayerName(playerId)}
        </Text>
      </View>
    );
  };

  const openCard = (index) => {
    if (openedCards.includes(index)) {
      return;
    }

    if (openedCards.length >= 3) {
      Alert.alert(
        'Limit',
        'You can only choose 3 cards.'
      );

      return;
    }

    setOpenedCards([
      ...openedCards,
      index,
    ]);
  };

  const checkBlueCards = () => {
    if (openedCards.length !== 3) {
      Alert.alert(
        'Pick 3 cards first!'
      );

      return;
    }

    const nums = openedCards.map(
      (index) => cards[index]
    );

    const possibleResults = [
      nums[0] + nums[1] + nums[2],
      nums[0] * nums[1] + nums[2],
      nums[0] * nums[1] - nums[2],
      (nums[0] + nums[1]) * nums[2],
      (nums[0] - nums[1]) * nums[2],
    ];

    const matchedBlueCard =
      blueCards.find(
        (card) =>
          possibleResults.includes(card) &&
          !wonBlueCards.includes(card)
      );

    if (matchedBlueCard) {
      setWonBlueCards([
        ...wonBlueCards,
        matchedBlueCard,
      ]);

      Alert.alert(
        '🎉 Blue Card Won!',
        `${getPlayerName(
          playerTurn
        )} won blue card ${matchedBlueCard}`
      );
    } else {
      Alert.alert(
        '❌ No Match',
        'No blue card found.'
      );
    }

    setOpenedCards([]);

    setPlayerTurn((previousTurn) =>
      previousTurn === 1 ? 2 : 1
    );
  };

  const resetGame = () => {
    Alert.alert(
      'Reset Game?',
      'All opened and won cards will be reset.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            setCards(
              shuffleArray(tableNumbers)
            );

            setOpenedCards([]);
            setWonBlueCards([]);
            setPlayerTurn(1);
          },
        },
      ]
    );
  };

  if (showRules) {
    return (
      <View style={styles.backgroundImage}>
        <LinearGradient
          colors={['#FF4F9A', '#E91E63', '#B91558', '#7A0D3D']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.rulesContainer}
        >
          {renderBackgroundDecor()}
          {renderExitButton()}

          <View style={styles.modeBadge}>
            <Text style={styles.modeBadgeIcon}>◆</Text>
            <Text style={styles.modeBadgeText}>MODE 5</Text>
          </View>

          <Text style={styles.rulesEyebrow}>TRIO CARD HUNT</Text>
          <Text style={styles.rulesTitle}>Blue Card Hunt</Text>
          <Text style={styles.rulesSubtitle}>
            Reveal three hidden cards and try to match one of the blue targets.
          </Text>

          <View style={styles.rulesCard}>
            {[
              ['01', 'This mode is played by 2 players'],
              ['02', 'Blue target cards are shown at the top'],
              ['03', 'Each player chooses exactly 3 hidden cards'],
              ['04', 'Use addition, multiplication or subtraction'],
              ['05', 'A matching result wins that blue card'],
              ['06', 'Won blue cards turn green with a check mark'],
            ].map(([number, rule]) => (
              <View key={number} style={styles.ruleRow}>
                <View style={styles.ruleNumber}>
                  <Text style={styles.ruleNumberText}>{number}</Text>
                </View>
                <Text style={styles.ruleText}>{rule}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={styles.startButton}
            onPress={() => setShowRules(false)}
            activeOpacity={0.86}
          >
            <LinearGradient
              colors={['#FF74B5', '#F43F8C', '#BE185D']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.primaryButtonGradient}
            >
              <Text style={styles.buttonText}>Start Game</Text>
              <Text style={styles.buttonArrow}>→</Text>
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.backgroundImage}>
      <LinearGradient
        colors={['#FF4F9A', '#E91E63', '#B91558', '#7A0D3D']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        {renderBackgroundDecor()}
        {renderExitButton()}

        <View style={styles.gameHeader}>
          <View>
            <Text style={styles.gameEyebrow}>TRIO · CARD HUNT</Text>
            <Text style={styles.gameTitle}>Find the Blue Card</Text>
          </View>
          <View style={styles.modeNumberBadge}>
            <Text style={styles.modeNumberText}>5</Text>
          </View>
        </View>

        <View style={styles.playersBox}>
          {renderPlayerCard(1)}
          {renderPlayerCard(2)}
        </View>

        <View style={styles.turnBanner}>
          <View style={styles.turnDot} />
          <Text style={styles.turnLabel}>CURRENT TURN</Text>
          <Text numberOfLines={1} style={styles.turnText}>
            {getPlayerName(playerTurn)}
          </Text>
        </View>

        <View style={styles.blueTargetsCard}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>BLUE TARGETS</Text>
              <Text style={styles.sectionSubtitle}>
                Match one result to win a card
              </Text>
            </View>

            <View style={styles.wonCounter}>
              <Text style={styles.wonCounterValue}>
                {wonBlueCards.length}
              </Text>
              <Text style={styles.wonCounterLabel}>WON</Text>
            </View>
          </View>

          <View style={styles.blueCardContainer}>
            {blueCards.map((card) => {
              const isWon = wonBlueCards.includes(card);

              return (
                <View
                  key={card}
                  style={[
                    styles.blueCard,
                    isWon && styles.blueCardWon,
                  ]}
                >
                  <LinearGradient
                    colors={
                      isWon
                        ? ['#4ADE80', '#16A34A']
                        : ['#38BDF8', '#2563EB', '#1D4ED8']
                    }
                    style={styles.blueCardGradient}
                  >
                    <Text style={styles.blueText}>
                      {isWon ? '✓' : card}
                    </Text>
                  </LinearGradient>
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.selectionBanner}>
          <Text style={styles.selectionLabel}>SELECTED CARDS</Text>
          <Text style={styles.selectionNumbers}>
            {openedCards.length > 0
              ? openedCards.map((index) => cards[index]).join('   ')
              : 'Choose three cards'}
          </Text>
          <Text style={styles.selectionCounter}>
            {openedCards.length}/3
          </Text>
        </View>

        <View style={styles.boardCard}>
          <View style={styles.boardTopRow}>
            <Text style={styles.boardTitle}>HIDDEN CARD GRID</Text>
            <Text style={styles.boardHint}>Tap to reveal</Text>
          </View>

          <View style={styles.table}>
            {Array.from({ length: 7 }).map((_, rowIndex) => (
              <View key={rowIndex} style={styles.row}>
                {cards
                  .slice(rowIndex * 7, rowIndex * 7 + 7)
                  .map((value, colIndex) => {
                    const index = rowIndex * 7 + colIndex;
                    const isOpened = openedCards.includes(index);

                    return (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.cell,
                          isOpened && styles.openedCell,
                        ]}
                        onPress={() => openCard(index)}
                        activeOpacity={0.82}
                      >
                        <View style={styles.cellHighlight} />
                        <Text style={styles.cellText}>
                          {isOpened ? value : '?'}
                        </Text>

                        {isOpened && (
                          <View style={styles.selectedIndex}>
                            <Text style={styles.selectedIndexText}>
                              {openedCards.indexOf(index) + 1}
                            </Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
              </View>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={styles.checkButton}
          onPress={checkBlueCards}
          activeOpacity={0.86}
        >
          <LinearGradient
            colors={['#FF74B5', '#F43F8C', '#BE185D']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.primaryButtonGradient}
          >
            <Text style={styles.buttonText}>Check Blue Cards</Text>
            <Text style={styles.buttonArrow}>→</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.resetButton}
          onPress={resetGame}
          activeOpacity={0.82}
        >
          <Text style={styles.resetButtonText}>Reset Game</Text>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    backgroundColor: '#7A0D3D',
  },

  backgroundDecor: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },

  glowOrb: {
    position: 'absolute',
    borderRadius: 999,
  },

  glowOrbOne: {
    width: 300,
    height: 300,
    top: -130,
    right: -120,
    backgroundColor: 'rgba(255,255,255,0.14)',
  },

  glowOrbTwo: {
    width: 270,
    height: 270,
    bottom: -120,
    left: -110,
    backgroundColor: 'rgba(91,8,48,0.36)',
  },

  glowOrbThree: {
    width: 180,
    height: 180,
    top: '44%',
    right: -100,
    backgroundColor: 'rgba(255,174,215,0.15)',
  },

  cardSymbol: {
    position: 'absolute',
    color: 'rgba(255,255,255,0.05)',
    fontWeight: '900',
  },

  cardSymbolOne: {
    top: 115,
    left: 18,
    fontSize: 86,
    transform: [{ rotate: '-14deg' }],
  },

  cardSymbolTwo: {
    top: '36%',
    right: 22,
    fontSize: 90,
    transform: [{ rotate: '10deg' }],
  },

  cardSymbolThree: {
    bottom: 95,
    left: 30,
    fontSize: 92,
    transform: [{ rotate: '-8deg' }],
  },

  container: {
    flex: 1,
    paddingTop: 44,
    paddingHorizontal: 12,
    paddingBottom: 10,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },

  exitButton: {
    position: 'absolute',
    top: 44,
    right: 16,
    zIndex: 20,
    minHeight: 36,
    paddingVertical: 8,
    paddingHorizontal: 13,
    borderRadius: 14,
    backgroundColor: 'rgba(122,13,61,0.74)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.24)',
    shadowColor: '#5B0830',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.24,
    shadowRadius: 10,
    elevation: 7,
  },

  exitButtonText: {
    color: '#FFF1F7',
    fontSize: 13,
    fontWeight: '900',
  },

  gameHeader: {
    width: '100%',
    minHeight: 52,
    marginBottom: 7,
    paddingRight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  gameEyebrow: {
    color: '#FFD0E4',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.8,
    marginBottom: 3,
  },

  gameTitle: {
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: '900',
    letterSpacing: -0.5,
  },

  modeNumberBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.13)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.27)',
  },

  modeNumberText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '900',
  },

  playersBox: {
    width: '100%',
    flexDirection: 'row',
    gap: 10,
    marginBottom: 7,
  },

  playerCard: {
    flex: 1,
    minHeight: 76,
    paddingVertical: 7,
    paddingHorizontal: 7,
    borderRadius: 17,
    alignItems: 'center',
    backgroundColor: 'rgba(122,13,61,0.46)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
  },

  activePlayerCard: {
    backgroundColor: 'rgba(255,116,181,0.19)',
    borderColor: 'rgba(255,209,231,0.76)',
    shadowColor: '#FF9AC8',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.34,
    shadowRadius: 10,
    elevation: 7,
  },

  avatarGlow: {
    width: 42,
    height: 42,
    padding: 2,
    marginBottom: 5,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
  },

  profileImage: {
    width: 38,
    height: 38,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.84)',
  },

  defaultAvatar: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: '#9D174D',
    borderWidth: 1,
    borderColor: '#F9A8D4',
    alignItems: 'center',
    justifyContent: 'center',
  },

  defaultAvatarText: {
    color: '#FFF1F7',
    fontSize: 13,
    fontWeight: '900',
  },

  playerName: {
    width: '100%',
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
    textAlign: 'center',
  },

  turnBanner: {
    width: '100%',
    height: 34,
    marginBottom: 7,
    paddingHorizontal: 11,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(122,13,61,0.44)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },

  turnDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 8,
    backgroundColor: '#FFD0E4',
  },

  turnLabel: {
    color: '#F9A8D4',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.1,
    marginRight: 8,
  },

  turnText: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },

  blueTargetsCard: {
    width: '100%',
    padding: 8,
    marginBottom: 7,
    borderRadius: 18,
    backgroundColor: 'rgba(91,8,48,0.45)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },

  sectionHeader: {
    paddingHorizontal: 3,
    marginBottom: 7,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.4,
  },

  sectionSubtitle: {
    color: '#FFD0E4',
    fontSize: 9,
    fontWeight: '700',
    marginTop: 2,
  },

  wonCounter: {
    minWidth: 44,
    height: 35,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
  },

  wonCounterValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    lineHeight: 15,
  },

  wonCounterLabel: {
    color: '#F9A8D4',
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 0.8,
  },

  blueCardContainer: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },

  blueCard: {
    width: 42,
    height: 42,
    margin: 3,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#1D4ED8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 7,
    elevation: 5,
  },

  blueCardWon: {
    shadowColor: '#16A34A',
  },

  blueCardGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.30)',
    borderRadius: 14,
  },

  blueText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },

  selectionBanner: {
    width: '100%',
    minHeight: 34,
    paddingHorizontal: 11,
    marginBottom: 6,
    borderRadius: 13,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(122,13,61,0.44)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },

  selectionLabel: {
    color: '#F9A8D4',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
    marginRight: 8,
  },

  selectionNumbers: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },

  selectionCounter: {
    color: '#FFD0E4',
    fontSize: 10,
    fontWeight: '900',
  },

  boardCard: {
    width: '100%',
    paddingTop: 8,
    paddingHorizontal: 6,
    paddingBottom: 6,
    borderRadius: 19,
    backgroundColor: 'rgba(91,8,48,0.52)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.17)',
    shadowColor: '#5B0830',
    shadowOffset: { width: 0, height: 9 },
    shadowOpacity: 0.22,
    shadowRadius: 15,
    elevation: 7,
  },

  boardTopRow: {
    width: '100%',
    paddingHorizontal: 4,
    marginBottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  boardTitle: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.4,
  },

  boardHint: {
    color: '#FFD0E4',
    fontSize: 9,
    fontWeight: '700',
  },

  table: {
    width: '100%',
    alignItems: 'center',
  },

  row: {
    flexDirection: 'row',
  },

  cell: {
    position: 'relative',
    width: 38,
    height: 38,
    margin: 1.75,
    borderRadius: 11,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4A0A29',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    shadowColor: '#5B0830',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 3,
  },

  openedCell: {
    backgroundColor: '#F43F8C',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    transform: [{ scale: 1.05 }],
    shadowColor: '#FF9AC8',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.70,
    shadowRadius: 9,
    elevation: 10,
  },

  cellHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '42%',
    backgroundColor: 'rgba(255,255,255,0.10)',
  },

  selectedIndex: {
    position: 'absolute',
    top: 3,
    right: 3,
    width: 14,
    height: 14,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#9D174D',
  },

  selectedIndexText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '900',
  },

  cellText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '900',
    textShadowColor: 'rgba(0,0,0,0.18)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  checkButton: {
    width: '100%',
    height: 43,
    marginTop: 8,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#BE185D',
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 8,
  },

  primaryButtonGradient: {
    flex: 1,
    minHeight: 43,
    paddingHorizontal: 20,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },

  buttonArrow: {
    position: 'absolute',
    right: 19,
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: '700',
  },

  resetButton: {
    width: '100%',
    height: 38,
    marginTop: 6,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(122,13,61,0.48)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.17)',
  },

  resetButtonText: {
    color: '#FFF1F7',
    fontSize: 12,
    fontWeight: '900',
  },

  rulesContainer: {
    flex: 1,
    paddingTop: 52,
    paddingHorizontal: 20,
    paddingBottom: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },

  modeBadge: {
    width: 64,
    height: 64,
    marginBottom: 14,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.32)',
    shadowColor: '#5B0830',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 6,
  },

  modeBadgeIcon: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    lineHeight: 25,
  },

  modeBadgeText: {
    color: '#FFF1F7',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },

  rulesEyebrow: {
    color: '#FFD0E4',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 7,
  },

  rulesTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.8,
    textAlign: 'center',
    marginBottom: 9,
  },

  rulesSubtitle: {
    maxWidth: 330,
    color: '#FFE4EF',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 19,
    textAlign: 'center',
    marginBottom: 18,
  },

  rulesCard: {
    width: '100%',
    paddingVertical: 9,
    paddingHorizontal: 13,
    borderRadius: 22,
    backgroundColor: 'rgba(91,8,48,0.52)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.17)',
    shadowColor: '#5B0830',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 6,
  },

  ruleRow: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.10)',
  },

  ruleNumber: {
    width: 28,
    height: 28,
    marginRight: 10,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,154,200,0.18)',
  },

  ruleNumberText: {
    color: '#FFD0E4',
    fontSize: 9,
    fontWeight: '900',
  },

  ruleText: {
    flex: 1,
    color: '#FFF1F7',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 17,
  },

  startButton: {
    width: '100%',
    height: 47,
    marginTop: 17,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#BE185D',
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.30,
    shadowRadius: 12,
    elevation: 8,
  },
});