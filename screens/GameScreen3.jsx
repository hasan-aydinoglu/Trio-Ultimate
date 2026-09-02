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
  const shuffled = [
    ...array,
  ];

  for (
    let index =
      shuffled.length - 1;
    index > 0;
    index -= 1
  ) {
    const randomIndex =
      Math.floor(
        Math.random() *
          (index + 1)
      );

    [
      shuffled[index],
      shuffled[randomIndex],
    ] = [
      shuffled[randomIndex],
      shuffled[index],
    ];
  }

  return shuffled;
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

  const permutationsOfThree = (
    values
  ) => {
    const [
      a,
      b,
      c,
    ] = values;

    return [
      [a, b, c],
      [a, c, b],
      [b, a, c],
      [b, c, a],
      [c, a, b],
      [c, b, a],
    ];
  };

  for (
    let firstIndex = 0;
    firstIndex <
    numbers.length - 2;
    firstIndex += 1
  ) {
    for (
      let secondIndex =
        firstIndex + 1;
      secondIndex <
      numbers.length - 1;
      secondIndex += 1
    ) {
      for (
        let thirdIndex =
          secondIndex + 1;
        thirdIndex <
        numbers.length;
        thirdIndex += 1
      ) {
        const threeNumbers = [
          numbers[firstIndex],
          numbers[secondIndex],
          numbers[thirdIndex],
        ];

        const permutations =
          permutationsOfThree(
            threeNumbers
          );

        for (
          const nums of
          permutations
        ) {
          for (
            const op1 of ops
          ) {
            for (
              const op2 of ops
            ) {
              const first =
                op1.fn(
                  nums[0],
                  nums[1]
                );

              if (
                first === null ||
                !Number.isFinite(
                  first
                )
              ) {
                continue;
              }

              const result =
                op2.fn(
                  first,
                  nums[2]
                );

              if (
                result === null ||
                !Number.isFinite(
                  result
                )
              ) {
                continue;
              }

              if (
                Math.abs(
                  result -
                    target
                ) < 0.0001
              ) {
                return `(${nums[0]} ${op1.symbol} ${nums[1]}) ${op2.symbol} ${nums[2]} = ${target}`;
              }
            }
          }
        }
      }
    }
  }

  return null;
};

/*
 * Yeni karıştırılan kart destesinin
 * içinden gerçekten çözülebilen Blue
 * Target kartlarını bulur.
 *
 * Sadece 3 fiziksel kartla yapılabilen
 * kombinasyonlar hesaba katılır.
 */
