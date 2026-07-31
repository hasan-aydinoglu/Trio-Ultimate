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

    return (
      <View
        style={[
          styles.playerCard,

          currentPlayer ===
            playerId &&
            styles.activePlayerCard,
        ]}
      >
        <LinearGradient
          colors={[
            '#2563eb',
            '#60a5fa',
          ]}
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

        <Text
          style={
            styles.playerName
          }
        >
          {getPlayerName(
            playerId
          )}
        </Text>

        <Text
          style={styles.scoreText}
        >
          Score: {scores[playerId]}
        </Text>
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
            '#00c6ff',
            '#0072ff',
            '#000',
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
            TRIO GAME TYPE 1
          </Text>

          <Text
            style={
              styles.rulesSubtitle
            }
          >
            Game Rules
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
              • Generate a target
              number
            </Text>

            <Text
              style={
                styles.ruleText
              }
            >
              • Select 3 numbers
              from the board
            </Text>

            <Text
              style={
                styles.ruleText
              }
            >
              • Numbers must be
              next to each other
              or diagonal
            </Text>

            <Text
              style={
                styles.ruleText
              }
            >
              • Try to reach the
              target number
            </Text>

            <Text
              style={
                styles.ruleText
              }
            >
              • Use multiplication
              or division first
            </Text>

            <Text
              style={
                styles.ruleText
              }
            >
              • Then use addition
              or subtraction
            </Text>

            <Text
              style={
                styles.ruleText
              }
            >
              • Each correct
              answer gives 1 point
            </Text>

            <Text
              style={
                styles.ruleText
              }
            >
              • When all target
              numbers finish, the
              winner is announced
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

  if (gameOver) {
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
            '#00c6ff',
            '#0072ff',
            '#000',
          ]}
          style={styles.container}
        >
          {renderExitButton()}

          <Text
            style={
              styles.gameOverTitle
            }
          >
            🏆 GAME OVER
          </Text>

          <View
            style={
              styles.resultCard
            }
          >
            <Text
              style={
                styles.winnerText
              }
            >
              Winner:{' '}
              {getWinner()}
            </Text>

            <Text
              style={
                styles.finalScoreText
              }
            >
              {getPlayerName(1)}:{' '}
              {scores[1]} points
            </Text>

            <Text
              style={
                styles.finalScoreText
              }
            >
              {getPlayerName(2)}:{' '}
              {scores[2]} points
            </Text>

            <Text
              style={
                styles.finalScoreText
              }
            >
              {getPlayerName(3)}:{' '}
              {scores[3]} points
            </Text>

            <Text
              style={
                styles.finalScoreText
              }
            >
              {getPlayerName(4)}:{' '}
              {scores[4]} points
            </Text>
          </View>

          <TouchableOpacity
            style={
              styles.playAgainButton
            }
            onPress={resetGame}
          >
            <Text
              style={
                styles.buttonText
              }
            >
              🔄 Play Again
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={
              styles.homeButton
            }
            onPress={goToGameMenu}
          >
            <Text
              style={
                styles.buttonText
              }
            >
              🏠 Home
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
          '#00c6ff',
          '#0072ff',
          '#000',
        ]}
        style={styles.container}
      >
        {renderExitButton()}

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

        <Text
          style={styles.turnText}
        >
          Turn:{' '}
          {getPlayerName(
            currentPlayer
          )}
        </Text>

        <Text
          style={
            styles.remainingText
          }
        >
          Remaining Numbers:{' '}
          {numberPool.length}
        </Text>

        <TouchableOpacity
          style={
            styles.randomButton
          }
          onPress={
            generateRandomNumber
          }
        >
          <Text
            style={
              styles.buttonText
            }
          >
            🎲 Generate Number
          </Text>
        </TouchableOpacity>

        {randomNumber !== null && (
          <View
            style={
              styles.randomNumberBox
            }
          >
            <Text
              style={
                styles.randomNumberText
              }
            >
              {randomNumber}
            </Text>
          </View>
        )}

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
                  ) => (
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

                        selectedCells.find(
                          (
                            cell
                          ) =>
                            cell.row ===
                              rowIndex &&
                            cell.col ===
                              colIndex
                        )
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
                    >
                      <Text
                        style={
                          styles.cellText
                        }
                      >
                        {
                          cellValue
                        }
                      </Text>
                    </TouchableOpacity>
                  )
                )}
              </View>
            )
          )}
        </View>

        <TouchableOpacity
          style={
            styles.checkButton
          }
          onPress={checkResult}
        >
          <Text
            style={
              styles.buttonText
            }
          >
            ✅ Check Result
          </Text>
        </TouchableOpacity>
      </LinearGradient>
    </ImageBackground>
  );
};

