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

const players = [
  { id: 1, name: 'Player 1', photo: null },
  { id: 2, name: 'Player 2', photo: null },
  { id: 3, name: 'Player 3', photo: null },
  { id: 4, name: 'Player 4', photo: null },
];

const GameScreen2 = ({ route }) => {
  const [selectedCells, setSelectedCells] = useState([]);
  const [randomNumber, setRandomNumber] = useState(null);
  const [showRules, setShowRules] = useState(true);
  const [profileImage, setProfileImage] = useState(null);

  const routePlayers = route?.params?.players || players;

  useEffect(() => {
    const loadProfileImage = async () => {
      const savedImage = await AsyncStorage.getItem('profileImage');

      if (savedImage) {
        setProfileImage(savedImage);
      }
    };

    loadProfileImage();
  }, []);

  const getPlayerPhoto = (playerId) => {
    if (playerId === 1 && profileImage) {
      return profileImage;
    }

    const player = routePlayers.find((p) => p.id === playerId);
    return player?.photo || player?.image || player?.avatar || null;
  };

  const getPlayerName = (playerId) => {
    const player = routePlayers.find((p) => p.id === playerId);
    return player?.name || `Player ${playerId}`;
  };

  const renderPlayerCard = (playerId) => {
    const photo = getPlayerPhoto(playerId);

    return (
      <View style={styles.playerCard}>
        <LinearGradient
          colors={['#005f73', '#0a9396', '#94d2bd']}
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
      </View>
    );
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

    if (selectedCells.length < 3) {
      setSelectedCells([...selectedCells, { row: rowIndex, col: colIndex, value }]);
    } else {
      Alert.alert('Limit Reached', 'You can only select 3 numbers.');
    }
  };

  const checkResult = () => {
    if (randomNumber === null) {
      Alert.alert('Generate a number first!');
      return;
    }

    if (selectedCells.length !== 3) {
      Alert.alert('Pick 3 numbers first!');
      return;
    }

    const values = selectedCells.map((c) => c.value);
    const [a, b, c] = values;

    const possibleResults = [
      { expression: `(${a} + ${b}) × ${c}`, value: (a + b) * c },
      { expression: `(${a} - ${b}) × ${c}`, value: (a - b) * c },
      { expression: `(${a} + ${c}) × ${b}`, value: (a + c) * b },
      { expression: `(${a} - ${c}) × ${b}`, value: (a - c) * b },
      { expression: `(${b} + ${c}) × ${a}`, value: (b + c) * a },
      { expression: `(${b} - ${c}) × ${a}`, value: (b - c) * a },
    ];

    if (c !== 0) {
      possibleResults.push(
        { expression: `(${a} + ${b}) ÷ ${c}`, value: (a + b) / c },
        { expression: `(${a} - ${b}) ÷ ${c}`, value: (a - b) / c }
      );
    }

    if (b !== 0) {
      possibleResults.push(
        { expression: `(${a} + ${c}) ÷ ${b}`, value: (a + c) / b },
        { expression: `(${a} - ${c}) ÷ ${b}`, value: (a - c) / b }
      );
    }

    if (a !== 0) {
      possibleResults.push(
        { expression: `(${b} + ${c}) ÷ ${a}`, value: (b + c) / a },
        { expression: `(${b} - ${c}) ÷ ${a}`, value: (b - c) / a }
      );
    }

    const matchedResult = possibleResults.find(
      (item) => item.value === randomNumber
    );

    if (matchedResult) {
      Alert.alert(
        '🎉 CONGRATULATIONS!',
        `You reached the target!\n\n${matchedResult.expression} = ${randomNumber}`
      );
    } else {
      const resultText = possibleResults
        .map((item) => `${item.expression} = ${item.value}`)
        .join('\n');

      Alert.alert(
        '❌ Not quite',
        `Target: ${randomNumber}\n\nPossible results:\n${resultText}`
      );
    }

    setSelectedCells([]);
  };

  const generateRandomNumber = () => {
    const number = Math.floor(Math.random() * 50) + 1;
    setRandomNumber(number);

    setTimeout(() => {
      setRandomNumber(null);
      setSelectedCells([]);
    }, 30000);
  };

  if (showRules) {
    return (
      <ImageBackground
        source={require('../assets/trioabout.png')}
        style={styles.backgroundImage}
      >
        <LinearGradient
          colors={['#001219', '#005f73', '#0a9396', '#94d2bd']}
          style={styles.rulesContainer}
        >
          <Text style={styles.rulesTitle}>TRIO GAME TYPE 2</Text>

          <Text style={styles.rulesSubtitle}>Game Rules</Text>

          <View style={styles.rulesCard}>
            <Text style={styles.ruleText}>• Generate a target number</Text>

            <Text style={styles.ruleText}>
              • Select exactly 3 numbers from the board
            </Text>

            <Text style={styles.ruleText}>
              • First use addition or subtraction inside brackets
            </Text>

            <Text style={styles.ruleText}>
              • Then multiply or divide the result by the third number
            </Text>

            <Text style={styles.ruleText}>• Example: (3 + 7) × 5 = 50</Text>

            <Text style={styles.ruleText}>
              • Press Check Result to verify your answer
            </Text>
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
        colors={['#001219', '#005f73', '#0a9396', '#94d2bd']}
        style={styles.container}
      >
        <Text style={styles.title}>Game Type 2</Text>
        <Text style={styles.subtitle}>
          Addition/Subtraction first, then Multiplication/Division
        </Text>

        <View style={styles.playersBox}>
          {renderPlayerCard(1)}
          {renderPlayerCard(2)}
          {renderPlayerCard(3)}
          {renderPlayerCard(4)}
        </View>

        <TouchableOpacity style={styles.randomButton} onPress={generateRandomNumber}>
          <Text style={styles.buttonText}>🎲 Generate Number</Text>
        </TouchableOpacity>

        {randomNumber !== null && (
          <View style={styles.randomNumberBox}>
            <Text style={styles.randomNumberText}>{randomNumber}</Text>
          </View>
        )}

        <View style={styles.table}>
          {tableData.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.row}>
              {row.map((cellValue, colIndex) => (
                <TouchableOpacity
                  key={colIndex}
                  style={[
                    styles.cell,
                    { backgroundColor: cellColors[rowIndex][colIndex] },
                    selectedCells.find(
                      (c) => c.row === rowIndex && c.col === colIndex
                    )
                      ? styles.selected
                      : null,
                  ]}
                  onPress={() => handleCellPress(rowIndex, colIndex, cellValue)}
                >
                  <Text style={styles.cellText}>{cellValue}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.checkButton} onPress={checkResult}>
          <Text style={styles.buttonText}>✅ Check Result</Text>
        </TouchableOpacity>
      </LinearGradient>
    </ImageBackground>
  );
};

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
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },

  subtitle: {
    color: '#fff',
    fontSize: 13,
    marginBottom: 12,
    textAlign: 'center',
  },

  playersBox: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
    flexWrap: 'wrap',
  },

  playerCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 4,
  },

  avatarGlow: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 60,
    padding: 7,
    marginBottom: 4,
  },

  profileImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 3,
    borderColor: '#ffffff',
  },

  defaultAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderWidth: 3,
    borderColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
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

  randomButton: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 30,
    marginBottom: 15,
  },

  checkButton: {
    backgroundColor: '#27ae60',
    padding: 15,
    borderRadius: 30,
    marginTop: 20,
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
    fontWeight: 'bold',
  },

  randomNumberBox: {
    backgroundColor: '#2980b9',
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },

  randomNumberText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
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
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 22,
    padding: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },

  ruleText: {
    color: '#fff',
    fontSize: 17,
    marginBottom: 15,
    lineHeight: 24,
  },

  startButton: {
    marginTop: 28,
    backgroundColor: '#27ae60',
    paddingVertical: 16,
    paddingHorizontal: 45,
    borderRadius: 30,
  },
});

export default GameScreen2;