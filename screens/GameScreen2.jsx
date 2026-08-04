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

const GameScreen2 = ({
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
                route?.params
                  ?.inviteId;

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
      style={
        styles.backgroundDecor
      }
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
        (
      </Text>

      <Text
        style={[
          styles.mathSymbol,
          styles.mathSymbolTwo,
        ]}
      >
        ×
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
        )
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

            const imageFromProfile =
              profileData.profileImage ||
              profileData.photoURL ||
              profileData.image ||
              profileData.avatar ||
              null;

            if (
              imageFromProfile
            ) {
              setProfileImage(
                imageFromProfile
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

    const loadLoggedInPlayerData =
      async () => {
        try {
          const savedProfile =
            await AsyncStorage.getItem(
              'userProfile'
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
          }

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

            const imageFromFirestore =
              data.profileImage ||
              data.photoURL ||
              data.image ||
              data.avatar ||
              null;

            if (
              imageFromFirestore
            ) {
              setProfileImage(
                imageFromFirestore
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
            'User profile load error:',
            error
          );
        }
      };

    loadProfileImage();

    loadLoggedInPlayerData();
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

  const renderPlayerCard = (
    playerId
  ) => {
    const photo =
      getPlayerPhoto(playerId);

    return (
      <View
        style={
          styles.playerCard
        }
      >
        <LinearGradient
          colors={[
            '#7C3AED',
            '#2563EB',
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
          numberOfLines={1}
          style={
            styles.playerName
          }
        >
          {getPlayerName(
            playerId
          )}
        </Text>
      </View>
    );
  };

  const handleCellPress = (
    rowIndex,
    colIndex,
    value
  ) => {
    const alreadySelected =
      selectedCells.find(
        (cell) =>
          cell.row === rowIndex &&
          cell.col === colIndex
      );

    if (alreadySelected) {
      setSelectedCells(
        selectedCells.filter(
          (cell) =>
            !(
              cell.row ===
                rowIndex &&
              cell.col ===
                colIndex
            )
        )
      );

      return;
    }

    if (
      selectedCells.length < 3
    ) {
      setSelectedCells([
        ...selectedCells,
        {
          row: rowIndex,
          col: colIndex,
          value,
        },
      ]);
    } else {
      Alert.alert(
        'Limit Reached',
        'You can only select 3 numbers.'
      );
    }
  };

  const checkResult = () => {
    if (
      randomNumber === null
    ) {
      Alert.alert(
        'Generate a number first!'
      );

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

    const values =
      selectedCells.map(
        (cell) => cell.value
      );

    const [a, b, c] = values;

    const possibleResults = [
      {
        expression: `(${a} + ${b}) × ${c}`,
        value: (a + b) * c,
      },
      {
        expression: `(${a} - ${b}) × ${c}`,
        value: (a - b) * c,
      },
      {
        expression: `(${a} + ${c}) × ${b}`,
        value: (a + c) * b,
      },
      {
        expression: `(${a} - ${c}) × ${b}`,
        value: (a - c) * b,
      },
      {
        expression: `(${b} + ${c}) × ${a}`,
        value: (b + c) * a,
      },
      {
        expression: `(${b} - ${c}) × ${a}`,
        value: (b - c) * a,
      },
    ];

    if (c !== 0) {
      possibleResults.push(
        {
          expression: `(${a} + ${b}) ÷ ${c}`,
          value: (a + b) / c,
        },
        {
          expression: `(${a} - ${b}) ÷ ${c}`,
          value: (a - b) / c,
        }
      );
    }

    if (b !== 0) {
      possibleResults.push(
        {
          expression: `(${a} + ${c}) ÷ ${b}`,
          value: (a + c) / b,
        },
        {
          expression: `(${a} - ${c}) ÷ ${b}`,
          value: (a - c) / b,
        }
      );
    }

    if (a !== 0) {
      possibleResults.push(
        {
          expression: `(${b} + ${c}) ÷ ${a}`,
          value: (b + c) / a,
        },
        {
          expression: `(${b} - ${c}) ÷ ${a}`,
          value: (b - c) / a,
        }
      );
    }

    const matchedResult =
      possibleResults.find(
        (item) =>
          item.value ===
          randomNumber
      );

    if (matchedResult) {
      Alert.alert(
        '🎉 CONGRATULATIONS!',
        `You reached the target!\n\n${matchedResult.expression} = ${randomNumber}`
      );
    } else {
      const resultText =
        possibleResults
          .map(
            (item) =>
              `${item.expression} = ${item.value}`
          )
          .join('\n');

      Alert.alert(
        '❌ Not quite',
        `Target: ${randomNumber}\n\nPossible results:\n${resultText}`
      );
    }

    setSelectedCells([]);
  };

  const generateRandomNumber =
    () => {
      const number =
        Math.floor(
          Math.random() * 50
        ) + 1;

      setRandomNumber(number);

      setTimeout(() => {
        setRandomNumber(null);

        setSelectedCells([]);
      }, 30000);
    };

  if (showRules) {
    return (
      <View
        style={
          styles.backgroundImage
        }
      >
        <LinearGradient
          colors={[
            '#07111F',
            '#111A36',
            '#21154A',
          ]}
          style={
            styles.rulesContainer
          }
        >
          {renderBackgroundDecor()}
          {renderExitButton()}

          <View
            style={
              styles.modeBadge
            }
          >
            <Text
              style={
                styles.modeBadgeText
              }
            >
              MODE 2
            </Text>
          </View>

          <Text
            style={
              styles.rulesEyebrow
            }
          >
            TRIO GAME TYPE 2
          </Text>

          <Text
            style={
              styles.rulesTitle
            }
          >
            Brackets First
          </Text>

          <Text
            style={
              styles.rulesSubtitle
            }
          >
            Add or subtract inside the brackets, then multiply or divide by the third number.
          </Text>

          <View
            style={
              styles.rulesCard
            }
          >
            {[
              ['01', 'Generate a target number'],
              ['02', 'Select exactly 3 numbers from the board'],
              ['03', 'Add or subtract two numbers inside brackets'],
              ['04', 'Multiply or divide the bracket result by the third number'],
              ['05', 'Example: (3 + 7) × 5 = 50'],
              ['06', 'Press Check Result to verify your calculation'],
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
                '#8B5CF6',
                '#2563EB',
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

  return (
    <View
      style={
        styles.backgroundImage
      }
    >
      <LinearGradient
        colors={[
          '#07111F',
          '#111A36',
          '#21154A',
        ]}
        style={styles.container}
      >
        {renderBackgroundDecor()}
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
              TRIO · TYPE 2
            </Text>

            <Text
              style={
                styles.gameTitle
              }
            >
              Brackets First
            </Text>
          </View>

          <View
            style={
              styles.formulaBadge
            }
          >
            <Text
              style={
                styles.formulaBadgeText
              }
            >
              ( a ± b ) × c
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
              Build this result using brackets
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
              '#2563EB',
              '#06B6D4',
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
            style={
              styles.table
            }
          >
            {tableData.map(
              (
                row,
                rowIndex
              ) => (
                <View
                  key={rowIndex}
                  style={
                    styles.row
                  }
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
                            {cellValue}
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

        <View
          style={
            styles.expressionHint
          }
        >
          <Text
            style={
              styles.expressionHintLabel
            }
          >
            FORMULA
          </Text>

          <Text
            style={
              styles.expressionHintText
            }
          >
            (first number ± second number) × or ÷ third number
          </Text>
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
              '#8B5CF6',
              '#2563EB',
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
      backgroundColor: '#07111F',
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
      top: -120,
      right: -100,
      backgroundColor:
        'rgba(59,130,246,0.18)',
    },

    glowOrbTwo: {
      width: 240,
      height: 240,
      bottom: -100,
      left: -100,
      backgroundColor:
        'rgba(139,92,246,0.20)',
    },

    glowOrbThree: {
      width: 160,
      height: 160,
      top: '42%',
      right: -90,
      backgroundColor:
        'rgba(6,182,212,0.10)',
    },

    mathSymbol: {
      position: 'absolute',
      color:
        'rgba(255,255,255,0.035)',
      fontWeight: '900',
    },

    mathSymbolOne: {
      top: 110,
      left: 18,
      fontSize: 96,
      transform: [
        {
          rotate: '-12deg',
        },
      ],
    },

    mathSymbolTwo: {
      top: '30%',
      right: 24,
      fontSize: 86,
      transform: [
        {
          rotate: '10deg',
        },
      ],
    },

    mathSymbolThree: {
      bottom: 115,
      left: 34,
      fontSize: 90,
      transform: [
        {
          rotate: '8deg',
        },
      ],
    },

    mathSymbolFour: {
      bottom: 35,
      right: 30,
      fontSize: 104,
      transform: [
        {
          rotate: '-8deg',
        },
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
        'rgba(15,23,42,0.88)',
      borderWidth: 1,
      borderColor:
        'rgba(255,255,255,0.14)',
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
    },

    gameHeader: {
      width: '100%',
      minHeight: 58,
      marginBottom: 10,
      paddingRight: 72,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-between',
    },

    gameEyebrow: {
      color: '#818CF8',
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

    formulaBadge: {
      minWidth: 92,
      height: 38,
      paddingHorizontal: 10,
      borderRadius: 13,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        'rgba(255,255,255,0.08)',
      borderWidth: 1,
      borderColor:
        'rgba(255,255,255,0.13)',
    },

    formulaBadgeText: {
      color: '#C4B5FD',
      fontSize: 10,
      fontWeight: '900',
    },

    playersPanel: {
      width: '100%',
      paddingVertical: 8,
      paddingHorizontal: 6,
      marginBottom: 8,
      borderRadius: 22,
      backgroundColor:
        'rgba(15,23,42,0.72)',
      borderWidth: 1,
      borderColor:
        'rgba(255,255,255,0.09)',
    },

    playersBox: {
      width: '100%',
      flexDirection: 'row',
      justifyContent:
        'space-between',
      alignItems: 'stretch',
    },

    playerCard: {
      width: '24%',
      minHeight: 82,
      paddingVertical: 7,
      paddingHorizontal: 3,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 17,
      backgroundColor:
        'rgba(255,255,255,0.025)',
    },

    avatarGlow: {
      width: 48,
      height: 48,
      padding: 2,
      marginBottom: 5,
      alignItems: 'center',
      justifyContent: 'center',
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
      backgroundColor: '#0F172A',
      alignItems: 'center',
      justifyContent: 'center',
    },

    defaultAvatarText: {
      color: '#F8FAFC',
      fontSize: 14,
      fontWeight: '900',
    },

    playerName: {
      width: '100%',
      color: '#E2E8F0',
      fontSize: 9,
      fontWeight: '800',
      textAlign: 'center',
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
        'rgba(15,23,42,0.72)',
      borderWidth: 1,
      borderColor:
        'rgba(255,255,255,0.1)',
    },

    targetLabel: {
      color: '#A5B4FC',
      fontSize: 9,
      fontWeight: '900',
      letterSpacing: 1.4,
      marginBottom: 4,
    },

    targetHint: {
      color: '#94A3B8',
      fontSize: 11,
      fontWeight: '600',
    },

    randomNumberBox: {
      width: 54,
      height: 54,
      borderRadius: 17,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#F8FAFC',
      shadowColor: '#60A5FA',
      shadowOffset: {
        width: 0,
        height: 5,
      },
      shadowOpacity: 0.28,
      shadowRadius: 10,
      elevation: 8,
    },

    randomNumberText: {
      color: '#111827',
      fontSize: 25,
      fontWeight: '900',
    },

    randomNumberPlaceholder: {
      color: '#94A3B8',
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
        'rgba(15,23,42,0.82)',
      borderWidth: 1,
      borderColor:
        'rgba(255,255,255,0.1)',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 10,
      },
      shadowOpacity: 0.2,
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
      color: '#CBD5E1',
      fontSize: 9,
      fontWeight: '900',
      letterSpacing: 1.4,
    },

    selectionCounter: {
      color: '#818CF8',
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
      justifyContent: 'center',
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
      shadowColor: '#FFFFFF',
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
      justifyContent: 'center',
      backgroundColor: '#0F172A',
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

    expressionHint: {
      width: '100%',
      minHeight: 43,
      marginTop: 8,
      paddingHorizontal: 12,
      borderRadius: 14,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor:
        'rgba(99,102,241,0.11)',
      borderWidth: 1,
      borderColor:
        'rgba(129,140,248,0.22)',
    },

    expressionHintLabel: {
      color: '#A5B4FC',
      fontSize: 8,
      fontWeight: '900',
      letterSpacing: 1,
      marginRight: 9,
    },

    expressionHintText: {
      flex: 1,
      color: '#CBD5E1',
      fontSize: 10,
      fontWeight: '700',
    },

    checkButton: {
      width: '100%',
      height: 48,
      marginTop: 10,
      borderRadius: 16,
      overflow: 'hidden',
      shadowColor: '#4F46E5',
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
    },

    buttonArrow: {
      position: 'absolute',
      right: 19,
      color: '#FFFFFF',
      fontSize: 21,
      fontWeight: '700',
    },

    modeBadge: {
      width: 70,
      height: 70,
      marginBottom: 18,
      borderRadius: 23,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        'rgba(99,102,241,0.16)',
      borderWidth: 1,
      borderColor:
        'rgba(129,140,248,0.55)',
    },

    modeBadgeText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '900',
      letterSpacing: 1,
    },

    rulesContainer: {
      flex: 1,
      paddingTop: 62,
      paddingHorizontal: 22,
      paddingBottom: 28,
      alignItems: 'center',
      justifyContent: 'center',
    },

    rulesEyebrow: {
      color: '#818CF8',
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
      color: '#94A3B8',
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
        'rgba(15,23,42,0.78)',
      borderWidth: 1,
      borderColor:
        'rgba(255,255,255,0.1)',
    },

    ruleRow: {
      minHeight: 46,
      flexDirection: 'row',
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor:
        'rgba(255,255,255,0.06)',
    },

    ruleNumber: {
      width: 30,
      height: 30,
      marginRight: 11,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        'rgba(99,102,241,0.16)',
    },

    ruleNumberText: {
      color: '#A5B4FC',
      fontSize: 9,
      fontWeight: '900',
    },

    ruleText: {
      flex: 1,
      color: '#E2E8F0',
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
      shadowColor: '#4F46E5',
      shadowOffset: {
        width: 0,
        height: 7,
      },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 8,
    },
  });

export default GameScreen2;