const styles =
  StyleSheet.create({
    backgroundImage: {
      flex: 1,
      resizeMode: 'cover',
    },

    container: {
      flex: 1,
      padding: 10,
      alignItems: 'center',
      justifyContent:
        'center',
    },

    exitButton: {
      position: 'absolute',
      top: 52,
      right: 18,
      zIndex: 20,

      backgroundColor:
        'rgba(173, 24, 24, 0.92)',

      paddingVertical: 10,
      paddingHorizontal: 16,

      borderRadius: 22,

      borderWidth: 1,

      borderColor:
        'rgba(255,255,255,0.65)',

      shadowColor: '#000',

      shadowOffset: {
        width: 0,
        height: 4,
      },

      shadowOpacity: 0.25,
      shadowRadius: 6,
      elevation: 8,
    },

    exitButtonText: {
      color: '#fff',
      fontSize: 14,
      fontWeight: '900',
    },

    playersBox: {
      flexDirection: 'row',
      justifyContent:
        'center',
      alignItems: 'center',
      gap: 10,
      marginBottom: 8,
      flexWrap: 'wrap',
    },

    playerCard: {
      alignItems: 'center',

      justifyContent:
        'center',

      paddingVertical: 4,

      paddingHorizontal: 4,

      borderRadius: 16,
    },

    activePlayerCard: {
      backgroundColor:
        'rgba(255,255,255,0.2)',

      borderWidth: 2,

      borderColor: '#fff',
    },

    avatarGlow: {
      alignItems: 'center',

      justifyContent:
        'center',

      borderRadius: 60,

      padding: 7,

      marginBottom: 4,
    },

    profileImage: {
      width: 58,
      height: 58,
      borderRadius: 29,

      borderWidth: 3,

      borderColor:
        '#ffffff',
    },

    defaultAvatar: {
      width: 58,
      height: 58,
      borderRadius: 29,

      backgroundColor:
        'rgba(0,0,0,0.55)',

      borderWidth: 3,

      borderColor:
        '#ffffff',

      alignItems: 'center',

      justifyContent:
        'center',
    },

    defaultAvatarText: {
      color: '#fff',
      fontSize: 18,
      fontWeight: '900',
    },

    playerName: {
      color: '#fff',
      fontSize: 11,
      fontWeight: '900',
      textAlign: 'center',
    },

    scoreText: {
      color: '#fff',
      fontSize: 10,
      fontWeight: '800',
      marginTop: 2,
    },

    turnText: {
      color: '#fff',
      fontSize: 17,
      fontWeight: '900',
      marginBottom: 5,
    },

    remainingText: {
      color: '#fff',
      fontSize: 13,
      fontWeight: '700',
      marginBottom: 10,
    },

    randomButton: {
      backgroundColor:
        '#3498db',

      padding: 15,

      borderRadius: 30,

      marginBottom: 15,
    },

    checkButton: {
      backgroundColor:
        '#27ae60',

      padding: 15,

      borderRadius: 30,

      marginTop: 20,
    },

    playAgainButton: {
      backgroundColor:
        '#27ae60',

      paddingVertical: 16,

      paddingHorizontal: 45,

      borderRadius: 30,

      marginTop: 25,
    },

    homeButton: {
      backgroundColor:
        '#3498db',

      paddingVertical: 16,

      paddingHorizontal: 60,

      borderRadius: 30,

      marginTop: 15,
    },

    buttonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
    },

    table: {
      marginVertical: 10,
    },

    row: {
      flexDirection: 'row',
    },

    cell: {
      width: 45,
      height: 45,
      margin: 4,
      borderRadius: 8,

      alignItems: 'center',

      justifyContent:
        'center',
    },

    selected: {
      borderWidth: 2,
      borderColor: '#fff',
    },

    cellText: {
      fontSize: 20,
      color: '#fff',
      fontWeight: 'bold',
    },

    randomNumberBox: {
      backgroundColor:
        '#2980b9',

      width: 80,
      height: 80,

      borderRadius: 40,

      alignItems: 'center',

      justifyContent:
        'center',

      marginBottom: 10,
    },

    randomNumberText: {
      color: '#fff',
      fontSize: 28,
      fontWeight: 'bold',
    },

    gameOverTitle: {
      fontSize: 34,
      color: '#fff',
      fontWeight: '900',
      marginBottom: 25,
    },

    resultCard: {
      width: '90%',

      backgroundColor:
        'rgba(255,255,255,0.18)',

      borderRadius: 24,

      padding: 24,

      borderWidth: 1,

      borderColor:
        'rgba(255,255,255,0.35)',

      alignItems: 'center',
    },

    winnerText: {
      color: '#fff',
      fontSize: 24,
      fontWeight: '900',
      marginBottom: 18,
      textAlign: 'center',
    },

    finalScoreText: {
      color: '#fff',
      fontSize: 18,
      fontWeight: '700',
      marginBottom: 8,
    },

    rulesContainer: {
      flex: 1,
      padding: 24,

      alignItems: 'center',

      justifyContent:
        'center',
    },

    rulesTitle: {
      fontSize: 30,
      color: '#fff',
      fontWeight: 'bold',
      marginBottom: 10,
      textAlign: 'center',
    },

    rulesSubtitle: {
      fontSize: 22,
      color: '#fff',
      marginBottom: 25,
      fontWeight: '600',
    },

    rulesCard: {
      width: '100%',

      backgroundColor:
        'rgba(255,255,255,0.15)',

      borderRadius: 22,

      padding: 22,

      borderWidth: 1,

      borderColor:
        'rgba(255,255,255,0.3)',
    },

    ruleText: {
      color: '#fff',
      fontSize: 17,
      marginBottom: 15,
      lineHeight: 24,
    },

    startButton: {
      marginTop: 28,

      backgroundColor:
        '#27ae60',

      paddingVertical: 16,

      paddingHorizontal: 45,

      borderRadius: 30,
    },
  });

export default GameScreen;