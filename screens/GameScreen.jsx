import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, Alert, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const tableData = [
  [3, 5, 7],
  [6, 2, 8],
  [4, 9, 1],
];

export default function GameScreen() {
  const [selectedCells, setSelectedCells] = useState([]);
  const [randomNumber, setRandomNumber] = useState(null);
  const [opacity] = useState(new Animated.Value(0));

  const handleCellPress = (rowIndex, colIndex, value) => {
    const cell = { row: rowIndex, col: colIndex, value };
    if (selectedCells.length < 3) {
      setSelectedCells([...selectedCells, cell]);
    }
  };

  const calculateResult = () => {
    if (selectedCells.length !== 3) {
      Alert.alert('Select 3 numbers!');
      return;
    }

    const values = selectedCells.map(c => c.value);
    let result = values[0];

    // First: multiply and divide left to right
    for (let i = 1; i < values.length; i++) {
      result *= values[i];
    }

    // No division in this example; add if needed here

    if (result === randomNumber) {
      Alert.alert('CONGRATULATIONS 🎉', 'Result matches the target: ${randomNumber}');
    } else {
      Alert.alert('Not quite 😢', 'Result: ${result}, Target: ${randomNumber}');
    }

    setSelectedCells([]);
  };

  const generateRandomNumber = () => {
    const number = Math.floor(Math.random() * 50) + 1;
    setRandomNumber(number);

    Animated.sequence([
      Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 29000, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  };

  const getCellStyle = (value) => {
    switch (value) {
      case 1: return styles.cellColor1;
      case 2: return styles.cellColor2;
      case 3: return styles.cellColor3;
      case 4: return styles.cellColor4;
      case 5: return styles.cellColor5;
      case 6: return styles.cellColor6;
      case 7: return styles.cellColor7;
      case 8: return styles.cellColor8;
      case 9: return styles.cellColor9;
      default: return styles.cellDefault;
    }
  };

  return (
    <ImageBackground source={require('../assets/trioabout.png')} style={styles.background}>
      <LinearGradient colors={['rgba(44,62,80,0.8)', 'rgba(52,73,94,0.8)']} style={styles.overlay}>
        <TouchableOpacity style={styles.randomButton} onPress={generateRandomNumber}>
          <Text style={styles.buttonText}>Get Random Number</Text>
        </TouchableOpacity>

        <View style={styles.table}>
          {tableData.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.row}>
              {row.map((cellValue, colIndex) => (
                <TouchableOpacity
                  key={colIndex}
                  style={[
                    styles.cell,
                    getCellStyle(cellValue),
                    selectedCells.find(c => c.row === rowIndex && c.col === colIndex)
                      ? styles.selectedCell
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

        <TouchableOpacity style={styles.calculateButton} onPress={calculateResult}>
          <Text style={styles.buttonText}>Check Result</Text>
        </TouchableOpacity>

        {randomNumber !== null && (
          <Animated.View style={[styles.randomNumberContainer, { opacity }]}>
            <Text style={styles.randomNumber}>{randomNumber}</Text>
          </Animated.View>
        )}
      </LinearGradient>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
  },
  overlay: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  table: {
    marginTop: 80,
    marginBottom: 30,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  cell: {
    width: 80,
    height: 80,
    margin: 5,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellText: {
    fontSize: 28,
    color: '#fff',
    fontWeight: 'bold',
  },
  selectedCell: {
    borderWidth: 3,
    borderColor: '#fff',
  },
  // Cell colors
  cellColor1: { backgroundColor: '#3498db' },
  cellColor2: { backgroundColor: '#e67e22' },
  cellColor3: { backgroundColor: '#9b59b6' },
  cellColor4: { backgroundColor: '#2ecc71' },
  cellColor5: { backgroundColor: '#f1c40f' },
  cellColor6: { backgroundColor: '#1abc9c' },
  cellColor7: { backgroundColor: '#e74c3c' },
  cellColor8: { backgroundColor: '#34495e' },
  cellColor9: { backgroundColor: '#95a5a6' },
  cellDefault: { backgroundColor: '#7f8c8d' },

  randomButton: {
    backgroundColor: '#2980b9',
    paddingVertical: 15,
    borderRadius: 20,
    alignItems: 'center',
    marginHorizontal: 20,
  },
  calculateButton: {
    backgroundColor: '#27ae60',
    paddingVertical: 15,
    borderRadius: 20,
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 20,
  },
  buttonText: {
    color: '#ecf0f1',
    fontSize: 18,
    fontWeight: 'bold',
  },
  randomNumberContainer: {
    marginTop: 40,
    alignSelf: 'center',
    backgroundColor: '#2980b9',
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  randomNumber: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
});