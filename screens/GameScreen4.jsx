import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ImageBackground,
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

const blueCards = [10, 20, 24, 27, 30, 32, 36, 40, 44, 45, 48, 50];

export default function GameScreen4() {
  const [selectedCells, setSelectedCells] = useState([]);
  const [targetNumber, setTargetNumber] = useState(null);
  const [mode, setMode] = useState('doubleMinus');
  const [playerTurn, setPlayerTurn] = useState(1);
  const [scores, setScores] = useState({ 1: 0, 2: 0 });

  const drawBlueCard = () => {
    const randomBlueCard = blueCards[Math.floor(Math.random() * blueCards.length)];
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
          `Player ${playerTurn} wins ${targetNumber} points!\n\n${firstNumber} - ${secondNumber} = ${targetNumber}`
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
          `Player ${playerTurn} wins ${targetNumber} points!\n\n${a} × ${b} - ${c} = ${targetNumber}`
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

    setPlayerTurn(playerTurn === 1 ? 2 : 1);
  };

  const resetGame = () => {
    setSelectedCells([]);
    setTargetNumber(null);
    setPlayerTurn(1);
    setScores({ 1: 0, 2: 0 });
  };

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

        <View style={styles.scoreBox}>
          <Text style={styles.scoreText}>Player 1: {scores[1]}</Text>
          <Text style={styles.scoreText}>Player 2: {scores[2]}</Text>
        </View>

        <Text style={styles.turnText}>Turn: Player {playerTurn}</Text>

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
                    onPress={() => handleCellPress(rowIndex, colIndex, cellValue)}
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

  scoreBox: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 6,
  },

  scoreText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
    backgroundColor: 'rgba(0,0,0,0.25)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
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
});