import React, { useState, useEffect } from 'react';
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

const tableData = [
  [3, 7, 3, 5, 8, 4, 9],
  [5, 1, 8, 6, 5, 2, 7],
  [8, 6, 2, 4, 9, 1, 9],
  [2, 6, 4, 7, 5, 5, 3],
  [7, 4, 3, 2, 1, 6, 3],
  [2, 1, 4, 8, 3, 9, 5],
  [1, 8, 6, 7, 2, 4, 6],
];

const cellColors = [
  [
    '#e67e22',
    '#e84393',
    '#e67e22',
    '#8e44ad',
    '#e67e22',
    '#e84393',
    '#e67e22',
  ],
  [
    '#8e44ad',
    '#e67e22',
    '#e84393',
    '#e67e22',
    '#e67e22',
    '#e84393',
    '#e67e22',
  ],
  [
    '#e84393',
    '#e67e22',
    '#8e44ad',
    '#e67e22',
    '#e84393',
    '#8e44ad',
    '#e67e22',
  ],
  [
    '#8e44ad',
    '#e67e22',
    '#e84393',
    '#e67e22',
    '#e84393',
    '#8e44ad',
    '#e84393',
  ],
  [
    '#e67e22',
    '#e84393',
    '#e67e22',
    '#8e44ad',
    '#e67e22',
    '#e84393',
    '#e67e22',
  ],
  [
    '#8e44ad',
    '#e67e22',
    '#e84393',
    '#e67e22',
    '#e67e22',
    '#e84393',
    '#8e44ad',
  ],
  [
    '#e67e22',
    '#e84393',
    '#e67e22',
    '#8e44ad',
    '#e84393',
    '#e84393',
    '#e67e22',
  ],
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
  {
    id: 3,
    name: 'Player 3',
    photo: null,
  },
  {
    id: 4,
    name: 'Player 4',
    photo: null,
  },
];

const createNumberPool = () => {
  const numbers = Array.from(
    { length: 50 },
    (_, index) => index + 1
  );

  return numbers.sort(
    () => Math.random() - 0.5
  );
};

const shuffleTable = () => {
  const flatNumbers = tableData.flat();

  const shuffled = [
    ...flatNumbers,
  ].sort(() => Math.random() - 0.5);

  const newTable = [];

  for (
    let index = 0;
    index < tableData.length;
    index += 1
  ) {
    newTable.push(
      shuffled.slice(
        index * tableData[0].length,
        (index + 1) *
          tableData[0].length
      )
    );
  }

  return newTable;
};

