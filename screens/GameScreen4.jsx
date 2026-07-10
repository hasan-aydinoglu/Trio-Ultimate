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
import { doc, getDoc } from 'firebase/firestore';

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
  ['#e67e22', '#e84393', '#e67e22', '#8e44ad', '#e67e22', '#e84393', '#e67e22'],
  ['#8e44ad', '#e67e22', '#e84393', '#e67e22', '#e67e22', '#e84393', '#e67e22'],
  ['#e84393', '#e67e22', '#8e44ad', '#e67e22', '#e84393', '#8e44ad', '#e67e22'],
  ['#8e44ad', '#e67e22', '#e84393', '#e67e22', '#e84393', '#8e44ad', '#e84393'],
  ['#e67e22', '#e84393', '#e67e22', '#8e44ad', '#e67e22', '#e84393', '#e67e22'],
  ['#8e44ad', '#e67e22', '#e84393', '#e67e22', '#e67e22', '#e84393', '#8e44ad'],
  ['#e67e22', '#e84393', '#e67e22', '#8e44ad', '#e84393', '#e84393', '#e67e22'],
];

const blueCards = [10, 20, 24, 27, 30, 32, 36, 40, 44, 45, 48, 50];

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

export default function GameScreen4({ route }) {
  const [selectedCells, setSelectedCells] = useState([]);
  const [targetNumber, setTargetNumber] = useState(null);
  const [mode, setMode] = useState('doubleMinus');
  const [playerTurn, setPlayerTurn] = useState(1);
  const [scores, setScores] = useState({ 1: 0, 2: 0 });
  const [showRules, setShowRules] = useState(true);
  const [profileImage, setProfileImage] = useState(null);
  const [loggedInPlayerName, setLoggedInPlayerName] = useState('Player 1');

  const routePlayers = route?.params?.players || players;

  useEffect(() => {
    const getFirstValidValue = (...values) => {
      return values.find(
        (value) => typeof value === 'string' && value.trim().length > 0
      );
    };

    const loadProfileData = async () => {
      try {
        const user = auth.currentUser;
        const savedProfile = await AsyncStorage.getItem('userProfile');
        const savedImage = await AsyncStorage.getItem('profileImage');

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
                localProfile.avatar
              )
            : null;

        setLoggedInPlayerName(
          getFirstValidValue(firebaseName, localName) || 'Player 1'
        );

        setProfileImage(
          getFirstValidValue(firebaseImage, localImage, savedImage) || null
        );
      } catch (error) {
        console.log('Profile data load error:', error);
      }
    };

    loadProfileData();
  }, []);

  const getPlayerPhoto = (playerId) => {
    if (playerId === 1 && profileImage) {
      return profileImage;
    }

    const player = routePlayers.find((p) => p.id === playerId);
    return player?.photo || player?.image || player?.avatar || null;
  };

  const getPlayerName = (playerId) => {
    if (playerId === 1) {
      return loggedInPlayerName;
    }

    const player = routePlayers.find((p) => p.id === playerId);
    return player?.name || `Player ${playerId}`;
  };

  const changeTurn = () => {
    setPlayerTurn((prev) => (prev === 1 ? 2 : 1));
  };

  const drawBlueCard = () => {
    const randomBlueCard =
      blueCards[Math.floor(Math.random() * blueCards.length)];

    setTargetNumber(randomBlueCard);
    setSelectedCells([]);
  };

  const handleCellPress = (rowIndex, colIndex, value) => {
    const alreadySelected = selectedCells.find(
      (c) => c.row === rowIndex && c.col === colIndex
    );

    if (alreadySelected) {
      setSelectedCells(
        selectedCells.filter(
          (c) => !(c.row === rowIndex && c.col === colIndex)
        )
      );
      return;
    }

    const maxCards = mode === 'doubleMinus' ? 4 : 3;

    if (selectedCells.length >= maxCards) {
      Alert.alert('Limit Reached', `You can only select ${maxCards} cards.`);
      return;
    }

    setSelectedCells([...selectedCells, { row: rowIndex, col: colIndex, value }]);
  };

  const checkResult = () => {
    if (targetNumber === null) {
      Alert.alert('Draw a blue card first!');
      return;
    }

    if (mode === 'doubleMinus') {
      if (selectedCells.length !== 4) {
        Alert.alert('Pick 4 numbers first!', 'Format: [ ][ ] - [ ][ ] = target');
        return;
      }

      const [a, b, c, d] = selectedCells.map((cell) => cell.value);

      const firstNumber = Number(`${a}${b}`);
      const secondNumber = Number(`${c}${d}`);
      const result = firstNumber - secondNumber;

      if (result === targetNumber) {
        setScores({
          ...scores,
          [playerTurn]: scores[playerTurn] + targetNumber,
        });

        Alert.alert(
          '🎉 Correct!',
          `${getPlayerName(playerTurn)} wins ${targetNumber} points!\n\n${firstNumber} - ${secondNumber} = ${targetNumber}`
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
        Alert.alert('Pick 3 numbers first!', 'Format: [ ] × [ ] - [ ] = target');
        return;
      }

      const [a, b, c] = selectedCells.map((cell) => cell.value);
      const result = a * b - c;

      if (result === targetNumber) {
        setScores({
          ...scores,
          [playerTurn]: scores[playerTurn] + targetNumber,
        });

        Alert.alert(
          '🎉 Correct!',
          `${getPlayerName(playerTurn)} wins ${targetNumber} points!\n\n${a} × ${b} - ${c} = ${targetNumber}`
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
    setSelectedCells([]);
    setTargetNumber(null);
    setPlayerTurn(1);
    setScores({ 1: 0, 2: 0 });
  };

  const renderPlayerCard = (playerId) => {
    const photo = getPlayerPhoto(playerId);
    const isActive = playerTurn === playerId;

    return (
      <View
        style={[
          styles.playerCard,
          isActive && styles.activePlayerCard,
        ]}
      >
        <LinearGradient
          colors={
            isActive
              ? ['#2563eb', '#60a5fa']
              : ['rgba(255,255,255,0.10)', 'rgba(255,255,255,0.02)']
          }
          style={styles.avatarGlow}
        >
          {photo ? (
            <Image source={{ uri: photo }} style={styles.profileImage} />
          ) : (
            <View style={styles.defaultAvatar}>
              <Text style={styles.defaultAvatarText}>P{playerId}</Text>
            </View>
          )}
        </LinearGradient>

        <Text style={styles.playerName}>{getPlayerName(playerId)}</Text>
        <Text style={styles.playerScore}>{scores[playerId]} pts</Text>
      </View>
    );
  };

  if (showRules) {
    return (
      <ImageBackground
        source={require('../assets/trioabout.png')}
        style={styles.backgroundImage}
      >
        <LinearGradient
          colors={['#000000', '#434343', '#FFFFFF']}
          style={styles.rulesContainer}
        >
          <Text style={styles.rulesTitle}>TRIO GAME TYPE 4</Text>
          <Text style={styles.rulesSubtitle}>Fixed Formula Challenge</Text>

          <View style={styles.rulesCard}>
            <Text style={styles.ruleText}>• This mode is played by 2 players.</Text>
            <Text style={styles.ruleText}>• Draw a blue card to get the target number.</Text>
            <Text style={styles.ruleText}>• Choose one of the fixed formula modes.</Text>
            <Text style={styles.ruleText}>• Mode 1: [ ][ ] - [ ][ ] = Target</Text>
            <Text style={styles.ruleText}>• Mode 2: [ ] × [ ] - [ ] = Target</Text>
            <Text style={styles.ruleText}>• Select the required amount of numbers from the board.</Text>
            <Text style={styles.ruleText}>• Press Check Formula to verify your answer.</Text>
            <Text style={styles.ruleText}>• Correct answers add the target number to your score.</Text>
          </View>

          <TouchableOpacity
            style={styles.startButton}
            onPress={() => setShowRules(false)}
          >
            <Text style={styles.buttonText}>START GAME</Text>
          </TouchableOpacity>
        </LinearGradient>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground
      source={require('../assets/trioabout.png')}
      style={styles.backgroundImage}
    >
      <LinearGradient
        colors={['#000000', '#434343', '#FFFFFF']}
        style={styles.container}
      >
        <Text style={styles.title}>Game Type 4</Text>
        <Text style={styles.subtitle}>Fixed Formula Challenge</Text>

        <View style={styles.playersBox}>
          {renderPlayerCard(1)}
          {renderPlayerCard(2)}
        </View>

        <Text style={styles.turnText}>Turn: {getPlayerName(playerTurn)}</Text>

        <View style={styles.modeBox}>
          <TouchableOpacity
            style={[
              styles.modeButton,
              mode === 'doubleMinus' && styles.activeMode,
            ]}
            onPress={() => {
              setMode('doubleMinus');
              setSelectedCells([]);
            }}
          >
            <Text style={styles.modeText}>[][] - [][]</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.modeButton,
              mode === 'multiplyMinus' && styles.activeMode,
            ]}
            onPress={() => {
              setMode('multiplyMinus');
              setSelectedCells([]);
            }}
          >
            <Text style={styles.modeText}>[] × [] - []</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.blueButton} onPress={drawBlueCard}>
          <Text style={styles.buttonText}>
            {targetNumber === null ? 'Draw Blue Card' : `Target: ${targetNumber}`}
          </Text>
        </TouchableOpacity>

        <Text style={styles.formatText}>
          {mode === 'doubleMinus'
            ? 'Format: [ ][ ] - [ ][ ] = Target'
            : 'Format: [ ] × [ ] - [ ] = Target'}
        </Text>

        <View style={styles.selectedBox}>
          <Text style={styles.selectedText}>
            Selected: {selectedCells.map((cell) => cell.value).join('  ') || '-'}
          </Text>
        </View>

        <View style={styles.table}>
          {tableData.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.row}>
              {row.map((cellValue, colIndex) => {
                const isSelected = selectedCells.find(
                  (c) => c.row === rowIndex && c.col === colIndex
                );

                return (
                  <TouchableOpacity
                    key={colIndex}
                    style={[
                      styles.cell,
                      { backgroundColor: cellColors[rowIndex][colIndex] },
                      isSelected ? styles.selected : null,
                    ]}
                    onPress={() =>
                      handleCellPress(rowIndex, colIndex, cellValue)
                    }
                    activeOpacity={0.85}
                  >
                    <Text style={styles.cellText}>{cellValue}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.checkButton} onPress={checkResult}>
          <Text style={styles.buttonText}>✅ Check Formula</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.resetButton} onPress={resetGame}>
          <Text style={styles.buttonText}>Reset Game</Text>
        </TouchableOpacity>
      </LinearGradient>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
  },

  container: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  title: {
    color: '#fff',
    fontSize: 25,
    fontWeight: '900',
    marginBottom: 3,
  },

  subtitle: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '600',
  },

  playersBox: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
    marginBottom: 14,
  },

  playerCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 6,
  },

  activePlayerCard: {
    transform: [{ scale: 1.12 }],
  },

  avatarGlow: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 60,
    padding: 10,
    marginBottom: 4,
  },

  profileImage: {
    width: 74,
    height: 74,
    borderRadius: 37,
    borderWidth: 3,
    borderColor: '#ffffff',
  },

  defaultAvatar: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderWidth: 3,
    borderColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },

  defaultAvatarText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '900',
  },

  playerName: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '900',
    textAlign: 'center',
  },

  playerScore: {
    color: '#dbeafe',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 2,
  },

  turnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 8,
  },

  modeBox: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },

  modeButton: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },

  activeMode: {
    backgroundColor: '#2563eb',
  },

  modeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
  },

  blueButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 30,
    marginBottom: 8,
  },

  checkButton: {
    backgroundColor: '#16a34a',
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 30,
    marginTop: 10,
  },

  resetButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginTop: 8,
  },

  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },

  formatText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 6,
    textAlign: 'center',
  },

  selectedBox: {
    backgroundColor: 'rgba(0,0,0,0.22)',
    borderRadius: 14,
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginBottom: 6,
  },

  selectedText: {
    color: '#fff',
    fontWeight: 'bold',
  },

  table: {
    marginVertical: 4,
  },

  row: {
    flexDirection: 'row',
  },

  cell: {
    width: 42,
    height: 42,
    margin: 3,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  selected: {
    borderWidth: 3,
    borderColor: '#fff',
    transform: [{ scale: 1.08 }],
  },

  cellText: {
    fontSize: 20,
    color: '#fff',
    fontWeight: '900',
  },

  rulesContainer: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },

  rulesTitle: {
    fontSize: 30,
    color: '#fff',
    fontWeight: '900',
    marginBottom: 10,
    textAlign: 'center',
  },

  rulesSubtitle: {
    fontSize: 20,
    color: '#fff',
    marginBottom: 25,
    fontWeight: '700',
    textAlign: 'center',
  },

  rulesCard: {
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 22,
    padding: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },

  ruleText: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 12,
    lineHeight: 22,
    fontWeight: '600',
  },

  startButton: {
    marginTop: 28,
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    paddingHorizontal: 45,
    borderRadius: 30,
  },
});