const getSolvableBlueCards = (
  cardDeck
) => {
  const cardCounts =
    cardDeck.reduce(
      (counts, value) => {
        counts[value] =
          (counts[value] || 0) + 1;

        return counts;
      },
      {}
    );

  const uniqueValues =
    Object.keys(
      cardCounts
    ).map(Number);

  const hasRequiredCards = (
    values
  ) => {
    const required =
      values.reduce(
        (counts, value) => {
          counts[value] =
            (counts[value] || 0) + 1;

          return counts;
        },
        {}
      );

    return Object.entries(
      required
    ).every(
      ([value, count]) =>
        (cardCounts[value] || 0) >=
        count
    );
  };

  return blueCards.filter(
    (target) => {
      for (
        let firstIndex = 0;
        firstIndex <
        uniqueValues.length;
        firstIndex += 1
      ) {
        for (
          let secondIndex =
            firstIndex;
          secondIndex <
          uniqueValues.length;
          secondIndex += 1
        ) {
          for (
            let thirdIndex =
              secondIndex;
            thirdIndex <
            uniqueValues.length;
            thirdIndex += 1
          ) {
            const values = [
              uniqueValues[
                firstIndex
              ],
              uniqueValues[
                secondIndex
              ],
              uniqueValues[
                thirdIndex
              ],
            ];

            if (
              !hasRequiredCards(
                values
              )
            ) {
              continue;
            }

            if (
              canReachTarget(
                values,
                target
              )
            ) {
              return true;
            }
          }
        }
      }

      return false;
    }
  );
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

  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const loadDarkMode = async () => {
      try {
        const savedDarkMode =
          await AsyncStorage.getItem(
            'trioDarkMode'
          );

        setIsDarkMode(
          savedDarkMode === 'true'
        );
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

  const gameGradientColors =
    isDarkMode
      ? [
          '#1B0903',
          '#3A1205',
          '#5A1B07',
        ]
      : [
          '#FF9818',
          '#F06B00',
          '#B83A00',
        ];

  const routePlayers =
    route?.params?.players || [];

  const getPlayerFromRoute = (
    playerId
  ) => {
    return routePlayers.find(
      (player) =>
        player.id === playerId
    );
  };

  const getPlayerUserId = (
    playerId
  ) => {
    const currentUser =
      auth.currentUser;

    const player =
      getPlayerFromRoute(
        playerId
      );

    const directUserId =
      player?.uid ||
      player?.userId ||
      player?.firebaseUid ||
      player?.authUid ||
      player?.user?.uid ||
      player?.user?.userId ||
      player?.profile?.uid ||
      null;

    if (directUserId) {
      return directUserId;
    }

    /*
     * Bu ekranın mevcut yapısında
     * Player 1 giriş yapan kullanıcıdır.
     */
    if (
      playerId === 1 &&
      currentUser?.uid
    ) {
      return currentUser.uid;
    }

    const invitedBy =
      route?.params?.invitedBy;

    const acceptedBy =
      route?.params?.acceptedBy;

    if (
      playerId === 2 &&
      route?.params?.isOnline ===
        true &&
      currentUser?.uid &&
      invitedBy &&
      acceptedBy
    ) {
      return currentUser.uid ===
        invitedBy
        ? acceptedBy
        : invitedBy;
    }

    return null;
  };

  const getPlayerName = (
    playerId
  ) => {
    const currentUser =
      auth.currentUser;

    const player =
      getPlayerFromRoute(
        playerId
      );

    const playerUserId =
      getPlayerUserId(
        playerId
      );

    if (
      playerUserId &&
      currentUser?.uid ===
        playerUserId
    ) {
      return (
        loggedInPlayerName ||
        player?.username ||
        player?.name ||
        player?.displayName ||
        `Player ${playerId}`
      );
    }

    if (playerId === 1) {
      return (
        loggedInPlayerName ||
        player?.username ||
        player?.name ||
        'Player 1'
      );
    }

    return (
      player?.username ||
      player?.name ||
      player?.fullName ||
      player?.displayName ||
      player?.email ||
      `Player ${playerId}`
    );
  };

  const getPlayerPhoto = (
    playerId
  ) => {
    const currentUser =
      auth.currentUser;

    const player =
      getPlayerFromRoute(
        playerId
      );

    const routePhoto =
      player?.photo ||
      player?.image ||
      player?.avatar ||
      player?.avatarUrl ||
      player?.profileImage ||
      player?.photoURL ||
      player?.profilePhoto ||
      null;

    if (routePhoto) {
      return routePhoto;
    }

    const playerUserId =
      getPlayerUserId(
        playerId
      );

    if (
      playerUserId &&
      currentUser?.uid ===
        playerUserId &&
      profileImage
    ) {
      return profileImage;
    }

    if (
      playerId === 1 &&
      profileImage
    ) {
      return profileImage;
    }

    return null;
  };

  const openPlayerProfile = (
    playerId
  ) => {
    const currentUser =
      auth.currentUser;

    const playerUserId =
      getPlayerUserId(
        playerId
      );

    if (!playerUserId) {
      Alert.alert(
        'Profile unavailable',
        'This player profile is not available in this match.'
      );

      return;
    }

    if (
      currentUser?.uid ===
      playerUserId
    ) {
      navigation.navigate(
        'TabNavigator',
        {
          screen: 'Profile',
        }
      );

      return;
    }

    const player =
      getPlayerFromRoute(
        playerId
      );

    const playerPhoto =
      getPlayerPhoto(
        playerId
      );

    navigation.navigate(
      'UserProfileScreen',
      {
        userId:
          playerUserId,

        uid:
          playerUserId,

        profileUserId:
          playerUserId,

        selectedUserId:
          playerUserId,

        user: {
          ...(player || {}),

          uid:
            playerUserId,

          userId:
            playerUserId,

          name:
            getPlayerName(
              playerId
            ),

          username:
            player?.username ||
            player?.name ||
            getPlayerName(
              playerId
            ),

          photo:
            playerPhoto,

          image:
            playerPhoto,

          avatar:
            playerPhoto,

          profileImage:
            playerPhoto,

          photoURL:
            playerPhoto,
        },
      }
    );
  };

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

  const renderBackgroundDecor = () => (
    <View
      pointerEvents="none"
      style={styles.backgroundDecor}
    >
      <View
        style={[
          styles.glowOrb,
          styles.glowOrbOne,
        ]}
      />

      <View
        style={[
          styles.glowOrb,
          styles.glowOrbTwo,
        ]}
      />

      <View
        style={[
          styles.glowOrb,
          styles.glowOrbThree,
        ]}
      />

      <View
        style={[
          styles.cardPattern,
          styles.cardPatternOne,
        ]}
      >
        <Text style={styles.cardPatternText}>?</Text>
      </View>

      <View
        style={[
          styles.cardPattern,
          styles.cardPatternTwo,
        ]}
      >
        <Text style={styles.cardPatternText}>?</Text>
      </View>

      <View
        style={[
          styles.cardPattern,
          styles.cardPatternThree,
        ]}
      >
        <Text style={styles.cardPatternText}>?</Text>
      </View>

      <Text
        style={[
          styles.backgroundSymbol,
          styles.backgroundSymbolOne,
        ]}
      >
        ?
      </Text>

      <Text
        style={[
          styles.backgroundSymbol,
          styles.backgroundSymbolTwo,
        ]}
      >
        ×
      </Text>

      <Text
        style={[
          styles.backgroundSymbol,
          styles.backgroundSymbolThree,
        ]}
      >
        +
      </Text>
    </View>
  );

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

  const renderPlayerCard = (
    playerId
  ) => {
    const photo =
      getPlayerPhoto(
        playerId
      );

    const isActive =
      playerTurn === playerId;

    return (
      <View
        style={[
          styles.playerCard,
          isDarkMode &&
            styles.playerCardDark,
          isActive &&
            styles.activePlayerCard,
        ]}
      >
        <View
          style={[
            styles.playerStatusDot,
            isActive &&
              styles.activeStatusDot,
          ]}
        />

        <TouchableOpacity
          onPress={() =>
            openPlayerProfile(
              playerId
            )
          }
          activeOpacity={0.78}
          style={
            styles.profileButton
          }
        >
          <LinearGradient
            colors={
              isActive
                ? [
                    '#FDBA74',
                    '#F97316',
                  ]
                : [
                    '#C2410C',
                    '#7C2D12',
                  ]
            }
            style={
              styles.avatarGlow
            }
          >
            {photo ? (
              <Image
                source={{
                  uri: photo,
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
                  P{playerId}
                </Text>
              </View>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <Text
          numberOfLines={1}
          style={
            styles.playerName
          }
        >
          {getPlayerName(
            playerId
          )}
        </Text>

        <View
          style={
            styles.scoreBadge
          }
        >
          <Text
            style={
              styles.scoreLabel
            }
          >
            SCORE
          </Text>

          <Text
            style={
              styles.playerScore
            }
          >
            {scores[playerId]}
          </Text>
        </View>
      </View>
    );
  };

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
    const newCards =
      shuffleArray(
        originalCards
      );

    const solvableBlueCards =
      getSolvableBlueCards(
        newCards
      );

    const availableBlueCards =
      solvableBlueCards.filter(
        (card) =>
          !usedBlueCards.includes(
            card
          )
      );

    if (
      availableBlueCards.length ===
      0
    ) {
      const playerOneName =
        getPlayerName(1);

      const playerTwoName =
        getPlayerName(2);

      const winner =
        scores[1] > scores[2]
          ? `${playerOneName} wins!`
          : scores[2] >
            scores[1]
          ? `${playerTwoName} wins!`
          : 'Draw!';

      Alert.alert(
        'Game Over',
        `${playerOneName}: ${scores[1]} points\n${playerTwoName}: ${scores[2]} points\n\n${winner}`
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

    /*
     * Target ve tablo aynı yeni tur
     * setup'ından gelir. Böylece seçilen
     * hedefin bu kart destesinin içinde
     * kesin çözümü vardır.
     */
    setCards(
      newCards
    );

    setTargetNumber(
      randomBlueCard
    );

    setOpenedIndexes([]);
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
        getPlayerName(
          playerTurn
        );

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
          colors={gameGradientColors}
          start={{
            x: 0,
            y: 0,
          }}
          end={{
            x: 1,
            y: 1,
          }}
          style={
            styles.rulesContainer
          }
        >
          {renderBackgroundDecor()}

          {isDarkMode && (
            <View
              pointerEvents="none"
              style={
                styles.darkModeOverlay
              }
            />
          )}

          {renderExitButton()}

          <View
            style={
              styles.modeBadge
            }
          >
            <Text
              style={
                styles.modeBadgeIcon
              }
            >
              ?
            </Text>

            <Text
              style={
                styles.modeBadgeText
              }
            >
              MODE 3
            </Text>
          </View>

          <Text
            style={
              styles.rulesEyebrow
            }
          >
            TRIO HIDDEN PLAY
          </Text>

          <Text
            style={
              styles.rulesTitle
            }
          >
            Hidden Card Challenge
          </Text>

          <Text
            style={
              styles.rulesSubtitle
            }
          >
            Reveal cards one by one, discover the right combination and reach the target before your opponent.
          </Text>

          <View
            style={[
              styles.rulesCard,
              isDarkMode &&
                styles.darkGlassPanel,
            ]}
          >
            {[
              ['01', 'This mode is played by 2 players'],
              ['02', 'Draw a target to begin a new round'],
              ['03', 'Every round starts with a freshly shuffled hidden grid'],
              ['04', 'Players take turns revealing one card'],
              ['05', 'Use any 3 revealed numbers with +, −, × or ÷'],
              ['06', 'The target value is added to the round winner’s score'],
            ].map(
              ([number, rule]) => (
                <View
                  key={number}
                  style={
                    styles.ruleRow
                  }
                >
                  <View
                    style={
                      styles.ruleNumber
                    }
                  >
                    <Text
                      style={
                        styles.ruleNumberText
                      }
                    >
                      {number}
                    </Text>
                  </View>

                  <Text
                    style={
                      styles.ruleText
                    }
                  >
                    {rule}
                  </Text>
                </View>
              )
            )}
          </View>

          <TouchableOpacity
            style={
              styles.startButton
            }
            onPress={() => {
              setCards(
                shuffleArray(
                  originalCards
                )
              );

              setOpenedIndexes([]);

              setTargetNumber(null);

              setShowRules(false);
            }}
            activeOpacity={0.86}
          >
            <LinearGradient
              colors={[
                '#FDBA74',
                '#F97316',
                '#C2410C',
              ]}
              start={{
                x: 0,
                y: 0,
              }}
              end={{
                x: 1,
                y: 1,
              }}
              style={
                styles.primaryButtonGradient
              }
            >
              <Text
                style={
                  styles.buttonText
                }
              >
                Start Game
              </Text>

              <Text
                style={
                  styles.buttonArrow
                }
              >
                →
              </Text>
            </LinearGradient>
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
        colors={gameGradientColors}
        start={{
          x: 0,
          y: 0,
        }}
        end={{
          x: 1,
          y: 1,
        }}
        style={
          styles.container
        }
      >
        {renderBackgroundDecor()}

        {isDarkMode && (
          <View
            pointerEvents="none"
            style={
              styles.darkModeOverlay
            }
          />
        )}

        {renderExitButton()}

        <View
          style={
            styles.gameHeader
          }
        >
          <View>
            <Text
              style={
                styles.gameEyebrow
              }
            >
              TRIO · TYPE 3
            </Text>

            <Text
              style={
                styles.gameTitle
              }
            >
              Hidden Card Challenge
            </Text>
          </View>

          <View
            style={
              styles.modeNumberBadge
            }
          >
            <Text
              style={
                styles.modeNumberText
              }
            >
              3
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.playersPanel,
            isDarkMode &&
              styles.darkGlassPanel,
          ]}
        >
          <View
            style={
              styles.playersBox
            }
          >
            {renderPlayerCard(1)}
            {renderPlayerCard(2)}
          </View>
        </View>

        <View
          style={[
            styles.turnBanner,
            isDarkMode &&
              styles.darkGlassPanel,
          ]}
        >
          <View
            style={
              styles.turnDot
            }
          />

          <Text
            style={
              styles.turnLabel
            }
          >
            CURRENT TURN
          </Text>

          <Text
            numberOfLines={1}
            style={
              styles.turnPlayer
            }
          >
            {getPlayerName(
              playerTurn
            )}
          </Text>
        </View>

        <TouchableOpacity
          style={
            styles.targetCard
          }
          onPress={startRound}
          activeOpacity={0.86}
        >
          <LinearGradient
            colors={
              targetNumber === null
                ? [
                    '#FDBA74',
                    '#F97316',
                    '#C2410C',
                  ]
                : [
                    '#FFEDD5',
                    '#FDBA74',
                    '#F97316',
                  ]
            }
            start={{
              x: 0,
              y: 0,
            }}
            end={{
              x: 1,
              y: 1,
            }}
            style={
              styles.targetGradient
            }
          >
            <View>
              <Text
                style={
                  styles.targetLabel
                }
              >
                BLUE TARGET
              </Text>

              <Text
                style={
                  styles.targetHint
                }
              >
                {targetNumber === null
                  ? 'Tap to draw a solvable target'
                  : 'Reveal cards and build this result'}
              </Text>
            </View>

            <View
              style={
                styles.targetNumberBox
              }
            >
              <Text
                style={
                  styles.targetNumber
                }
              >
                {targetNumber === null
                  ? '?'
                  : targetNumber}
              </Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        <View
          style={[
            styles.boardCard,
            isDarkMode &&
              styles.darkTable,
          ]}
        >
          <View
            style={
              styles.boardTopRow
            }
          >
            <View>
              <Text
                style={
                  styles.boardTitle
                }
              >
                HIDDEN GRID
              </Text>

              <Text
                style={
                  styles.boardSubtitle
                }
              >
                Tap one card per turn
              </Text>
            </View>

            <View
              style={
                styles.openCounterBadge
              }
            >
              <Text
                style={
                  styles.openCounterValue
                }
              >
                {openedIndexes.length}
              </Text>

              <Text
                style={
                  styles.openCounterLabel
                }
              >
                OPEN
              </Text>
            </View>
          </View>

          <View
            style={
              styles.table
            }
          >
            {Array.from({
              length: 7,
            }).map(
              (_, rowIndex) => (
                <View
                  key={rowIndex}
                  style={
                    styles.row
                  }
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
                            key={index}
                            style={[
                              styles.cell,
                              isOpened
                                ? styles.openedCell
                                : styles.hiddenCell,
                              isDarkMode &&
                                !isOpened &&
                                styles.darkHiddenCell,
                            ]}
                            onPress={() =>
                              openCard(
                                index
                              )
                            }
                            activeOpacity={
                              0.82
                            }
                          >
                            <View
                              style={
                                styles.cellHighlight
                              }
                            />

                            <Text
                              style={[
                                styles.cellText,
                                !isOpened &&
                                  styles.hiddenCellText,
                              ]}
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
        </View>

        <View
          style={[
            styles.openedBox,
            isDarkMode &&
              styles.darkGlassPanel,
          ]}
        >
          <View>
            <Text
              style={
                styles.openedTitle
              }
            >
              REVEALED NUMBERS
            </Text>

            <Text
              style={
                styles.openedHint
              }
            >
              Any 3 revealed cards can form the target
            </Text>
          </View>

          <Text
            numberOfLines={1}
            style={
              styles.openedNumbers
            }
          >
            {openedNumbers.length >
            0
              ? openedNumbers.join(
                  '  ·  '
                )
              : '—'}
          </Text>
        </View>

        <TouchableOpacity
          style={
            styles.resetButton
          }
          onPress={resetGame}
          activeOpacity={0.82}
        >
          <Text
            style={
              styles.resetButtonText
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

    darkModeOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor:
        'rgba(0,0,0,0.20)',
    },

    darkGlassPanel: {
      backgroundColor:
        'rgba(35,10,3,0.82)',
      borderColor:
        'rgba(255,255,255,0.10)',
    },

    darkTable: {
      backgroundColor:
        'rgba(30,8,2,0.88)',
      borderColor:
        'rgba(255,255,255,0.10)',
      shadowColor: '#000000',
    },

    playerCardDark: {
      backgroundColor:
        'rgba(40,11,3,0.76)',
      borderColor:
        'rgba(255,255,255,0.10)',
    },

    darkHiddenCell: {
      backgroundColor:
        'rgba(68,20,4,0.94)',
    },

    backgroundDecor: {
      ...StyleSheet.absoluteFillObject,
      overflow: 'hidden',
      zIndex: 0,
    },

    glowOrb: {
      position: 'absolute',
      borderRadius: 999,
    },

    glowOrbOne: {
      width: 300,
      height: 300,
      top: -130,
      right: -115,
      backgroundColor:
        'rgba(255,224,178,0.18)',
    },

    glowOrbTwo: {
      width: 255,
      height: 255,
      bottom: -115,
      left: -115,
      backgroundColor:
        'rgba(124,45,18,0.34)',
    },

    glowOrbThree: {
      width: 175,
      height: 175,
      top: '42%',
      right: -95,
      backgroundColor:
        'rgba(251,146,60,0.16)',
    },

    cardPattern: {
      position: 'absolute',
      width: 70,
      height: 94,
      borderRadius: 18,
      borderWidth: 2,
      borderColor:
        'rgba(255,255,255,0.065)',
      backgroundColor:
        'rgba(255,255,255,0.025)',
      alignItems: 'center',
      justifyContent: 'center',
    },

    cardPatternOne: {
      top: 115,
      left: -22,
      transform: [
        {
          rotate: '-17deg',
        },
      ],
    },

    cardPatternTwo: {
      top: '38%',
      right: -26,
      transform: [
        {
          rotate: '15deg',
        },
      ],
    },

    cardPatternThree: {
      bottom: 85,
      left: 18,
      transform: [
        {
          rotate: '9deg',
        },
      ],
    },

    cardPatternText: {
      color:
        'rgba(255,255,255,0.08)',
      fontSize: 34,
      fontWeight: '900',
    },

    backgroundSymbol: {
      position: 'absolute',
      color:
        'rgba(255,255,255,0.045)',
      fontWeight: '900',
    },

    backgroundSymbolOne: {
      top: 55,
      left: '38%',
      fontSize: 88,
      transform: [
        {
          rotate: '-8deg',
        },
      ],
    },

    backgroundSymbolTwo: {
      top: '51%',
      left: 22,
      fontSize: 74,
      transform: [
        {
          rotate: '12deg',
        },
      ],
    },

    backgroundSymbolThree: {
      bottom: 25,
      right: 35,
      fontSize: 86,
      transform: [
        {
          rotate: '-10deg',
        },
      ],
    },

    container: {
      flex: 1,
      paddingTop: 52,
      paddingHorizontal: 14,
      paddingBottom: 14,
      alignItems: 'center',
      justifyContent:
        'flex-start',
    },

    exitButton: {
      position: 'absolute',
      top: 44,
      right: 16,
      zIndex: 20,
      minHeight: 36,
      paddingVertical: 8,
      paddingHorizontal: 14,
      borderRadius: 13,
      backgroundColor:
        'rgba(124,45,18,0.76)',
      borderWidth: 1,
      borderColor:
        'rgba(255,255,255,0.24)',
      shadowColor: '#7C2D12',
      shadowOffset: {
        width: 0,
        height: 6,
      },
      shadowOpacity: 0.24,
      shadowRadius: 10,
      elevation: 7,
    },

    exitButtonText: {
      color: '#FFF7ED',
      fontSize: 13,
      fontWeight: '900',
    },

    gameHeader: {
      width: '100%',
      minHeight: 46,
      marginBottom: 7,
      paddingRight: 72,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-between',
    },

    gameEyebrow: {
      color: '#FED7AA',
      fontSize: 10,
      fontWeight: '900',
      letterSpacing: 1.7,
      marginBottom: 3,
    },

    gameTitle: {
      color: '#FFFFFF',
      fontSize: 19,
      fontWeight: '900',
      letterSpacing: -0.5,
    },

    modeNumberBadge: {
      width: 40,
      height: 40,
      borderRadius: 15,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        'rgba(255,255,255,0.14)',
      borderWidth: 1,
      borderColor:
        'rgba(255,255,255,0.28)',
    },

    modeNumberText: {
      color: '#FFFFFF',
      fontSize: 18,
      fontWeight: '900',
    },

    playersPanel: {
      width: '100%',
      padding: 6,
      marginBottom: 7,
      borderRadius: 20,
      backgroundColor:
        'rgba(124,45,18,0.44)',
      borderWidth: 1,
      borderColor:
        'rgba(255,255,255,0.16)',
    },

    playersBox: {
      width: '100%',
      flexDirection: 'row',
      gap: 9,
    },

    playerCard: {
      position: 'relative',
      flex: 1,
      minHeight: 91,
      paddingVertical: 7,
      paddingHorizontal: 5,
      borderRadius: 17,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        'rgba(124,45,18,0.42)',
      borderWidth: 1,
      borderColor:
        'rgba(255,255,255,0.10)',
    },

    activePlayerCard: {
      backgroundColor:
        'rgba(251,146,60,0.20)',
      borderColor:
        'rgba(254,215,170,0.72)',
      shadowColor: '#FB923C',
      shadowOffset: {
        width: 0,
        height: 0,
      },
      shadowOpacity: 0.26,
      shadowRadius: 9,
      elevation: 6,
    },

    playerStatusDot: {
      position: 'absolute',
      top: 8,
      right: 8,
      width: 7,
      height: 7,
      borderRadius: 4,
      backgroundColor:
        'rgba(255,255,255,0.20)',
    },

    activeStatusDot: {
      backgroundColor: '#FDE68A',
      shadowColor: '#FDE68A',
      shadowOffset: {
        width: 0,
        height: 0,
      },
      shadowOpacity: 0.8,
      shadowRadius: 5,
      elevation: 4,
    },

    profileButton: {
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 16,
    },

    avatarGlow: {
      width: 46,
      height: 46,
      padding: 2,
      marginBottom: 5,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 15,
    },

    profileImage: {
      width: 42,
      height: 42,
      borderRadius: 13,
      borderWidth: 1,
      borderColor:
        'rgba(255,255,255,0.84)',
    },

    defaultAvatar: {
      width: 42,
      height: 42,
      borderRadius: 13,
      backgroundColor: '#9A3412',
      borderWidth: 1,
      borderColor: '#FDBA74',
      alignItems: 'center',
      justifyContent: 'center',
    },

    defaultAvatarText: {
      color: '#FFF7ED',
      fontSize: 13,
      fontWeight: '900',
    },

    playerName: {
      width: '100%',
      color: '#FFFFFF',
      fontSize: 10,
      fontWeight: '900',
      textAlign: 'center',
      marginBottom: 4,
    },

    scoreBadge: {
      minWidth: 54,
      height: 22,
      paddingHorizontal: 7,
      borderRadius: 8,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        'rgba(255,255,255,0.11)',
    },

    scoreLabel: {
      color: '#FED7AA',
      fontSize: 6,
      fontWeight: '900',
      letterSpacing: 0.7,
      marginRight: 4,
    },

    playerScore: {
      color: '#FFFFFF',
      fontSize: 11,
      fontWeight: '900',
    },

    turnBanner: {
      width: '100%',
      height: 36,
      paddingHorizontal: 11,
      marginBottom: 7,
      borderRadius: 13,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor:
        'rgba(124,45,18,0.45)',
      borderWidth: 1,
      borderColor:
        'rgba(255,255,255,0.14)',
    },

    turnDot: {
      width: 7,
      height: 7,
      borderRadius: 4,
      marginRight: 9,
      backgroundColor: '#FDE68A',
    },

    turnLabel: {
      color: '#FED7AA',
      fontSize: 8,
      fontWeight: '900',
      letterSpacing: 1.1,
      marginRight: 9,
    },

    turnPlayer: {
      flex: 1,
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '900',
    },

    targetCard: {
      width: '100%',
      marginBottom: 7,
      borderRadius: 17,
      overflow: 'hidden',
      shadowColor: '#C2410C',
      shadowOffset: {
        width: 0,
        height: 7,
      },
      shadowOpacity: 0.26,
      shadowRadius: 12,
      elevation: 8,
    },

    targetGradient: {
      minHeight: 66,
      paddingHorizontal: 14,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-between',
    },

    targetLabel: {
      color: '#FFF7ED',
      fontSize: 10,
      fontWeight: '900',
      letterSpacing: 1.7,
    },

    targetHint: {
      maxWidth: 240,
      color: '#FFFFFF',
      fontSize: 11,
      marginTop: 4,
      fontWeight: '700',
    },

    targetNumberBox: {
      width: 50,
      height: 50,
      borderRadius: 15,
      backgroundColor:
        'rgba(255,255,255,0.22)',
      borderWidth: 1,
      borderColor:
        'rgba(255,255,255,0.46)',
      alignItems: 'center',
      justifyContent: 'center',
    },

    targetNumber: {
      color: '#7C2D12',
      fontSize: 25,
      fontWeight: '900',
    },

    boardCard: {
      width: '100%',
      paddingTop: 8,
      paddingHorizontal: 6,
      paddingBottom: 7,
      borderRadius: 18,
      backgroundColor:
        'rgba(92,28,0,0.60)',
      borderWidth: 1,
      borderColor:
        'rgba(255,255,255,0.17)',
      shadowColor: '#7C2D12',
      shadowOffset: {
        width: 0,
        height: 8,
      },
      shadowOpacity: 0.18,
      shadowRadius: 14,
      elevation: 6,
    },

    boardTopRow: {
      width: '100%',
      minHeight: 38,
      paddingHorizontal: 4,
      marginBottom: 5,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-between',
    },

    boardTitle: {
      color: '#FFFFFF',
      fontSize: 9,
      fontWeight: '900',
      letterSpacing: 1.4,
    },

    boardSubtitle: {
      color: '#FED7AA',
      fontSize: 8,
      fontWeight: '700',
      marginTop: 2,
    },

    openCounterBadge: {
      minWidth: 45,
      height: 31,
      paddingHorizontal: 8,
      borderRadius: 10,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        'rgba(255,255,255,0.11)',
    },

    openCounterValue: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '900',
      marginRight: 4,
    },

    openCounterLabel: {
      color: '#FED7AA',
      fontSize: 6,
      fontWeight: '900',
      letterSpacing: 0.6,
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
      width: 40,
      height: 40,
      margin: 1.8,
      borderRadius: 11,
      overflow: 'hidden',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor:
        'rgba(255,255,255,0.17)',
      shadowColor: '#7C2D12',
      shadowOffset: {
        width: 0,
        height: 3,
      },
      shadowOpacity: 0.16,
      shadowRadius: 4,
      elevation: 3,
    },

    hiddenCell: {
      backgroundColor: '#7C2D12',
    },

    openedCell: {
      backgroundColor: '#F97316',
      borderColor:
        'rgba(255,247,237,0.60)',
      shadowColor: '#FDBA74',
      shadowOpacity: 0.26,
    },

    cellHighlight: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '42%',
      backgroundColor:
        'rgba(255,255,255,0.12)',
    },

    cellText: {
      color: '#FFFFFF',
      fontSize: 17,
      fontWeight: '900',
      textShadowColor:
        'rgba(0,0,0,0.18)',
      textShadowOffset: {
        width: 0,
        height: 1,
      },
      textShadowRadius: 2,
    },

    hiddenCellText: {
      color: '#FED7AA',
      fontSize: 18,
    },

    openedBox: {
      width: '100%',
      minHeight: 52,
      marginTop: 7,
      paddingVertical: 7,
      paddingHorizontal: 11,
      borderRadius: 15,
      backgroundColor:
        'rgba(124,45,18,0.44)',
      borderWidth: 1,
      borderColor:
        'rgba(255,255,255,0.14)',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-between',
    },

    openedTitle: {
      color: '#FED7AA',
      fontSize: 8,
      fontWeight: '900',
      letterSpacing: 1,
    },

    openedHint: {
      color: '#FFEDD5',
      fontSize: 8,
      fontWeight: '600',
      marginTop: 3,
    },

    openedNumbers: {
      maxWidth: '43%',
      color: '#FFFFFF',
      fontSize: 11,
      fontWeight: '900',
      textAlign: 'right',
    },

    resetButton: {
      width: '100%',
      height: 38,
      marginTop: 6,
      borderRadius: 13,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        'rgba(124,45,18,0.48)',
      borderWidth: 1,
      borderColor:
        'rgba(255,255,255,0.17)',
    },

    resetButtonText: {
      color: '#FFF7ED',
      fontSize: 13,
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
      width: 66,
      height: 66,
      marginBottom: 16,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        'rgba(255,255,255,0.14)',
      borderWidth: 1,
      borderColor:
        'rgba(255,255,255,0.30)',
      shadowColor: '#7C2D12',
      shadowOffset: {
        width: 0,
        height: 6,
      },
      shadowOpacity: 0.18,
      shadowRadius: 10,
      elevation: 6,
    },

    modeBadgeIcon: {
      color: '#FFFFFF',
      fontSize: 22,
      fontWeight: '900',
      lineHeight: 24,
    },

    modeBadgeText: {
      color: '#FFEDD5',
      fontSize: 8,
      fontWeight: '900',
      letterSpacing: 1,
    },

    rulesEyebrow: {
      color: '#FED7AA',
      fontSize: 10,
      fontWeight: '900',
      letterSpacing: 2,
      marginBottom: 6,
    },

    rulesTitle: {
      color: '#FFFFFF',
      fontSize: 28,
      fontWeight: '900',
      letterSpacing: -0.8,
      textAlign: 'center',
      marginBottom: 6,
    },

    rulesSubtitle: {
      maxWidth: 335,
      color: '#FFEDD5',
      fontSize: 12,
      fontWeight: '700',
      lineHeight: 18,
      textAlign: 'center',
      marginBottom: 16,
    },

    rulesCard: {
      width: '100%',
      paddingVertical: 7,
      paddingHorizontal: 14,
      borderRadius: 20,
      backgroundColor:
        'rgba(92,28,0,0.56)',
      borderWidth: 1,
      borderColor:
        'rgba(255,255,255,0.16)',
      shadowColor: '#7C2D12',
      shadowOffset: {
        width: 0,
        height: 8,
      },
      shadowOpacity: 0.14,
      shadowRadius: 14,
      elevation: 5,
    },

    ruleRow: {
      minHeight: 42,
      flexDirection: 'row',
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor:
        'rgba(255,255,255,0.09)',
    },

    ruleNumber: {
      width: 27,
      height: 27,
      marginRight: 10,
      borderRadius: 9,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        'rgba(251,146,60,0.18)',
    },

    ruleNumberText: {
      color: '#FED7AA',
      fontSize: 8,
      fontWeight: '900',
    },

    ruleText: {
      flex: 1,
      color: '#FFF7ED',
      fontSize: 12,
      fontWeight: '700',
      lineHeight: 16,
    },

    startButton: {
      width: '100%',
      height: 47,
      marginTop: 16,
      borderRadius: 16,
      overflow: 'hidden',
      shadowColor: '#C2410C',
      shadowOffset: {
        width: 0,
        height: 7,
      },
      shadowOpacity: 0.28,
      shadowRadius: 12,
      elevation: 8,
    },

    primaryButtonGradient: {
      flex: 1,
      minHeight: 47,
      paddingHorizontal: 20,
      borderRadius: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },

    buttonText: {
      color: '#FFFFFF',
      fontSize: 13,
      fontWeight: '900',
    },

    buttonArrow: {
      position: 'absolute',
      right: 19,
      color: '#FFFFFF',
      fontSize: 21,
      fontWeight: '700',
    },
  });