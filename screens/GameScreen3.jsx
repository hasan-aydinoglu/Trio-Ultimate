import React, {
  useMemo,
  useState,
  useEffect,
} from 'react';

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ImageBackground,
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

const originalCards = [
  3, 7, 3, 5, 8, 4, 9,
  5, 1, 8, 6, 5, 2, 7,
  8, 6, 2, 4, 9, 1, 9,
  2, 6, 4, 7, 5, 5, 3,
  7, 4, 3, 2, 1, 6, 3,
  2, 1, 4, 8, 3, 9, 5,
  1, 8, 6, 7, 2, 4, 6,
];

const cardColors = [
  '#FB923C',
  '#F97316',
  '#EA580C',
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

const shuffleArray = (array) => {
  return [...array].sort(
    () => Math.random() - 0.5
  );
};

const canReachTarget = (
  numbers,
  target
) => {
  if (numbers.length < 3) {
    return null;
  }

  const ops = [
    {
      symbol: '+',
      fn: (a, b) => a + b,
    },
    {
      symbol: '-',
      fn: (a, b) => a - b,
    },
    {
      symbol: '×',
      fn: (a, b) => a * b,
    },
    {
      symbol: '÷',
      fn: (a, b) =>
        b !== 0 ? a / b : null,
    },
  ];

  const permutations = [];

  const permute = (
    arr,
    path = []
  ) => {
    if (arr.length === 0) {
      permutations.push(path);
      return;
    }

    arr.forEach(
      (item, index) => {
        const rest = arr.filter(
          (_, currentIndex) =>
            currentIndex !== index
        );

        permute(rest, [
          ...path,
          item,
        ]);
      }
    );
  };

  permute(numbers);

  for (
    const nums of permutations
  ) {
    for (const op1 of ops) {
      for (const op2 of ops) {
        const first = op1.fn(
          nums[0],
          nums[1]
        );

        if (
          first === null ||
          !Number.isFinite(first)
        ) {
          continue;
        }

        const result = op2.fn(
          first,
          nums[2]
        );

        if (
          result === null ||
          !Number.isFinite(result)
        ) {
          continue;
        }

        if (
          Math.abs(
            result - target
          ) < 0.0001
        ) {
          return `(${nums[0]} ${op1.symbol} ${nums[1]}) ${op2.symbol} ${nums[2]} = ${target}`;
        }
      }
    }
  }

  return null;
};

export default function GameScreen3({
  navigation,
  route,
}) {
  const [
    cards,
    setCards,
  ] = useState(() =>
    shuffleArray(originalCards)
  );

  const [
    openedIndexes,
    setOpenedIndexes,
  ] = useState([]);

  const [
    targetNumber,
    setTargetNumber,
  ] = useState(null);

  const [
    usedBlueCards,
    setUsedBlueCards,
  ] = useState([]);

  const [
    playerTurn,
    setPlayerTurn,
  ] = useState(1);

  const [
    showRules,
    setShowRules,
  ] = useState(true);

  const [
    profileImage,
    setProfileImage,
  ] = useState(null);

  const [
    loggedInPlayerName,
    setLoggedInPlayerName,
  ] = useState('Player 1');

  const [
    scores,
    setScores,
  ] = useState({
    1: 0,
    2: 0,
  });

  const routePlayers =
    route?.params?.players || [];

  const secondPlayer =
    routePlayers.find(
      (player) => player.id === 2
    );

  const secondPlayerName =
    secondPlayer?.name ||
    'Player 2';

  const secondPlayerPhoto =
    secondPlayer?.photo ||
    secondPlayer?.image ||
    secondPlayer?.avatar ||
    null;

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
      route?.params?.isOnline ===
      true;

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

              if (
                isOnline &&
                inviteId
              ) {
                const invitedBy =
                  route?.params
                    ?.invitedBy;

                const acceptedBy =
                  route?.params
                    ?.acceptedBy;

                const winnerId =
                  currentUser?.uid ===
                  invitedBy
                    ? acceptedBy ||
                      null
                    : invitedBy ||
                      null;

                await updateDoc(
                  doc(
                    db,
                    'gameInvites',
                    inviteId
                  ),
                  {
                    status:
                      'abandoned',

                    leftBy:
                      currentUser?.uid ||
                      null,

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

  const renderExitButton = () => {
    return (
      <TouchableOpacity
        style={styles.exitButton}
        onPress={leaveGame}
        activeOpacity={0.8}
      >
        <Text
          style={
            styles.exitButtonText
          }
        >
          ✕ Exit
        </Text>
      </TouchableOpacity>
    );
  };

  useEffect(() => {
    const loadProfileData =
      async () => {
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
              JSON.parse(
                savedProfile
              );

            setLoggedInPlayerName(
              profileData.username ||
                profileData.name ||
                profileData.fullName ||
                'Player 1'
            );

            const localImage =
              profileData.profileImage ||
              profileData.photoURL ||
              profileData.image ||
              profileData.avatar ||
              profileData.avatarUrl ||
              profileData.profilePhoto ||
              null;

            if (localImage) {
              setProfileImage(
                localImage
              );

              return;
            }
          }

          if (savedImage) {
            setProfileImage(
              savedImage
            );
          }
        } catch (error) {
          console.log(
            'Local profile load error:',
            error
          );
        }
      };

    const loadFirebaseProfileData =
      async () => {
        try {
          const user =
            auth.currentUser;

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

          if (
            userSnap.exists()
          ) {
            const data =
              userSnap.data();

            setLoggedInPlayerName(
              data.username ||
                data.name ||
                data.fullName ||
                data.displayName ||
                user.displayName ||
                user.email ||
                'Player 1'
            );

            const firebaseImage =
              data.profileImage ||
              data.photoURL ||
              data.image ||
              data.avatar ||
              data.avatarUrl ||
              data.profilePhoto ||
              null;

            if (firebaseImage) {
              setProfileImage(
                firebaseImage
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
            'Firebase profile load error:',
            error
          );
        }
      };

    loadProfileData();
    loadFirebaseProfileData();
  }, []);

  const openedNumbers =
    useMemo(() => {
      return openedIndexes.map(
        (index) => cards[index]
      );
    }, [openedIndexes, cards]);

  const changeTurn = () => {
    setPlayerTurn(
      (previousTurn) =>
        previousTurn === 1
          ? 2
          : 1
    );
  };

  const startRound = () => {
    const availableBlueCards =
      blueCards.filter(
        (card) =>
          !usedBlueCards.includes(
            card
          )
      );

    if (
      availableBlueCards.length ===
      0
    ) {
      const winner =
        scores[1] > scores[2]
          ? `${loggedInPlayerName} wins!`
          : scores[2] >
            scores[1]
          ? `${secondPlayerName} wins!`
          : 'Draw!';

      Alert.alert(
        'Game Over',
        `${loggedInPlayerName}: ${scores[1]} points\n${secondPlayerName}: ${scores[2]} points\n\n${winner}`
      );

      return;
    }

    const randomBlueCard =
      availableBlueCards[
        Math.floor(
          Math.random() *
            availableBlueCards.length
        )
      ];

    setTargetNumber(
      randomBlueCard
    );

    setOpenedIndexes([]);

    setCards(
      shuffleArray(originalCards)
    );
  };

  const openCard = (index) => {
    if (
      targetNumber === null
    ) {
      Alert.alert(
        'Start Round',
        'Please select a blue target card first.'
      );

      return;
    }

    if (
      openedIndexes.includes(
        index
      )
    ) {
      return;
    }

    const newOpenedIndexes = [
      ...openedIndexes,
      index,
    ];

    const newOpenedNumbers =
      newOpenedIndexes.map(
        (openedIndex) =>
          cards[openedIndex]
      );

    setOpenedIndexes(
      newOpenedIndexes
    );

    const solution =
      canReachTarget(
        newOpenedNumbers,
        targetNumber
      );

    if (solution) {
      const newScores = {
        ...scores,

        [playerTurn]:
          scores[playerTurn] +
          targetNumber,
      };

      setScores(newScores);

      setUsedBlueCards([
        ...usedBlueCards,
        targetNumber,
      ]);

      const roundWinnerName =
        playerTurn === 1
          ? loggedInPlayerName
          : secondPlayerName;

      Alert.alert(
        '🎉 Round Winner!',
        `${roundWinnerName} reached ${targetNumber}\n\n${solution}\n\n${roundWinnerName} wins ${targetNumber} points!`
      );

      setTargetNumber(null);

      setOpenedIndexes([]);

      setCards(
        shuffleArray(
          originalCards
        )
      );

      changeTurn();

      return;
    }

    changeTurn();
  };

  const resetGame = () => {
    Alert.alert(
      'Reset Game?',
      'All scores and opened cards will be reset.',
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
              shuffleArray(
                originalCards
              )
            );

            setOpenedIndexes([]);

            setTargetNumber(null);

            setUsedBlueCards([]);

            setPlayerTurn(1);

            setScores({
              1: 0,
              2: 0,
            });
          },
        },
      ]
    );
  };

  if (showRules) {
    return (
      <ImageBackground
        source={require(
          '../assets/trioabout.png'
        )}
        style={
          styles.backgroundImage
        }
      >
        <LinearGradient
          colors={[
            '#FF9818',
            '#F06B00',
            '#B83A00',
          ]}
          style={
            styles.rulesContainer
          }
        >
          {renderExitButton()}

          <Text
            style={
              styles.rulesTitle
            }
          >
            TRIO GAME TYPE 3
          </Text>

          <Text
            style={
              styles.rulesSubtitle
            }
          >
            Hidden Card Challenge
          </Text>

          <View
            style={
              styles.rulesCard
            }
          >
            <Text
              style={
                styles.ruleText
              }
            >
              • This mode is played
              by 2 players.
            </Text>

            <Text
              style={
                styles.ruleText
              }
            >
              • Press Draw Blue Card
              to get the target
              number.
            </Text>

            <Text
              style={
                styles.ruleText
              }
            >
              • Cards are hidden at
              the beginning of each
              round.
            </Text>

            <Text
              style={
                styles.ruleText
              }
            >
              • Players take turns
              opening one card.
            </Text>

            <Text
              style={
                styles.ruleText
              }
            >
              • Try to reach the blue
              target number using
              opened cards.
            </Text>

            <Text
              style={
                styles.ruleText
              }
            >
              • The player who
              reaches the target wins
              that round.
            </Text>

            <Text
              style={
                styles.ruleText
              }
            >
              • The target number is
              added to the winner’s
              score.
            </Text>
          </View>

          <TouchableOpacity
            style={
              styles.startButton
            }
            onPress={() =>
              setShowRules(false)
            }
          >
            <Text
              style={
                styles.buttonText
              }
            >
              START GAME
            </Text>
          </TouchableOpacity>
        </LinearGradient>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground
      source={require(
        '../assets/trioabout.png'
      )}
      style={
        styles.backgroundImage
      }
    >
      <LinearGradient
        colors={[
          '#FF9818',
          '#F06B00',
          '#B83A00',
        ]}
        style={styles.container}
      >
        {renderExitButton()}

        <Text
          style={styles.title}
        >
          Game Type 3
        </Text>

        <Text
          style={styles.subtitle}
        >
          Hidden Card Challenge
        </Text>

        <View
          style={
            styles.playersBox
          }
        >
          <View
            style={[
              styles.playerCard,

              playerTurn === 1 &&
                styles.activePlayerCard,
            ]}
          >
            {profileImage ? (
              <Image
                source={{
                  uri: profileImage,
                }}
                style={
                  styles.profileImage
                }
              />
            ) : (
              <View
                style={
                  styles.defaultAvatar
                }
              >
                <Text
                  style={
                    styles.defaultAvatarText
                  }
                >
                  P1
                </Text>
              </View>
            )}

            <Text
              style={
                styles.playerName
              }
            >
              {
                loggedInPlayerName
              }
            </Text>

            <Text
              style={
                styles.playerScore
              }
            >
              {scores[1]} pts
            </Text>
          </View>

          <View
            style={[
              styles.playerCard,

              playerTurn === 2 &&
                styles.activePlayerCard,
            ]}
          >
            {secondPlayerPhoto ? (
              <Image
                source={{
                  uri: secondPlayerPhoto,
                }}
                style={
                  styles.profileImage
                }
              />
            ) : (
              <View
                style={
                  styles.defaultAvatar
                }
              >
                <Text
                  style={
                    styles.defaultAvatarText
                  }
                >
                  P2
                </Text>
              </View>
            )}

            <Text
              style={
                styles.playerName
              }
            >
              {secondPlayerName}
            </Text>

            <Text
              style={
                styles.playerScore
              }
            >
              {scores[2]} pts
            </Text>
          </View>
        </View>

        <Text
          style={
            styles.turnText
          }
        >
          Turn:{' '}
          {playerTurn === 1
            ? loggedInPlayerName
            : secondPlayerName}
        </Text>

        <TouchableOpacity
          style={
            styles.blueButton
          }
          onPress={startRound}
        >
          <Text
            style={
              styles.buttonText
            }
          >
            {targetNumber ===
            null
              ? 'Draw Blue Card'
              : `Target: ${targetNumber}`}
          </Text>
        </TouchableOpacity>

        <View
          style={styles.table}
        >
          {Array.from({
            length: 7,
          }).map(
            (_, rowIndex) => (
              <View
                key={rowIndex}
                style={styles.row}
              >
                {cards
                  .slice(
                    rowIndex * 7,
                    rowIndex * 7 +
                      7
                  )
                  .map(
                    (
                      value,
                      colIndex
                    ) => {
                      const index =
                        rowIndex *
                          7 +
                        colIndex;

                      const isOpened =
                        openedIndexes.includes(
                          index
                        );

                      return (
                        <TouchableOpacity
                          key={
                            index
                          }
                          style={[
                            styles.cell,
                            {
                              backgroundColor:
                                isOpened
                                  ? cardColors[
                                      index %
                                        cardColors.length
                                    ]
                                  : '#7C2D12',
                            },
                          ]}
                          onPress={() =>
                            openCard(
                              index
                            )
                          }
                          activeOpacity={
                            0.85
                          }
                        >
                          <Text
                            style={
                              styles.cellText
                            }
                          >
                            {isOpened
                              ? value
                              : '?'}
                          </Text>
                        </TouchableOpacity>
                      );
                    }
                  )}
              </View>
            )
          )}
        </View>

        <View
          style={
            styles.openedBox
          }
        >
          <Text
            style={
              styles.openedTitle
            }
          >
            Opened Numbers
          </Text>

          <Text
            style={
              styles.openedNumbers
            }
          >
            {openedNumbers.length >
            0
              ? openedNumbers.join(
                  '  |  '
                )
              : '-'}
          </Text>
        </View>

        <TouchableOpacity
          style={
            styles.resetButton
          }
          onPress={resetGame}
        >
          <Text
            style={
              styles.buttonText
            }
          >
            Reset Game
          </Text>
        </TouchableOpacity>
      </LinearGradient>
    </ImageBackground>
  );
}

const styles =
  StyleSheet.create({
    backgroundImage: {
      flex: 1,
      resizeMode: 'cover',
      backgroundColor: '#B83A00',
    },

    container: {
      flex: 1,
      paddingTop: 56,
      paddingHorizontal: 12,
      paddingBottom: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },

    exitButton: {
      position: 'absolute',
      top: 52,
      right: 16,
      zIndex: 20,
      backgroundColor:
        'rgba(120,38,0,0.76)',
      paddingVertical: 9,
      paddingHorizontal: 14,
      borderRadius: 14,
      borderWidth: 1,
      borderColor:
        'rgba(255,255,255,0.24)',
      shadowColor: '#64748B',
      shadowOffset: {
        width: 0,
        height: 5,
      },
      shadowOpacity: 0.15,
      shadowRadius: 10,
      elevation: 6,
    },

    exitButtonText: {
      color: '#F8FAFC',
      fontSize: 13,
      fontWeight: '900',
    },

    title: {
      color: '#F8FAFC',
      fontSize: 25,
      fontWeight: '900',
      marginBottom: 3,
    },

    subtitle: {
      color: '#FFEDD5',
      fontSize: 14,
      marginBottom: 10,
      fontWeight: '700',
    },

    playersBox: {
      width: '100%',
      flexDirection: 'row',
      gap: 10,
      marginBottom: 8,
    },

    playerCard: {
      flex: 1,
      backgroundColor:
        'rgba(120,38,0,0.48)',
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: 20,
      borderWidth: 1,
      borderColor:
        'rgba(255,255,255,0.18)',
      alignItems: 'center',
      shadowColor: '#7C2D12',
      shadowOffset: {
        width: 0,
        height: 5,
      },
      shadowOpacity: 0.12,
      shadowRadius: 10,
      elevation: 5,
    },

    activePlayerCard: {
      backgroundColor:
        'rgba(255,183,77,0.24)',
      borderColor:
        'rgba(255,221,153,0.76)',
      shadowColor: '#FB923C',
      shadowOpacity: 0.20,
    },

    profileImage: {
      width: 48,
      height: 48,
      borderRadius: 15,
      borderWidth: 2,
      borderColor: '#FFFFFF',
      marginBottom: 6,
    },

    defaultAvatar: {
      width: 48,
      height: 48,
      borderRadius: 15,
      backgroundColor: '#C2410C',
      borderWidth: 1,
      borderColor: '#FDBA74',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 6,
    },

    defaultAvatarText: {
      color: '#FFF7ED',
      fontSize: 15,
      fontWeight: '900',
    },

    playerName: {
      color: '#F8FAFC',
      fontSize: 13,
      fontWeight: '900',
      textAlign: 'center',
    },

    playerScore: {
      color: '#FED7AA',
      fontSize: 12,
      fontWeight: '900',
      marginTop: 3,
    },

    turnText: {
      width: '100%',
      color: '#F8FAFC',
      fontSize: 14,
      fontWeight: '900',
      textAlign: 'center',
      marginBottom: 9,
      paddingVertical: 9,
      borderRadius: 14,
      backgroundColor:
        'rgba(120,38,0,0.50)',
      borderWidth: 1,
      borderColor:
        'rgba(255,255,255,0.18)',
    },

    blueButton: {
      minWidth: '72%',
      backgroundColor: '#F97316',
      paddingVertical: 13,
      paddingHorizontal: 22,
      borderRadius: 16,
      marginBottom: 9,
      alignItems: 'center',
      shadowColor: '#FB923C',
      shadowOffset: {
        width: 0,
        height: 6,
      },
      shadowOpacity: 0.20,
      shadowRadius: 10,
      elevation: 6,
    },

    resetButton: {
      width: '100%',
      backgroundColor:
        'rgba(120,38,0,0.48)',
      paddingVertical: 12,
      paddingHorizontal: 22,
      borderRadius: 15,
      marginTop: 10,
      alignItems: 'center',
      borderWidth: 1,
      borderColor:
        'rgba(255,255,255,0.26)',
    },

    buttonText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '900',
    },

    table: {
      marginVertical: 6,
      padding: 7,
      borderRadius: 22,
      backgroundColor:
        'rgba(92,28,0,0.60)',
      borderWidth: 1,
      borderColor:
        'rgba(255,255,255,0.18)',
      shadowColor: '#7C2D12',
      shadowOffset: {
        width: 0,
        height: 8,
      },
      shadowOpacity: 0.12,
      shadowRadius: 16,
      elevation: 6,
    },

    row: {
      flexDirection: 'row',
    },

    cell: {
      width: 41,
      height: 41,
      margin: 2,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor:
        'rgba(255,255,255,0.24)',
      shadowColor: '#7C2D12',
      shadowOffset: {
        width: 0,
        height: 3,
      },
      shadowOpacity: 0.12,
      shadowRadius: 4,
      elevation: 3,
    },

    cellText: {
      fontSize: 18,
      color: '#FFFFFF',
      fontWeight: '900',
      textShadowColor:
        'rgba(0,0,0,0.16)',
      textShadowOffset: {
        width: 0,
        height: 1,
      },
      textShadowRadius: 2,
    },

    openedBox: {
      marginTop: 8,
      backgroundColor:
        'rgba(120,38,0,0.48)',
      paddingVertical: 9,
      paddingHorizontal: 12,
      borderRadius: 16,
      minWidth: '100%',
      alignItems: 'center',
      borderWidth: 1,
      borderColor:
        'rgba(255,255,255,0.18)',
    },

    openedTitle: {
      color: '#FED7AA',
      fontSize: 9,
      fontWeight: '900',
      letterSpacing: 1.1,
      marginBottom: 4,
    },

    openedNumbers: {
      color: '#FFF7ED',
      fontSize: 13,
      fontWeight: '800',
    },

    rulesContainer: {
      flex: 1,
      paddingTop: 62,
      paddingHorizontal: 22,
      paddingBottom: 28,
      alignItems: 'center',
      justifyContent: 'center',
    },

    rulesTitle: {
      fontSize: 30,
      color: '#F8FAFC',
      fontWeight: '900',
      marginBottom: 8,
      textAlign: 'center',
    },

    rulesSubtitle: {
      fontSize: 18,
      color: '#FFEDD5',
      marginBottom: 22,
      fontWeight: '700',
      textAlign: 'center',
    },

    rulesCard: {
      width: '100%',
      backgroundColor:
        'rgba(92,28,0,0.60)',
      borderRadius: 22,
      padding: 20,
      borderWidth: 1,
      borderColor:
        'rgba(255,255,255,0.18)',
      shadowColor: '#7C2D12',
      shadowOffset: {
        width: 0,
        height: 8,
      },
      shadowOpacity: 0.10,
      shadowRadius: 16,
      elevation: 5,
    },

    ruleText: {
      color: '#FFF7ED',
      fontSize: 15,
      fontWeight: '700',
      marginBottom: 12,
      lineHeight: 22,
    },

    startButton: {
      marginTop: 24,
      backgroundColor: '#F97316',
      paddingVertical: 15,
      paddingHorizontal: 45,
      borderRadius: 16,
      shadowColor: '#FB923C',
      shadowOffset: {
        width: 0,
        height: 6,
      },
      shadowOpacity: 0.20,
      shadowRadius: 10,
      elevation: 6,
    },
  });