import React, { useState } from 'react';
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

const GameScreen = ({ route }) => {
  const [selectedCells, setSelectedCells] = useState([]);
  const [randomNumber, setRandomNumber] = useState(null);
  const [showRules, setShowRules] = useState(true);

  const routePlayers = route?.params?.players || players;

  const getPlayerPhoto = (playerId) => {
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
          colors={['#2563eb', '#60a5fa']}
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
    const cell = { row: rowIndex, col: colIndex, value };

    if (selectedCells.length < 3) {
      setSelectedCells([...selectedCells, cell]);
    }
  };

  const checkResult = () => {
    if (selectedCells.length !== 3) {
      Alert.alert('Pick 3 numbers first!');
      return;
    }

    const values = selectedCells.map(c => c.value);

    if (values[1] !== 0) {
      const multiply = values[0] * values[1];
      const divide = values[0] / values[1];

      const possibleResults = [];

      possibleResults.push(multiply + values[2]);
      possibleResults.push(multiply - values[2]);

      if (Number.isFinite(divide)) {
        possibleResults.push(divide + values[2]);
        possibleResults.push(divide - values[2]);
      }

      if (randomNumber !== null) {
        if (possibleResults.includes(randomNumber)) {
          Alert.alert(
            '🎉 CONGRATULATIONS!',
            `You reached the target: ${randomNumber}`
          );
        } else {
          Alert.alert(
            '❌ Not quite',
            `Possible results: ${possibleResults.join(', ')} | Target: ${randomNumber}`
          );
        }
      } else {
        Alert.alert('Generate a number first!');
      }
    } else {
      Alert.alert('Error', 'Cannot divide by zero!');
    }

    setSelectedCells([]);
  };

  const generateRandomNumber = () => {
    const number = Math.floor(Math.random() * 50) + 1;

    setRandomNumber(number);

    setTimeout(() => {
      setRandomNumber(null);
    }, 30000);
  };

  if (showRules) {
    return (
      <ImageBackground
        source={require('../assets/trioabout.png')}
        style={styles.backgroundImage}
      >
        <LinearGradient
          colors={['#00c6ff', '#0072ff', '#000']}
          style={styles.rulesContainer}
        >
          <Text style={styles.rulesTitle}>TRIO GAME TYPE 1</Text>
          <Text style={styles.rulesSubtitle}>Game Rules</Text>

          <View style={styles.rulesCard}>
            <Text style={styles.ruleText}>• Generate a target number</Text>
            <Text style={styles.ruleText}>• Select 3 numbers from the board</Text>
            <Text style={styles.ruleText}>• Try to reach the target number</Text>
            <Text style={styles.ruleText}>• Use multiplication or division first</Text>
            <Text style={styles.ruleText}>• Then use addition or subtraction</Text>
            <Text style={styles.ruleText}>• Press Check Result to verify your answer</Text>
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
        colors={['#00c6ff', '#0072ff', '#000']}
        style={styles.container}
      >
        <View style={styles.playersBox}>
          {renderPlayerCard(1)}
          {renderPlayerCard(2)}
          {renderPlayerCard(3)}
          {renderPlayerCard(4)}
        </View>

        <TouchableOpacity
          style={styles.randomButton}
          onPress={generateRandomNumber}
        >
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
                    {
                      backgroundColor: cellColors[rowIndex][colIndex],
                    },
                    selectedCells.find(
                      c => c.row === rowIndex && c.col === colIndex
                    )
                      ? styles.selected
                      : null,
                  ]}
                  onPress={() =>
                    handleCellPress(rowIndex, colIndex, cellValue)
                  }
                >
                  <Text style={styles.cellText}>{cellValue}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={styles.checkButton}
          onPress={checkResult}
        >
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

  playersBox: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
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
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 3,
    borderColor: '#ffffff',
  },

  defaultAvatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
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
    borderWidth: 2,
    borderColor: '#fff',
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

export default GameScreen;