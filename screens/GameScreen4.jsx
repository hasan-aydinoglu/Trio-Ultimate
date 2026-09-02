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

/*
 * Her yeni oyunda aynı 49 sayıyı farklı
 * konumlara karıştırır.
 *
 * Sayı havuzu değişmediği için mevcut
 * BLUE TARGET sonuçlarının çözümleri
 * bulunmaya devam eder.
 */
const createShuffledTable = () => {
  const shuffledValues =
    tableData
      .flat()
      .slice();

  for (
    let index =
      shuffledValues.length - 1;
    index > 0;
    index -= 1
  ) {
    const randomIndex =
      Math.floor(
        Math.random() *
          (index + 1)
      );

    [
      shuffledValues[index],
      shuffledValues[randomIndex],
    ] = [
      shuffledValues[randomIndex],
      shuffledValues[index],
    ];
  }

  const shuffledTable = [];

  for (
    let rowIndex = 0;
    rowIndex < 7;
    rowIndex += 1
  ) {
    shuffledTable.push(
      shuffledValues.slice(
        rowIndex * 7,
        rowIndex * 7 + 7
      )
    );
  }

  return shuffledTable;
};

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

const blueCards = [
  10,
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

export default function GameScreen4({
  navigation,
  route,
}) {
  const [selectedCells, setSelectedCells] = useState([]);
  const [boardData, setBoardData] = useState(
    () => createShuffledTable()
  );
  const [targetNumber, setTargetNumber] = useState(null);
  const [mode, setMode] = useState('doubleMinus');
  const [playerTurn, setPlayerTurn] = useState(1);
  const [scores, setScores] = useState({
    1: 0,
    2: 0,
  });
  const [showRules, setShowRules] = useState(true);
  const [profileImage, setProfileImage] = useState(null);
  const [loggedInPlayerName, setLoggedInPlayerName] =
    useState('Player 1');

  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const loadDarkMode = async () => {
      try {
        const savedDarkMode = await AsyncStorage.getItem('trioDarkMode');
        setIsDarkMode(savedDarkMode === 'true');
      } catch (error) {
        console.log('Dark mode load error:', error);
      }
    };

    loadDarkMode();
    const unsubscribeFocus = navigation.addListener('focus', loadDarkMode);
    return unsubscribeFocus;
  }, [navigation]);

  const gameGradientColors = isDarkMode
    ? ['#031614', '#062A26', '#08443D']
    : ['#20D7C2', '#0FB89F', '#08796E'];

  const routePlayers = route?.params?.players || players;

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
    const isOnline = route?.params?.isOnline === true;

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
              const inviteId = route?.params?.inviteId;
              const currentUser = auth.currentUser;

              if (isOnline && inviteId) {
                const invitedBy = route?.params?.invitedBy;
                const acceptedBy = route?.params?.acceptedBy;

                const winnerId =
                  currentUser?.uid === invitedBy
                    ? acceptedBy || null
                    : invitedBy || null;

                await updateDoc(
                  doc(db, 'gameInvites', inviteId),
                  {
                    status: 'abandoned',
                    leftBy: currentUser?.uid || null,
                    winnerId,
                    endedAt: serverTimestamp(),
                  }
                );
              }
            } catch (error) {
              console.log('Leave game update error:', error);
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
        −
      </Text>

      <Text
        style={[
          styles.mathSymbol,
          styles.mathSymbolThree,
        ]}
      >
        =
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
        <Text style={styles.exitButtonText}>✕ Exit</Text>
      </TouchableOpacity>
    );
  };

  useEffect(() => {
    const getFirstValidValue = (...values) => {
      return values.find(
        (value) =>
          typeof value === 'string' &&
          value.trim().length > 0
      );
    };

    const loadProfileData = async () => {
      try {
        const user = auth.currentUser;

        const savedProfile =
          await AsyncStorage.getItem('userProfile');

        const savedImage =
          await AsyncStorage.getItem('profileImage');

        let localProfile = null;

        if (savedProfile) {
          try {
            localProfile = JSON.parse(savedProfile);
          } catch (error) {
            console.log('Saved profile parse error:', error);
          }
        }

        let firebaseName = null;
        let firebaseImage = null;

        if (user) {
          firebaseName = getFirstValidValue(
            user.displayName,
            user.email
          );

          firebaseImage = getFirstValidValue(user.photoURL);

          const userRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            const data = userSnap.data();

            firebaseName = getFirstValidValue(
              data.username,
              data.name,
              data.fullName,
              data.displayName,
              user.displayName,
              user.email
            );

            firebaseImage = getFirstValidValue(
              data.profileImage,
              data.photoURL,
              data.image,
              data.avatar,
              data.avatarUrl,
              data.profilePhoto,
              user.photoURL
            );
          }
        }

        const localProfileBelongsToCurrentUser =
          !user ||
          !localProfile ||
          !localProfile.uid ||
          localProfile.uid === user.uid ||
          localProfile.email === user.email;

        const localName =
          localProfileBelongsToCurrentUser && localProfile
            ? getFirstValidValue(
                localProfile.username,
                localProfile.name,
                localProfile.fullName,
                localProfile.displayName
              )
            : null;

        const localImage =
          localProfileBelongsToCurrentUser && localProfile
            ? getFirstValidValue(
                localProfile.profileImage,
                localProfile.photoURL,
                localProfile.image,
                localProfile.avatar,
                localProfile.avatarUrl,
                localProfile.profilePhoto
              )
            : null;

        setLoggedInPlayerName(
          getFirstValidValue(firebaseName, localName) ||
            'Player 1'
        );

        setProfileImage(
          getFirstValidValue(
            firebaseImage,
            localImage,
            savedImage
          ) || null
        );
      } catch (error) {
        console.log('Profile data load error:', error);
      }
    };

    loadProfileData();
  }, []);

  const getPlayerPhoto = (playerId) => {
    const player = routePlayers.find(
      (item) => item.id === playerId
    );

    const routePhoto =
      player?.photo ||
      player?.image ||
      player?.avatar ||
      player?.avatarUrl ||
      player?.profileImage ||
      player?.photoURL ||
      null;

    /*
     * Online oyunda App.js / invite akışından
     * gelen gerçek oyuncu profil fotoğrafını
     * öncelikli kullan.
     */
    if (routePhoto) {
      return routePhoto;
    }

    /*
     * Route bilgisinde fotoğraf yoksa ve
     * oyuncu giriş yapan kullanıcıysa kendi
     * Firebase profil fotoğrafını fallback
     * olarak kullan.
     */
    if (
      player?.uid ===
        auth.currentUser?.uid &&
      profileImage
    ) {
      return profileImage;
    }

    /*
     * Offline/local oyunda mevcut davranışı
     * koru: Player 1 giriş yapan kullanıcıdır.
     */
    if (
      route?.params?.isOnline !== true &&
      playerId === 1 &&
      profileImage
    ) {
      return profileImage;
    }

    return null;
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

  const changeTurn = () => {
    setPlayerTurn((previousTurn) =>
      previousTurn === 1 ? 2 : 1
    );
  };

  const drawBlueCard = () => {
    const randomBlueCard =
      blueCards[
        Math.floor(Math.random() * blueCards.length)
      ];

    setTargetNumber(randomBlueCard);
    setSelectedCells([]);
  };

  const handleCellPress = (
    rowIndex,
    colIndex,
    value
  ) => {
    const alreadySelected = selectedCells.find(
      (cell) =>
        cell.row === rowIndex &&
        cell.col === colIndex
    );

    if (alreadySelected) {
      setSelectedCells(
        selectedCells.filter(
          (cell) =>
            !(
              cell.row === rowIndex &&
              cell.col === colIndex
            )
        )
      );

      return;
    }

    const maxCards =
      mode === 'doubleMinus' ? 4 : 3;

    if (selectedCells.length >= maxCards) {
      Alert.alert(
        'Limit Reached',
        `You can only select ${maxCards} cards.`
      );

      return;
    }

    setSelectedCells([
      ...selectedCells,
      {
        row: rowIndex,
        col: colIndex,
        value,
      },
    ]);
  };

  const checkResult = () => {
    if (targetNumber === null) {
      Alert.alert('Draw a blue card first!');
      return;
    }

    if (mode === 'doubleMinus') {
      if (selectedCells.length !== 4) {
        Alert.alert(
          'Pick 4 numbers first!',
          'Format: [ ][ ] - [ ][ ] = target'
        );

        return;
      }

      const [a, b, c, d] = selectedCells.map(
        (cell) => cell.value
      );

      const firstNumber = Number(`${a}${b}`);
      const secondNumber = Number(`${c}${d}`);
      const result = firstNumber - secondNumber;

      if (result === targetNumber) {
        setScores((previousScores) => ({
          ...previousScores,
          [playerTurn]:
            previousScores[playerTurn] +
            targetNumber,
        }));

        Alert.alert(
          '🎉 Correct!',
          `${getPlayerName(
            playerTurn
          )} wins ${targetNumber} points!\n\n${firstNumber} - ${secondNumber} = ${targetNumber}`
        );

        setTargetNumber(null);
        setSelectedCells([]);
      } else {
        Alert.alert(
          '❌ Not quite',
          `${firstNumber} - ${secondNumber} = ${result}\nTarget: ${targetNumber}`
        );
      }
    }

    if (mode === 'multiplyMinus') {
      if (selectedCells.length !== 3) {
        Alert.alert(
          'Pick 3 numbers first!',
          'Format: [ ] × [ ] - [ ] = target'
        );

        return;
      }

      const [a, b, c] = selectedCells.map(
        (cell) => cell.value
      );

      const result = a * b - c;

      if (result === targetNumber) {
        setScores((previousScores) => ({
          ...previousScores,
          [playerTurn]:
            previousScores[playerTurn] +
            targetNumber,
        }));

        Alert.alert(
          '🎉 Correct!',
          `${getPlayerName(
            playerTurn
          )} wins ${targetNumber} points!\n\n${a} × ${b} - ${c} = ${targetNumber}`
        );

        setTargetNumber(null);
        setSelectedCells([]);
      } else {
        Alert.alert(
          '❌ Not quite',
          `${a} × ${b} - ${c} = ${result}\nTarget: ${targetNumber}`
        );
      }
    }

    changeTurn();
  };

  const resetGame = () => {
    Alert.alert(
      'Reset Game?',
      'All scores and selected cards will be reset.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            setSelectedCells([]);
            setBoardData(
              createShuffledTable()
            );
            setTargetNumber(null);
            setPlayerTurn(1);
            setMode('doubleMinus');
            setScores({
              1: 0,
              2: 0,
            });
          },
        },
      ]
    );
  };

  const renderPlayerCard = (playerId) => {
    const photo = getPlayerPhoto(playerId);
    const isActive = playerTurn === playerId;

    return (
      <View
        style={[
          styles.playerCard,
          isDarkMode && styles.darkPlayerCard,
          isActive && styles.activePlayerCard,
          isActive && isDarkMode && styles.darkActivePlayerCard,
        ]}
      >
        <LinearGradient
          colors={
            isActive
              ? ['#2563eb', '#60a5fa']
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
            <View style={styles.defaultAvatar}>
              <Text style={styles.defaultAvatarText}>
                P{playerId}
              </Text>
            </View>
          )}
        </LinearGradient>

        <Text style={styles.playerName}>
          {getPlayerName(playerId)}
        </Text>

        <Text style={styles.playerScore}>
          {scores[playerId]} pts
        </Text>
      </View>
    );
  };

  if (showRules) {
    return (
      <View style={styles.backgroundImage}>
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
          style={styles.rulesContainer}
        >
          {renderBackgroundDecor()}
          {isDarkMode && <View pointerEvents="none" style={styles.darkModeOverlay} />}
          {renderExitButton()}

          <View style={styles.modeBadge}>
            <Text style={styles.modeBadgeIcon}>
              ⚗
            </Text>

            <Text style={styles.modeBadgeText}>
              MODE 4
            </Text>
          </View>

          <Text style={styles.rulesEyebrow}>
            TRIO FORMULA
          </Text>

          <Text style={styles.rulesTitle}>
            Fixed Formula Challenge
          </Text>

          <Text style={styles.rulesSubtitle}>
            Choose a formula, select the required numbers and reach the blue target.
          </Text>

          <View style={[styles.rulesCard, isDarkMode && styles.darkGlassPanel]}>
            {[
              ['01', 'This mode is played by 2 players'],
              ['02', 'Draw a blue card to reveal the target'],
              ['03', 'Choose one of the two fixed formulas'],
              ['04', 'Mode 1: [ ][ ] − [ ][ ] = Target'],
              ['05', 'Mode 2: [ ] × [ ] − [ ] = Target'],
              ['06', 'Correct answers add the target value to your score'],
            ].map(([number, rule]) => (
              <View
                key={number}
                style={styles.ruleRow}
              >
                <View style={styles.ruleNumber}>
                  <Text style={styles.ruleNumberText}>
                    {number}
                  </Text>
                </View>

                <Text style={styles.ruleText}>
                  {rule}
                </Text>
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={styles.startButton}
            onPress={() =>
              setShowRules(false)
            }
            activeOpacity={0.86}
          >
            <LinearGradient
              colors={[
                '#5EEAD4',
                '#14B8A6',
                '#0F766E',
              ]}
              start={{
                x: 0,
                y: 0,
              }}
              end={{
                x: 1,
                y: 1,
              }}
              style={styles.primaryButtonGradient}
            >
              <Text style={styles.buttonText}>
                Start Game
              </Text>

              <Text style={styles.buttonArrow}>
                →
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.backgroundImage}>
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
        style={styles.container}
      >
        {renderBackgroundDecor()}
        {isDarkMode && <View pointerEvents="none" style={styles.darkModeOverlay} />}
        {renderExitButton()}

        <View style={styles.gameHeader}>
          <View>
            <Text style={styles.gameEyebrow}>
              TRIO · FORMULA
            </Text>

            <Text style={styles.gameTitle}>
              Fixed Calculation
            </Text>
          </View>

          <View style={styles.modeNumberBadge}>
            <Text style={styles.modeNumberText}>
              4
            </Text>
          </View>
        </View>

        <View style={styles.playersBox}>
          {renderPlayerCard(1)}
          {renderPlayerCard(2)}
        </View>

        <View style={[styles.turnBanner, isDarkMode && styles.darkGlassPanel]}>
          <View style={styles.turnDot} />

          <Text style={styles.turnLabel}>
            CURRENT TURN
          </Text>

          <Text
            numberOfLines={1}
            style={styles.turnText}
          >
            {getPlayerName(playerTurn)}
          </Text>
        </View>

        <View style={[styles.modeSection, isDarkMode && styles.darkGlassPanel]}>
          <View style={styles.modeSectionHeader}>
            <Text style={styles.modeSectionTitle}>
              CHOOSE FORMULA
            </Text>

            <Text style={styles.modeSectionHint}>
              Select a calculation type
            </Text>
          </View>

          <View style={styles.modeBox}>
            <TouchableOpacity
              style={[
                styles.modeButton,
                mode === 'doubleMinus' &&
                  styles.activeMode,
              ]}
              onPress={() => {
                setMode('doubleMinus');
                setSelectedCells([]);
              }}
              activeOpacity={0.82}
            >
              <Text
                style={[
                  styles.modeText,
                  mode === 'doubleMinus' &&
                    styles.activeModeText,
                ]}
              >
                12 − 34
              </Text>

              <Text
                style={[
                  styles.modeDescription,
                  mode === 'doubleMinus' &&
                    styles.activeModeDescription,
                ]}
              >
                Four cards
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.modeButton,
                mode === 'multiplyMinus' &&
                  styles.activeMode,
              ]}
              onPress={() => {
                setMode('multiplyMinus');
                setSelectedCells([]);
              }}
              activeOpacity={0.82}
            >
              <Text
                style={[
                  styles.modeText,
                  mode === 'multiplyMinus' &&
                    styles.activeModeText,
                ]}
              >
                3 × 4 − 2
              </Text>

              <Text
                style={[
                  styles.modeDescription,
                  mode === 'multiplyMinus' &&
                    styles.activeModeDescription,
                ]}
              >
                Three cards
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={styles.targetCard}
          onPress={drawBlueCard}
          activeOpacity={0.86}
        >
          <LinearGradient
            colors={[
              '#5EEAD4',
              '#14B8A6',
              '#0F766E',
            ]}
            start={{
              x: 0,
              y: 0,
            }}
            end={{
              x: 1,
              y: 1,
            }}
            style={styles.targetGradient}
          >
            <View>
              <Text style={styles.targetTitle}>
                BLUE TARGET
              </Text>

              <Text style={styles.targetSubtitle}>
                {targetNumber === null
                  ? 'Tap to draw a target'
                  : 'Build this result'}
              </Text>
            </View>

            <View style={styles.targetNumberBox}>
              <Text style={styles.targetNumber}>
                {targetNumber === null
                  ? '?'
                  : targetNumber}
              </Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        <View style={[styles.formulaPreview, isDarkMode && styles.darkSoftPanel]}>
          <Text style={styles.formulaPreviewLabel}>
            ACTIVE FORMULA
          </Text>

          <Text style={styles.formulaPreviewText}>
            {mode === 'doubleMinus'
              ? '[ ][ ] − [ ][ ] = Target'
              : '[ ] × [ ] − [ ] = Target'}
          </Text>
        </View>

        <View style={[styles.selectedBox, isDarkMode && styles.darkGlassPanel]}>
          <Text style={styles.selectedLabel}>
            SELECTED
          </Text>

          <Text style={styles.selectedText}>
            {selectedCells.length > 0
              ? selectedCells
                  .map((cell) => cell.value)
                  .join('   ')
              : 'No numbers selected'}
          </Text>

          <Text style={styles.selectedCounter}>
            {selectedCells.length}/
            {mode === 'doubleMinus'
              ? 4
              : 3}
          </Text>
        </View>

        <View style={[styles.boardCard, isDarkMode && styles.darkBoardCard]}>
          <View style={styles.boardTopRow}>
            <Text style={styles.boardTitle}>
              NUMBER GRID
            </Text>

            <Text style={styles.boardHint}>
              Tap numbers in order
            </Text>
          </View>

          <View style={styles.table}>
            {boardData.map((row, rowIndex) => (
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
                        key={colIndex}
                        style={[
                          styles.cell,
                          {
                            backgroundColor:
                              isDarkMode
                                ? `${cellColors[rowIndex][colIndex]}B8`
                                : cellColors[rowIndex][colIndex],
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
                        activeOpacity={0.8}
                      >
                        <View
                          style={
                            styles.cellHighlight
                          }
                        />

                        <Text style={styles.cellText}>
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
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={styles.checkButton}
          onPress={checkResult}
          activeOpacity={0.86}
        >
          <LinearGradient
            colors={[
              '#5EEAD4',
              '#14B8A6',
              '#0F766E',
            ]}
            start={{
              x: 0,
              y: 0,
            }}
            end={{
              x: 1,
              y: 1,
            }}
            style={styles.primaryButtonGradient}
          >
            <Text style={styles.buttonText}>
              Check Formula
            </Text>

            <Text style={styles.buttonArrow}>
              →
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.resetButton}
          onPress={resetGame}
          activeOpacity={0.82}
        >
          <Text style={styles.resetButtonText}>
            Reset Game
          </Text>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    backgroundColor: '#08796E',
  },

  darkModeOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.18)',
  },

  darkGlassPanel: {
    backgroundColor: 'rgba(2,31,28,0.78)',
    borderColor: 'rgba(255,255,255,0.10)',
  },

  darkSoftPanel: {
    backgroundColor: 'rgba(255,255,255,0.065)',
    borderColor: 'rgba(255,255,255,0.10)',
  },

  darkBoardCard: {
    backgroundColor: 'rgba(2,27,25,0.86)',
    borderColor: 'rgba(255,255,255,0.10)',
    shadowColor: '#000000',
  },

  darkPlayerCard: {
    backgroundColor: 'rgba(2,31,28,0.76)',
    borderColor: 'rgba(255,255,255,0.10)',
  },

  darkActivePlayerCard: {
    backgroundColor: 'rgba(20,184,166,0.17)',
    borderColor: 'rgba(153,246,228,0.55)',
    shadowColor: '#14B8A6',
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
    backgroundColor:
      'rgba(255,255,255,0.16)',
  },

  glowOrbTwo: {
    width: 260,
    height: 260,
    bottom: -110,
    left: -110,
    backgroundColor:
      'rgba(3,105,95,0.34)',
  },

  glowOrbThree: {
    width: 180,
    height: 180,
    top: '43%',
    right: -100,
    backgroundColor:
      'rgba(153,246,228,0.16)',
  },

  mathSymbol: {
    position: 'absolute',
    color:
      'rgba(255,255,255,0.055)',
    fontWeight: '900',
  },

  mathSymbolOne: {
    top: 110,
    left: 18,
    fontSize: 94,
    transform: [
      {
        rotate: '-12deg',
      },
    ],
  },

  mathSymbolTwo: {
    top: '34%',
    right: 24,
    fontSize: 90,
    transform: [
      {
        rotate: '10deg',
      },
    ],
  },

  mathSymbolThree: {
    bottom: 90,
    left: 30,
    fontSize: 96,
    transform: [
      {
        rotate: '-8deg',
      },
    ],
  },

  container: {
    flex: 1,
    paddingTop: 52,
    paddingHorizontal: 15,
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
    paddingHorizontal: 15,
    borderRadius: 13,
    backgroundColor:
      'rgba(5,78,71,0.76)',
    borderWidth: 1,
    borderColor:
      'rgba(255,255,255,0.24)',
    shadowColor: '#064E3B',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.24,
    shadowRadius: 10,
    elevation: 7,
  },

  exitButtonText: {
    color: '#F0FDFA',
    fontSize: 13,
    fontWeight: '900',
  },

  gameHeader: {
    width: '100%',
    minHeight: 42,
    marginBottom: 6,
    paddingRight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:
      'space-between',
  },

  gameEyebrow: {
    color: '#CCFBF1',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.8,
    marginBottom: 3,
  },

  gameTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: -0.5,
  },

  modeNumberBadge: {
    width: 38,
    height: 38,
    borderRadius: 16,
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
    paddingHorizontal: 6,
    borderRadius: 19,
    alignItems: 'center',
    backgroundColor:
      'rgba(5,78,71,0.46)',
    borderWidth: 1,
    borderColor:
      'rgba(255,255,255,0.16)',
  },

  activePlayerCard: {
    backgroundColor:
      'rgba(153,246,228,0.20)',
    borderColor:
      'rgba(204,251,241,0.78)',
    shadowColor: '#99F6E4',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.32,
    shadowRadius: 10,
    elevation: 7,
  },

  avatarGlow: {
    width: 38,
    height: 38,
    padding: 2,
    marginBottom: 7,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },

  profileImage: {
    width: 38,
    height: 38,
    borderRadius: 13,
    borderWidth: 1,
    borderColor:
      'rgba(255,255,255,0.84)',
  },

  defaultAvatar: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: '#0F766E',
    borderWidth: 1,
    borderColor: '#5EEAD4',
    alignItems: 'center',
    justifyContent: 'center',
  },

  defaultAvatarText: {
    color: '#F0FDFA',
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

  playerScore: {
    color: '#CCFBF1',
    fontSize: 11,
    fontWeight: '900',
    marginTop: 3,
  },

  turnBanner: {
    width: '100%',
    height: 38,
    marginBottom: 7,
    paddingHorizontal: 11,
    borderRadius: 13,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor:
      'rgba(5,78,71,0.44)',
    borderWidth: 1,
    borderColor:
      'rgba(255,255,255,0.15)',
  },

  turnDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 10,
    backgroundColor: '#A7F3D0',
  },

  turnLabel: {
    color: '#99F6E4',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.1,
    marginRight: 10,
  },

  turnText: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },

  modeSection: {
    width: '100%',
    padding: 8,
    marginBottom: 7,
    borderRadius: 19,
    backgroundColor:
      'rgba(5,78,71,0.48)',
    borderWidth: 1,
    borderColor:
      'rgba(255,255,255,0.15)',
  },

  modeSectionHeader: {
    paddingHorizontal: 4,
    marginBottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:
      'space-between',
  },

  modeSectionTitle: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.4,
  },

  modeSectionHint: {
    color: '#CCFBF1',
    fontSize: 9,
    fontWeight: '700',
  },

  modeBox: {
    flexDirection: 'row',
    gap: 8,
  },

  modeButton: {
    flex: 1,
    minHeight: 48,
    paddingVertical: 7,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:
      'rgba(255,255,255,0.10)',
    borderWidth: 1,
    borderColor:
      'rgba(255,255,255,0.16)',
  },

  activeMode: {
    backgroundColor: '#ECFDF5',
    borderColor: '#FFFFFF',
    shadowColor: '#99F6E4',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },

  modeText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 13,
  },

  activeModeText: {
    color: '#0F766E',
  },

  modeDescription: {
    color: '#CCFBF1',
    fontSize: 9,
    fontWeight: '700',
    marginTop: 3,
  },

  activeModeDescription: {
    color: '#14B8A6',
  },

  targetCard: {
    width: '100%',
    marginBottom: 7,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#0F766E',
    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 0.30,
    shadowRadius: 12,
    elevation: 9,
  },

  targetGradient: {
    minHeight: 64,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:
      'space-between',
  },

  targetTitle: {
    color: '#D1FAE5',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.8,
  },

  targetSubtitle: {
    color: '#F0FDFA',
    fontSize: 13,
    marginTop: 5,
    fontWeight: '700',
  },

  targetNumberBox: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor:
      'rgba(240,253,250,0.18)',
    borderWidth: 2,
    borderColor:
      'rgba(255,255,255,0.42)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  targetNumber: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '900',
  },

  formulaPreview: {
    width: '100%',
    minHeight: 35,
    paddingHorizontal: 11,
    marginBottom: 6,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor:
      'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor:
      'rgba(255,255,255,0.17)',
  },

  formulaPreviewLabel: {
    color: '#99F6E4',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
    marginRight: 9,
  },

  formulaPreviewText: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },

  selectedBox: {
    width: '100%',
    minHeight: 34,
    paddingHorizontal: 11,
    marginBottom: 6,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor:
      'rgba(5,78,71,0.45)',
    borderWidth: 1,
    borderColor:
      'rgba(255,255,255,0.14)',
  },

  selectedLabel: {
    color: '#99F6E4',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
    marginRight: 10,
  },

  selectedText: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },

  selectedCounter: {
    color: '#CCFBF1',
    fontSize: 11,
    fontWeight: '900',
  },

  boardCard: {
    width: '100%',
    paddingTop: 8,
    paddingHorizontal: 6,
    paddingBottom: 6,
    borderRadius: 16,
    backgroundColor:
      'rgba(5,78,71,0.52)',
    borderWidth: 1,
    borderColor:
      'rgba(255,255,255,0.17)',
    shadowColor: '#064E3B',
    shadowOffset: {
      width: 0,
      height: 9,
    },
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
    justifyContent:
      'space-between',
  },

  boardTitle: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.4,
  },

  boardHint: {
    color: '#CCFBF1',
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
    borderWidth: 1,
    borderColor:
      'rgba(255,255,255,0.20)',
    shadowColor: '#064E3B',
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
      'rgba(255,255,255,0.14)',
  },

  selected: {
    borderWidth: 3,
    borderColor: '#FFFFFF',
    transform: [
      {
        scale: 1.05,
      },
    ],
    shadowColor: '#99F6E4',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.72,
    shadowRadius: 9,
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
    backgroundColor: '#0F766E',
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
    textShadowColor:
      'rgba(0,0,0,0.18)',
    textShadowOffset: {
      width: 0,
      height: 1,
    },
    textShadowRadius: 2,
  },

  checkButton: {
    width: '100%',
    height: 47,
    marginTop: 8,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#0F766E',
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
    minHeight: 43,
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

  resetButton: {
    width: '100%',
    height: 38,
    marginTop: 5,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:
      'rgba(5,78,71,0.48)',
    borderWidth: 1,
    borderColor:
      'rgba(255,255,255,0.17)',
  },

  resetButtonText: {
    color: '#F0FDFA',
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
    width: 64,
    height: 64,
    marginBottom: 18,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:
      'rgba(255,255,255,0.16)',
    borderWidth: 1,
    borderColor:
      'rgba(255,255,255,0.34)',
    shadowColor: '#064E3B',
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
    lineHeight: 27,
  },

  modeBadgeText: {
    color: '#ECFDF5',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },

  rulesEyebrow: {
    color: '#CCFBF1',
    fontSize: 11,
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
    maxWidth: 330,
    color: '#D1FAE5',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 19,
    textAlign: 'center',
    marginBottom: 18,
  },

  rulesCard: {
    width: '100%',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 22,
    backgroundColor:
      'rgba(5,78,71,0.52)',
    borderWidth: 1,
    borderColor:
      'rgba(255,255,255,0.17)',
    shadowColor: '#064E3B',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 6,
  },

  ruleRow: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor:
      'rgba(255,255,255,0.10)',
  },

  ruleNumber: {
    width: 28,
    height: 28,
    marginRight: 10,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:
      'rgba(153,246,228,0.18)',
  },

  ruleNumberText: {
    color: '#CCFBF1',
    fontSize: 9,
    fontWeight: '900',
  },

  ruleText: {
    flex: 1,
    color: '#F0FDFA',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 17,
  },

  startButton: {
    width: '100%',
    height: 47,
    marginTop: 17,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#0F766E',
    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 0.30,
    shadowRadius: 12,
    elevation: 8,
  },
});