const GameScreen = ({
  navigation,
  route,
}) => {
  const [
    selectedCells,
    setSelectedCells,
  ] = useState([]);

  const [
    randomNumber,
    setRandomNumber,
  ] = useState(null);

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
    currentTableData,
    setCurrentTableData,
  ] = useState(tableData);

  const [
    numberPool,
    setNumberPool,
  ] = useState(createNumberPool());

  const [
    gameOver,
    setGameOver,
  ] = useState(false);

  const [
    currentPlayer,
    setCurrentPlayer,
  ] = useState(1);

  const [
    scores,
    setScores,
  ] = useState({
    1: 0,
    2: 0,
    3: 0,
    4: 0,
  });

  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const loadDarkMode = async () => {
      try {
        const value = await AsyncStorage.getItem('trioDarkMode');
        setIsDarkMode(value === 'true');
      } catch (error) {
        console.log('Dark mode load error:', error);
      }
    };

    loadDarkMode();
    const unsubscribe = navigation.addListener('focus', loadDarkMode);
    return unsubscribe;
  }, [navigation]);

  const gameGradientColors = isDarkMode
    ? ['#06111F', '#071C35', '#08284A']
    : ['#12B5F5', '#087CE3', '#073B9B'];

  const routePlayers =
    route?.params?.players ||
    players;

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

              if (
                isOnline &&
                inviteId
              ) {
                const invitedBy =
                  route?.params?.invitedBy;

                const acceptedBy =
                  route?.params?.acceptedBy;

                const winnerId =
                  currentUser?.uid ===
                  invitedBy
                    ? acceptedBy || null
                    : invitedBy || null;

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

      <Text
        style={[
          styles.mathSymbol,
          styles.mathSymbolOne,
        ]}
      >
        ×
      </Text>

      <Text
        style={[
          styles.mathSymbol,
          styles.mathSymbolTwo,
        ]}
      >
        +
      </Text>

      <Text
        style={[
          styles.mathSymbol,
          styles.mathSymbolThree,
        ]}
      >
        ÷
      </Text>

      <Text
        style={[
          styles.mathSymbol,
          styles.mathSymbolFour,
        ]}
      >
        −
      </Text>
    </View>
  );

  const renderExitButton = () => (
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

  useEffect(() => {
    const loadProfileImage =
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

            const localProfileImage =
              profileData.profileImage ||
              profileData.photoURL ||
              profileData.image ||
              profileData.avatar ||
              profileData.avatarUrl ||
              profileData.profilePhoto ||
              null;

            if (
              localProfileImage
            ) {
              setProfileImage(
                localProfileImage
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
            'Profile image load error:',
            error
          );
        }
      };

    const loadLoggedInPlayerName =
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
              null;

            if (
              firestoreProfileImage
            ) {
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
            'User name load error:',
            error
          );
        }
      };

    loadProfileImage();
    loadLoggedInPlayerName();
  }, []);

  const getPlayerPhoto = (
    playerId
  ) => {
    if (
      playerId === 1 &&
      profileImage
    ) {
      return profileImage;
    }

    const player =
      routePlayers.find(
        (item) =>
          item.id === playerId
      );

    return (
      player?.photo ||
      player?.image ||
      player?.avatar ||
      null
    );
  };

  const getPlayerName = (
    playerId
  ) => {
    if (playerId === 1) {
      return loggedInPlayerName;
    }

    const player =
      routePlayers.find(
        (item) =>
          item.id === playerId
      );

    return (
      player?.name ||
      `Player ${playerId}`
    );
  };


  const getPlayerUserId = (
    playerId
  ) => {
    const currentUser =
      auth.currentUser;

    if (
      playerId === 1 &&
      currentUser?.uid
    ) {
      return currentUser.uid;
    }

    const player =
      routePlayers.find(
        (item) =>
          item.id === playerId
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

    const invitedBy =
      route?.params?.invitedBy;

    const acceptedBy =
      route?.params?.acceptedBy;

    if (
      route?.params?.isOnline === true &&
      currentUser?.uid &&
      invitedBy &&
      acceptedBy
    ) {
      if (
        playerId === 2
      ) {
        return currentUser.uid ===
          invitedBy
          ? acceptedBy
          : invitedBy;
      }
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
      routePlayers.find(
        (item) =>
          item.id === playerId
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

          photo:
            getPlayerPhoto(
              playerId
            ),
        },
      }
    );
  };

  const getWinner = () => {
    const maxScore = Math.max(
      ...Object.values(scores)
    );

    const winners =
      Object.keys(scores).filter(
        (playerId) =>
          scores[playerId] ===
          maxScore
      );

    if (winners.length > 1) {
      return 'Draw';
    }

    return getPlayerName(
      Number(winners[0])
    );
  };

  const resetGame = () => {
    setSelectedCells([]);

    setRandomNumber(null);

    setCurrentTableData(
      shuffleTable()
    );

    setNumberPool(
      createNumberPool()
    );

    setGameOver(false);

    setCurrentPlayer(1);

    setScores({
      1: 0,
      2: 0,
      3: 0,
      4: 0,
    });
  };

  const renderPlayerCard = (
    playerId
  ) => {
    const photo =
      getPlayerPhoto(playerId);

    const isActive =
      currentPlayer === playerId;

    return (
      <View
        style={[
          styles.playerCard,
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
                ? ['#29C2FF', '#0969D7']
                : ['#0875D7', '#064493']
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
          style={[
            styles.playerName,
            isActive &&
              styles.activePlayerName,
          ]}
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
              styles.scoreText
            }
          >
            {scores[playerId]}
          </Text>
        </View>
      </View>
    );
  };

  const isCellNextToLastSelected = (
    cell
  ) => {
    if (
      selectedCells.length === 0
    ) {
      return true;
    }

    const lastSelectedCell =
      selectedCells[
        selectedCells.length - 1
      ];

    const rowDifference =
      Math.abs(
        cell.row -
          lastSelectedCell.row
      );

    const colDifference =
      Math.abs(
        cell.col -
          lastSelectedCell.col
      );

    return (
      rowDifference <= 1 &&
      colDifference <= 1
    );
  };

  const handleCellPress = (
    rowIndex,
    colIndex,
    value
  ) => {
    if (gameOver) {
      return;
    }

    const alreadySelected =
      selectedCells.find(
        (cell) =>
          cell.row === rowIndex &&
          cell.col === colIndex
      );

    if (alreadySelected) {
      return;
    }

    const cell = {
      row: rowIndex,
      col: colIndex,
      value,
    };

    if (
      selectedCells.length >= 3
    ) {
      return;
    }

    if (
      !isCellNextToLastSelected(
        cell
      )
    ) {
      Alert.alert(
        'Invalid selection',
        'Numbers must be next to each other or diagonal.'
      );

      return;
    }

    setSelectedCells([
      ...selectedCells,
      cell,
    ]);
  };

  const generateRandomNumber =
    () => {
      if (gameOver) {
        return;
      }

      if (
        numberPool.length === 0
      ) {
        setGameOver(true);

        setRandomNumber(null);

        return;
      }

      const nextNumber =
        numberPool[0];

      const remainingNumbers =
        numberPool.slice(1);

      setRandomNumber(
        nextNumber
      );

      setNumberPool(
        remainingNumbers
      );

      setSelectedCells([]);

      if (
        remainingNumbers.length ===
        0
      ) {
        setTimeout(() => {
          setGameOver(true);

          setRandomNumber(null);
        }, 30000);
      }
    };

  const checkResult = () => {
    if (gameOver) {
      return;
    }

    if (
      selectedCells.length !== 3
    ) {
      Alert.alert(
        'Pick 3 numbers first!'
      );

      return;
    }

    if (
      randomNumber === null
    ) {
      Alert.alert(
        'Generate a number first!'
      );

      return;
    }

    const values =
      selectedCells.map(
        (cell) => cell.value
      );

    if (values[1] === 0) {
      Alert.alert(
        'Error',
        'Cannot divide by zero!'
      );

      return;
    }

    const multiply =
      values[0] * values[1];

    const divide =
      values[0] / values[1];

    const possibleResults = [];

    possibleResults.push(
      multiply + values[2]
    );

    possibleResults.push(
      multiply - values[2]
    );

    if (
      Number.isFinite(divide)
    ) {
      possibleResults.push(
        divide + values[2]
      );

      possibleResults.push(
        divide - values[2]
      );
    }

    if (
      possibleResults.includes(
        randomNumber
      )
    ) {
      setScores(
        (previousScores) => ({
          ...previousScores,

          [currentPlayer]:
            previousScores[
              currentPlayer
            ] + 1,
        })
      );

      Alert.alert(
        '🎉 CONGRATULATIONS!',
        `${getPlayerName(
          currentPlayer
        )} reached the target: ${randomNumber}`
      );
    } else {
      Alert.alert(
        '❌ Not quite',
        `Possible results: ${possibleResults.join(
          ', '
        )} | Target: ${randomNumber}`
      );
    }

    setSelectedCells([]);

    setRandomNumber(null);

    setCurrentPlayer(
      currentPlayer === 4
        ? 1
        : currentPlayer + 1
    );
  };

  if (showRules) {
    return (
      <View
        style={
          styles.backgroundImage
        }
      >
        <LinearGradient
          colors={gameGradientColors}
          style={
            styles.rulesContainer
          }
        >
          {renderBackgroundDecor()}
          {isDarkMode && (
            <View pointerEvents="none" style={styles.darkModeOverlay} />
          )}
          {renderExitButton()}

          <View
            style={
              styles.brandBadge
            }
          >
            <Text
              style={
                styles.brandBadgeText
              }
            >
              TRIO
            </Text>
          </View>

          <Text
            style={
              styles.rulesEyebrow
            }
          >
            GAME TYPE 1
          </Text>

          <Text
            style={
              styles.rulesTitle
            }
          >
            Reach the Target
          </Text>

          <Text
            style={
              styles.rulesSubtitle
            }
          >
            Think fast, connect three numbers and build the correct result.
          </Text>

          <View
            style={
              styles.rulesCard
            }
          >
            {[
              ['01', 'Generate a target number'],
              ['02', 'Select exactly 3 connected numbers'],
              ['03', 'Horizontal, vertical and diagonal moves are allowed'],
              ['04', 'Multiply or divide before adding or subtracting'],
              ['05', 'Every correct result gives the active player 1 point'],
              ['06', 'The highest score wins when the number pool finishes'],
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
            onPress={() =>
              setShowRules(false)
            }
            activeOpacity={0.86}
          >
            <LinearGradient
              colors={[
                '#18B8F3',
                '#0759C7',
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
      </View>
    );
  }

  if (gameOver) {
    return (
      <View
        style={
          styles.backgroundImage
        }
      >
        <LinearGradient
          colors={gameGradientColors}
          style={
            styles.container
          }
        >
          {renderBackgroundDecor()}
          {isDarkMode && (
            <View pointerEvents="none" style={styles.darkModeOverlay} />
          )}
          {renderExitButton()}

          <View
            style={
              styles.gameOverIcon
            }
          >
            <Text
              style={
                styles.gameOverEmoji
              }
            >
              🏆
            </Text>
          </View>

          <Text
            style={
              styles.gameOverEyebrow
            }
          >
            MATCH COMPLETE
          </Text>

          <Text
            style={
              styles.gameOverTitle
            }
          >
            Game Over
          </Text>

          <View
            style={
              styles.resultCard
            }
          >
            <Text
              style={
                styles.winnerLabel
              }
            >
              WINNER
            </Text>

            <Text
              style={
                styles.winnerText
              }
            >
              {getWinner()}
            </Text>

            <View
              style={
                styles.scoreDivider
              }
            />

            {[1, 2, 3, 4].map(
              (playerId) => (
                <View
                  key={playerId}
                  style={
                    styles.finalScoreRow
                  }
                >
                  <Text
                    numberOfLines={1}
                    style={
                      styles.finalPlayerName
                    }
                  >
                    {getPlayerName(
                      playerId
                    )}
                  </Text>

                  <View
                    style={
                      styles.finalScoreBadge
                    }
                  >
                    <Text
                      style={
                        styles.finalScoreText
                      }
                    >
                      {scores[playerId]}
                    </Text>
                  </View>
                </View>
              )
            )}
          </View>

          <TouchableOpacity
            style={
              styles.playAgainButton
            }
            onPress={resetGame}
            activeOpacity={0.86}
          >
            <LinearGradient
              colors={[
                '#18B8F3',
                '#0759C7',
              ]}
              style={
                styles.primaryButtonGradient
              }
            >
              <Text
                style={
                  styles.buttonText
                }
              >
                Play Again
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={
              styles.homeButton
            }
            onPress={goToGameMenu}
            activeOpacity={0.82}
          >
            <Text
              style={
                styles.homeButtonText
              }
            >
              Back to Game Modes
            </Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View
      style={
        styles.backgroundImage
      }
    >
      <LinearGradient
        colors={gameGradientColors}
        style={styles.container}
      >
        {renderBackgroundDecor()}
          {isDarkMode && (
            <View pointerEvents="none" style={styles.darkModeOverlay} />
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
              TRIO · TYPE 1
            </Text>

            <Text
              style={
                styles.gameTitle
              }
            >
              Reach the Target
            </Text>
          </View>

          <View
            style={
              styles.remainingBadge
            }
          >
            <Text
              style={
                styles.remainingBadgeValue
              }
            >
              {numberPool.length}
            </Text>

            <Text
              style={
                styles.remainingBadgeLabel
              }
            >
              LEFT
            </Text>
          </View>
        </View>

        <View
          style={
            styles.playersPanel
          }
        >
          <View
            style={
              styles.playersBox
            }
          >
            {renderPlayerCard(1)}
            {renderPlayerCard(2)}
            {renderPlayerCard(3)}
            {renderPlayerCard(4)}
          </View>
        </View>

        <View
          style={
            styles.turnBanner
          }
        >
          <View
            style={
              styles.liveDot
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
              styles.turnText
            }
          >
            {getPlayerName(
              currentPlayer
            )}
          </Text>
        </View>

        <View
          style={
            styles.targetSection
          }
        >
          <View>
            <Text
              style={
                styles.targetLabel
              }
            >
              TARGET NUMBER
            </Text>

            <Text
              style={
                styles.targetHint
              }
            >
              Build this result with 3 tiles
            </Text>
          </View>

          <View
            style={
              styles.randomNumberBox
            }
          >
            <Text
              style={[
                styles.randomNumberText,
                randomNumber === null &&
                  styles.randomNumberPlaceholder,
              ]}
            >
              {randomNumber === null
                ? '?'
                : randomNumber}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={
            styles.randomButton
          }
          onPress={
            generateRandomNumber
          }
          activeOpacity={0.84}
        >
          <LinearGradient
            colors={[
              '#10B8F4',
              '#0870DC',
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
              styles.secondaryButtonGradient
            }
          >
            <Text
              style={
                styles.buttonIcon
              }
            >
              ◈
            </Text>

            <Text
              style={
                styles.buttonText
              }
            >
              Generate Number
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        <View
          style={
            styles.boardCard
          }
        >
          <View
            style={
              styles.boardTopRow
            }
          >
            <Text
              style={
                styles.boardTitle
              }
            >
              NUMBER GRID
            </Text>

            <Text
              style={
                styles.selectionCounter
              }
            >
              {selectedCells.length}/3 selected
            </Text>
          </View>

          <View
            style={styles.table}
          >
            {currentTableData.map(
              (
                row,
                rowIndex
              ) => (
                <View
                  key={rowIndex}
                  style={styles.row}
                >
                  {row.map(
                    (
                      cellValue,
                      colIndex
                    ) => {
                      const isSelected =
                        selectedCells.find(
                          (cell) =>
                            cell.row ===
                              rowIndex &&
                            cell.col ===
                              colIndex
                        );

                      return (
                        <TouchableOpacity
                          key={
                            colIndex
                          }
                          style={[
                            styles.cell,
                            {
                              backgroundColor:
                                cellColors[
                                  rowIndex
                                ][
                                  colIndex
                                ],
                            },
                            isSelected
                              ? styles.selected
                              : null,
                          ]}
                          onPress={() =>
                            handleCellPress(
                              rowIndex,
                              colIndex,
                              cellValue
                            )
                          }
                          activeOpacity={0.78}
                        >
                          <View
                            style={
                              styles.cellHighlight
                            }
                          />

                          <Text
                            style={
                              styles.cellText
                            }
                          >
                            {
                              cellValue
                            }
                          </Text>

                          {isSelected && (
                            <View
                              style={
                                styles.selectedIndex
                              }
                            >
                              <Text
                                style={
                                  styles.selectedIndexText
                                }
                              >
                                {
                                  selectedCells.findIndex(
                                    (cell) =>
                                      cell.row ===
                                        rowIndex &&
                                      cell.col ===
                                        colIndex
                                  ) + 1
                                }
                              </Text>
                            </View>
                          )}
                        </TouchableOpacity>
                      );
                    }
                  )}
                </View>
              )
            )}
          </View>
        </View>

        <TouchableOpacity
          style={
            styles.checkButton
          }
          onPress={checkResult}
          activeOpacity={0.86}
        >
          <LinearGradient
            colors={[
              '#18B8F3',
              '#0759C7',
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
              Check Result
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
    </View>
  );
};

const styles =
  StyleSheet.create({
    backgroundImage: {
      flex: 1,
      backgroundColor: '#073B9B',
    },

    darkModeOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.22)',
      zIndex: 1,
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
      width: 280,
      height: 280,
      top: -110,
      right: -100,
      backgroundColor:
        'rgba(255,255,255,0.16)',
    },

    glowOrbTwo: {
      width: 230,
      height: 230,
      bottom: -85,
      left: -95,
      backgroundColor:
        'rgba(1,45,130,0.34)',
    },

    glowOrbThree: {
      width: 150,
      height: 150,
      top: '43%',
      right: -85,
      backgroundColor:
        'rgba(72,210,255,0.18)',
    },

    mathSymbol: {
      position: 'absolute',
      color:
        'rgba(255,255,255,0.055)',
      fontWeight: '900',
    },

    mathSymbolOne: {
      top: 105,
      left: 20,
      fontSize: 92,
      transform: [
        { rotate: '-14deg' },
      ],
    },

    mathSymbolTwo: {
      top: '34%',
      right: 26,
      fontSize: 84,
      transform: [
        { rotate: '12deg' },
      ],
    },

    mathSymbolThree: {
      bottom: 125,
      left: 36,
      fontSize: 88,
      transform: [
        { rotate: '10deg' },
      ],
    },

    mathSymbolFour: {
      bottom: 42,
      right: 34,
      fontSize: 102,
      transform: [
        { rotate: '-8deg' },
      ],
    },

    container: {
      flex: 1,
      paddingTop: 52,
      paddingHorizontal: 14,
      paddingBottom: 18,
      alignItems: 'center',
    },

    exitButton: {
      position: 'absolute',
      top: 52,
      right: 16,
      zIndex: 20,
      minHeight: 38,
      paddingVertical: 9,
      paddingHorizontal: 14,
      borderRadius: 14,
      backgroundColor:
        'rgba(3,39,103,0.74)',
      borderWidth: 1,
      borderColor:
        'rgba(255,255,255,0.24)',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 6,
      },
      shadowOpacity: 0.25,
      shadowRadius: 10,
      elevation: 8,
    },

    exitButtonText: {
      color: '#F8FAFC',
      fontSize: 13,
      fontWeight: '800',
      letterSpacing: 0.2,
    },

    gameHeader: {
      width: '100%',
      minHeight: 56,
      marginBottom: 10,
      paddingRight: 72,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-between',
    },

    gameEyebrow: {
      color: '#7DE3FF',
      fontSize: 10,
      fontWeight: '900',
      letterSpacing: 1.8,
      marginBottom: 3,
    },

    gameTitle: {
      color: '#F8FAFC',
      fontSize: 22,
      fontWeight: '900',
      letterSpacing: -0.5,
    },

    remainingBadge: {
      width: 48,
      height: 48,
      borderRadius: 15,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        'rgba(255,255,255,0.15)',
      borderWidth: 1,
      borderColor:
        'rgba(255,255,255,0.24)',
    },

    remainingBadgeValue: {
      color: '#F8FAFC',
      fontSize: 17,
      fontWeight: '900',
      lineHeight: 19,
    },

    remainingBadgeLabel: {
      color: '#C6EEFF',
      fontSize: 8,
      fontWeight: '900',
      letterSpacing: 1,
    },

    playersPanel: {
      width: '100%',
      paddingVertical: 8,
      paddingHorizontal: 6,
      marginBottom: 8,
      borderRadius: 22,
      backgroundColor:
        'rgba(3,45,119,0.52)',
      borderWidth: 1,
      borderColor:
        'rgba(255,255,255,0.18)',
    },

    playersBox: {
      width: '100%',
      flexDirection: 'row',
      justifyContent:
        'space-between',
      alignItems: 'stretch',
    },

    playerCard: {
      position: 'relative',
      width: '24%',
      minHeight: 103,
      paddingVertical: 7,
      paddingHorizontal: 3,
      alignItems: 'center',
      justifyContent:
        'center',
      borderRadius: 17,
      borderWidth: 1,
      borderColor:
        'transparent',
    },

    activePlayerCard: {
      backgroundColor:
        'rgba(32,171,255,0.20)',
      borderColor:
        'rgba(126,220,255,0.85)',
    },

    playerStatusDot: {
      position: 'absolute',
      top: 7,
      right: 7,
      width: 7,
      height: 7,
      borderRadius: 4,
      backgroundColor: '#475569',
    },

    activeStatusDot: {
      backgroundColor: '#22C55E',
      shadowColor: '#22C55E',
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
      width: 48,
      height: 48,
      padding: 2,
      marginBottom: 5,
      alignItems: 'center',
      justifyContent:
        'center',
      borderRadius: 16,
    },

    profileImage: {
      width: 44,
      height: 44,
      borderRadius: 14,
      borderWidth: 1,
      borderColor:
        'rgba(255,255,255,0.75)',
    },

    defaultAvatar: {
      width: 44,
      height: 44,
      borderRadius: 14,
      backgroundColor:
        '#064493',
      alignItems: 'center',
      justifyContent:
        'center',
    },

    defaultAvatarText: {
      color: '#F8FAFC',
      fontSize: 14,
      fontWeight: '900',
    },

    playerName: {
      width: '100%',
      color: '#E7F8FF',
      fontSize: 9,
      fontWeight: '800',
      textAlign: 'center',
      marginBottom: 5,
    },

    activePlayerName: {
      color: '#FFFFFF',
    },

    scoreBadge: {
      minWidth: 44,
      height: 22,
      paddingHorizontal: 6,
      borderRadius: 8,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'center',
      backgroundColor:
        'rgba(255,255,255,0.13)',
    },

    scoreLabel: {
      color: '#9DDDF8',
      fontSize: 6,
      fontWeight: '900',
      letterSpacing: 0.7,
      marginRight: 4,
    },

    scoreText: {
      color: '#F8FAFC',
      fontSize: 11,
      fontWeight: '900',
    },

    turnBanner: {
      width: '100%',
      height: 36,
      paddingHorizontal: 12,
      marginBottom: 8,
      borderRadius: 13,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor:
        'rgba(4,48,119,0.62)',
      borderWidth: 1,
      borderColor:
        'rgba(255,255,255,0.15)',
    },

    liveDot: {
      width: 7,
      height: 7,
      borderRadius: 4,
      marginRight: 8,
      backgroundColor: '#22C55E',
    },

    turnLabel: {
      color: '#9DDDF8',
      fontSize: 8,
      fontWeight: '900',
      letterSpacing: 1.1,
      marginRight: 8,
    },

    turnText: {
      flex: 1,
      color: '#F8FAFC',
      fontSize: 12,
      fontWeight: '900',
    },

    targetSection: {
      width: '100%',
      minHeight: 72,
      paddingVertical: 10,
      paddingLeft: 15,
      paddingRight: 9,
      marginBottom: 8,
      borderRadius: 20,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-between',
      backgroundColor:
        'rgba(3,45,119,0.52)',
      borderWidth: 1,
      borderColor:
        'rgba(255,255,255,0.18)',
    },

    targetLabel: {
      color: '#9AEAFF',
      fontSize: 9,
      fontWeight: '900',
      letterSpacing: 1.4,
      marginBottom: 4,
    },

    targetHint: {
      maxWidth: 220,
      color: '#C6EEFF',
      fontSize: 11,
      fontWeight: '600',
    },

    randomNumberBox: {
      width: 54,
      height: 54,
      borderRadius: 17,
      alignItems: 'center',
      justifyContent:
        'center',
      backgroundColor: '#E9F9FF',
      shadowColor: '#6EDCFF',
      shadowOffset: {
        width: 0,
        height: 5,
      },
      shadowOpacity: 0.28,
      shadowRadius: 10,
      elevation: 8,
    },

    randomNumberText: {
      color: '#0752B2',
      fontSize: 25,
      fontWeight: '900',
    },

    randomNumberPlaceholder: {
      color: '#C6EEFF',
    },

    randomButton: {
      width: '100%',
      height: 44,
      marginBottom: 8,
      borderRadius: 15,
      overflow: 'hidden',
    },

    secondaryButtonGradient: {
      flex: 1,
      paddingHorizontal: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 15,
    },

    buttonIcon: {
      color: '#FFFFFF',
      fontSize: 18,
      fontWeight: '900',
      marginRight: 9,
    },

    boardCard: {
      width: '100%',
      paddingTop: 10,
      paddingHorizontal: 8,
      paddingBottom: 8,
      borderRadius: 22,
      backgroundColor:
        'rgba(2,34,92,0.62)',
      borderWidth: 1,
      borderColor:
        'rgba(255,255,255,0.18)',
      shadowColor: '#002B74',
      shadowOffset: {
        width: 0,
        height: 10,
      },
      shadowOpacity: 0.34,
      shadowRadius: 18,
      elevation: 8,
    },

    boardTopRow: {
      width: '100%',
      paddingHorizontal: 4,
      marginBottom: 7,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-between',
    },

    boardTitle: {
      color: '#E7F8FF',
      fontSize: 9,
      fontWeight: '900',
      letterSpacing: 1.4,
    },

    selectionCounter: {
      color: '#7DE3FF',
      fontSize: 9,
      fontWeight: '800',
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
      width: 41,
      height: 41,
      margin: 2,
      borderRadius: 12,
      overflow: 'hidden',
      alignItems: 'center',
      justifyContent:
        'center',
      borderWidth: 1,
      borderColor:
        'rgba(255,255,255,0.15)',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 3,
      },
      shadowOpacity: 0.18,
      shadowRadius: 4,
      elevation: 3,
    },

    cellHighlight: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '42%',
      backgroundColor:
        'rgba(255,255,255,0.13)',
    },

    selected: {
      borderWidth: 3,
      borderColor: '#F8FAFC',
      transform: [
        {
          scale: 1.05,
        },
      ],
      shadowColor: '#83E5FF',
      shadowOffset: {
        width: 0,
        height: 0,
      },
      shadowOpacity: 0.55,
      shadowRadius: 8,
      elevation: 10,
    },

    selectedIndex: {
      position: 'absolute',
      top: 3,
      right: 3,
      width: 14,
      height: 14,
      borderRadius: 7,
      alignItems: 'center',
      justifyContent:
        'center',
      backgroundColor:
        '#064493',
    },

    selectedIndexText: {
      color: '#FFFFFF',
      fontSize: 8,
      fontWeight: '900',
    },

    cellText: {
      color: '#FFFFFF',
      fontSize: 18,
      fontWeight: '900',
      textShadowColor:
        'rgba(0,0,0,0.22)',
      textShadowOffset: {
        width: 0,
        height: 1,
      },
      textShadowRadius: 2,
    },

    checkButton: {
      width: '100%',
      height: 48,
      marginTop: 10,
      borderRadius: 16,
      overflow: 'hidden',
      shadowColor: '#058FE8',
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
      minHeight: 48,
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
      letterSpacing: 0.2,
    },

    buttonArrow: {
      position: 'absolute',
      right: 19,
      color: '#FFFFFF',
      fontSize: 21,
      fontWeight: '700',
    },

    brandBadge: {
      width: 66,
      height: 66,
      marginBottom: 18,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent:
        'center',
      backgroundColor:
        'rgba(56,189,248,0.22)',
      borderWidth: 1,
      borderColor:
        'rgba(147,230,255,0.72)',
    },

    brandBadgeText: {
      color: '#FFFFFF',
      fontSize: 17,
      fontWeight: '900',
      letterSpacing: 1,
    },

    rulesContainer: {
      flex: 1,
      paddingTop: 62,
      paddingHorizontal: 22,
      paddingBottom: 28,
      alignItems: 'center',
      justifyContent:
        'center',
    },

    rulesEyebrow: {
      color: '#7DE3FF',
      fontSize: 10,
      fontWeight: '900',
      letterSpacing: 2,
      marginBottom: 7,
    },

    rulesTitle: {
      color: '#F8FAFC',
      fontSize: 31,
      fontWeight: '900',
      letterSpacing: -0.8,
      textAlign: 'center',
      marginBottom: 9,
    },

    rulesSubtitle: {
      maxWidth: 330,
      color: '#C6EEFF',
      fontSize: 13,
      fontWeight: '600',
      lineHeight: 19,
      textAlign: 'center',
      marginBottom: 22,
    },

    rulesCard: {
      width: '100%',
      paddingVertical: 9,
      paddingHorizontal: 13,
      borderRadius: 22,
      backgroundColor:
        'rgba(3,39,103,0.60)',
      borderWidth: 1,
      borderColor:
        'rgba(255,255,255,0.18)',
    },

    ruleRow: {
      minHeight: 46,
      flexDirection: 'row',
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor:
        'rgba(255,255,255,0.12)',
    },

    ruleNumber: {
      width: 30,
      height: 30,
      marginRight: 11,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent:
        'center',
      backgroundColor:
        'rgba(56,189,248,0.22)',
    },

    ruleNumberText: {
      color: '#9AEAFF',
      fontSize: 9,
      fontWeight: '900',
    },

    ruleText: {
      flex: 1,
      color: '#F0FAFF',
      fontSize: 12,
      fontWeight: '700',
      lineHeight: 17,
    },

    startButton: {
      width: '100%',
      height: 50,
      marginTop: 20,
      borderRadius: 16,
      overflow: 'hidden',
      shadowColor: '#058FE8',
      shadowOffset: {
        width: 0,
        height: 7,
      },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 8,
    },

    gameOverIcon: {
      width: 76,
      height: 76,
      marginTop: 36,
      marginBottom: 16,
      borderRadius: 25,
      alignItems: 'center',
      justifyContent:
        'center',
      backgroundColor:
        'rgba(255,255,255,0.16)',
      borderWidth: 1,
      borderColor:
        'rgba(125,223,255,0.70)',
    },

    gameOverEmoji: {
      fontSize: 34,
    },

    gameOverEyebrow: {
      color: '#8DE7FF',
      fontSize: 10,
      fontWeight: '900',
      letterSpacing: 2,
      marginBottom: 6,
    },

    gameOverTitle: {
      color: '#F8FAFC',
      fontSize: 34,
      fontWeight: '900',
      letterSpacing: -0.8,
      marginBottom: 20,
    },

    resultCard: {
      width: '100%',
      padding: 20,
      borderRadius: 24,
      backgroundColor:
        'rgba(2,34,92,0.62)',
      borderWidth: 1,
      borderColor:
        'rgba(255,255,255,0.18)',
    },

    winnerLabel: {
      color: '#9DDDF8',
      fontSize: 9,
      fontWeight: '900',
      letterSpacing: 1.8,
      textAlign: 'center',
      marginBottom: 6,
    },

    winnerText: {
      color: '#FFFFFF',
      fontSize: 25,
      fontWeight: '900',
      textAlign: 'center',
    },

    scoreDivider: {
      width: '100%',
      height: 1,
      marginVertical: 17,
      backgroundColor:
        'rgba(255,255,255,0.15)',
    },

    finalScoreRow: {
      width: '100%',
      minHeight: 42,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-between',
    },

    finalPlayerName: {
      flex: 1,
      color: '#E7F8FF',
      fontSize: 13,
      fontWeight: '800',
      marginRight: 12,
    },

    finalScoreBadge: {
      minWidth: 42,
      height: 29,
      paddingHorizontal: 10,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent:
        'center',
      backgroundColor:
        'rgba(99,102,241,0.18)',
    },

    finalScoreText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '900',
    },

    playAgainButton: {
      width: '100%',
      height: 50,
      marginTop: 18,
      borderRadius: 16,
      overflow: 'hidden',
    },

    homeButton: {
      width: '100%',
      height: 48,
      marginTop: 10,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent:
        'center',
      backgroundColor:
        'rgba(255,255,255,0.12)',
      borderWidth: 1,
      borderColor:
        'rgba(255,255,255,0.18)',
    },

    homeButtonText: {
      color: '#E7F8FF',
      fontSize: 13,
      fontWeight: '800',
    },
  });

export default GameScreen;