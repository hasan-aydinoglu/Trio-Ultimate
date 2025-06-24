import React, { useState } from 'react';
import { Animated } from 'react-native';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const gridData = [
  [3, 7, 3, 5, 8, 4, 9],
  [5, 1, 8, 6, 5, 2, 7],
  [8, 6, 2, 4, 9, 1, 9],
  [2, 6, 4, 7, 5, 5, 3],
  [7, 4, 3, 2, 1, 6, 3],
  [2, 1, 4, 8, 3, 9, 5],
  [1, 8, 6, 7, 2, 4, 6],
];

const getCellColor = (value) => {
  switch (value) {
    case 1: return '#8e44ad';
    case 2: return '#9b59b6';
    case 3: return '#e67e22';
    case 4: return '#d35400';
    case 5: return '#f39c12';
    case 6: return '#c0392b';
    case 7: return '#e84393';
    case 8: return '#e74c3c';
    case 9: return '#d63031';
    default: return '#ecf0f1';
  }
};

const GameScreen = () => {
  const [selectedCells, setSelectedCells] = useState([]);

  const handleCellPress = (rowIndex, colIndex, value) => {
    const cell = { row: rowIndex, col: colIndex, value };
    setSelectedCells([...selectedCells, cell]);
    checkForMatch([...selectedCells, cell]);
  };

  const checkForMatch = (cells) => {
    if (cells.length < 3) return;
    const lastThree = cells.slice(-3);
    const allSameValue = lastThree.every(cell => cell.value === lastThree[0].value);
    if (allSameValue) {
      Alert.alert('TEBRİKLER 🎉', `3 aynı sayı: ${lastThree[0].value}`);
      setSelectedCells([]);
    }
  };

  return (
    <ImageBackground
    source={require('../assets/trioabout.png')}
    style={styles.background}
    resizeMode="stretch"
    imageStyle={{ left: -50 }} // 📌 Arka planı 50px sola kaydırdık
  >
  
      <LinearGradient colors={['rgba(44,62,80,0.7)', 'rgba(52,73,94,0.8)']} style={styles.container}>
        {gridData.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map((cellValue, colIndex) => (
              <TouchableOpacity
                key={colIndex}
                style={[
                  styles.cell,
                  { backgroundColor: getCellColor(cellValue) },
                  selectedCells.find(c => c.row === rowIndex && c.col === colIndex)
                    ? styles.selected : null
                ]}
                onPress={() => handleCellPress(rowIndex, colIndex, cellValue)}
              >
                <Text style={styles.cellText}>{cellValue}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </LinearGradient>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: { flex: 1 },
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  row: { flexDirection: 'row' },
  cell: {
    width: 50,
    height: 50,
    margin: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  selected: {
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  cellText: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default GameScreen;
