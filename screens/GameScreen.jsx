import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const solutions = [
  [1, 2, 1, 1],
  [2, 2, 2, 2],
  [3, 4, 2, 5],
  [4, 5, 1, 1],
  [5, 4, 2, 3],
  [6, 8, 1, 2],
  [7, 3, 5, 8],
  [8, 4, 4, 8],
  [9, 2, 5, 1],
  [10, 3, 6, 8],
  [11, 2, 9, 7],
  [12, 4, 2, 4],
  [13, 7, 3, 8],
  [14, 4, 5, 6],
  [15, 4, 5, 5],
  [16, 4, 2, 8],
  [17, 7, 3, 4],
  [18, 5, 4, 2],
  [19, 6, 3, 1],
  [20, 3, 8, 4],
  [21, 3, 8, 3],
  [22, 6, 4, 2],
  [23, 6, 5, 7],
  [24, 5, 6, 6],
  [25, 5, 4, 5],
  [26, 7, 5, 9],
  [27, 3, 7, 6],
  [28, 4, 5, 8],
  [29, 5, 5, 4],
  [30, 6, 4, 6],
  [31, 6, 6, 5],
  [32, 8, 5, 8],
  [33, 5, 6, 3],
  [34, 4, 8, 2],
  [35, 6, 7, 7],
  [36, 5, 8, 4],
  [37, 6, 7, 5],
  [38, 8, 4, 6],
  [39, 9, 5, 6],
  [40, 5, 9, 5],
  [41, 6, 8, 7],
  [42, 7, 5, 7],
  [43, 9, 5, 2],
  [44, 5, 8, 4],
  [45, 6, 6, 9],
  [46, 8, 5, 6],
  [47, 4, 9, 8],
  [48, 9, 5, 3],
  [49, 8, 6, 1],
  [50, 7, 7, 1]
];

const GameScreen = () => {
  const [selectedCells, setSelectedCells] = useState([]);

  const handleCellPress = (rowIndex, colIndex, value) => {
    const cell = { row: rowIndex, col: colIndex, value };
    const newSelected = [...selectedCells, cell];
    setSelectedCells(newSelected);
    checkForMatch(newSelected);
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
    <LinearGradient colors={['#2C3E50', '#34495E']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {solutions.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.slice(1).map((cellValue, colIndex) => (
              <TouchableOpacity
                key={colIndex}
                style={[
                  styles.cell,
                  selectedCells.find(c => c.row === rowIndex && c.col === colIndex) ? styles.selected : null
                ]}
                onPress={() => handleCellPress(rowIndex, colIndex, cellValue)}
              >
                <Text style={styles.cellText}>{cellValue}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  cell: {
    backgroundColor: '#ecf0f1',
    width: 60,
    height: 60,
    marginHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    elevation: 3, // gölge efekti için android
    shadowColor: '#000', // gölge ios
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  selected: {
    backgroundColor: '#1abc9c',
  },
  cellText: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
});

export default GameScreen;
