import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

// Table values — your image values
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

const GameScreen = () => {
  const [selectedCells, setSelectedCells] = useState([]);
  const [randomNumber, setRandomNumber] = useState(null);

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
    let result;
  
    
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
          Alert.alert('🎉 CONGRATULATIONS!', 'You reached the target: ${randomNumber}');
        } else {
          Alert.alert('❌ Not quite', 'Possible results: ${possibleResults.join(', ')} | Target: ${randomNumber}');
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

  return (
    <ImageBackground source={require('../assets/trioabout.png')} style={styles.backgroundImage}>
      <LinearGradient colors={['#2C3E50AA', '#34495EAA']} style={styles.container}>
        
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
                    selectedCells.find(c => c.row === rowIndex && c.col === colIndex)
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
  backgroundImage: { flex: 1, resizeMode: 'cover' },
  container: { flex: 1, padding: 10, alignItems: 'center', justifyContent: 'center' },
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
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  table: { marginVertical: 10 },
  row: { flexDirection: 'row' },
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
  cellText: { fontSize: 20, color: '#fff', fontWeight: 'bold' },
  randomNumberBox: {
    backgroundColor: '#2980b9',
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  randomNumberText: { color: '#fff', fontSize: 28, fontWeight: 'bold' },
});

export default GameScreen;