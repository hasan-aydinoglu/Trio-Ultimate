import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ImageBackground,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const originalCards = [
  3, 7, 3, 5, 8, 4, 9,
  5, 1, 8, 6, 5, 2, 7,
  8, 6, 2, 4, 9, 1, 9,
  2, 6, 4, 7, 5, 5, 3,
  7, 4, 3, 2, 1, 6, 3,
  2, 1, 4, 8, 3, 9, 5,
  1, 8, 6, 7, 2, 4, 6,
];

const cardColors = ['#e67e22', '#e84393', '#8e44ad'];

const blueCards = [20, 24, 27, 30, 32, 36, 40, 44, 45, 48, 50];

const shuffleArray = (array) => {
  return [...array].sort(() => Math.random() - 0.5);
};

const canReachTarget = (numbers, target) => {
  if (numbers.length < 3) return null;

  const ops = [
    { symbol: '+', fn: (a, b) => a + b },
    { symbol: '-', fn: (a, b) => a - b },
    { symbol: '×', fn: (a, b) => a * b },
    { symbol: '÷', fn: (a, b) => (b !== 0 ? a / b : null) },
  ];

  const permutations = [];

  const permute = (arr, path = []) => {
    if (arr.length === 0) {
      permutations.push(path);
      return;
    }

    arr.forEach((item, index) => {
      const rest = arr.filter((_, i) => i !== index);
      permute(rest, [...path, item]);
    });
  };

  permute(numbers);

  for (const nums of permutations) {
    for (const op1 of ops) {
      for (const op2 of ops) {
        let first = op1.fn(nums[0], nums[1]);
        if (first === null || !Number.isFinite(first)) continue;

        let result = op2.fn(first, nums[2]);
        if (result === null || !Number.isFinite(result)) continue;

        if (Math.abs(result - target) < 0.0001) {
          return `(${nums[0]} ${op1.symbol} ${nums[1]}) ${op2.symbol} ${nums[2]} = ${target}`;
        }
      }
    }
  }

  return null;
};

export default function GameScreen3() {
  const [cards, setCards] = useState(() => shuffleArray(originalCards));
  const [openedIndexes, setOpenedIndexes] = useState([]);
  const [targetNumber, setTargetNumber] = useState(null);
  const [usedBlueCards, setUsedBlueCards] = useState([]);
  const [playerTurn, setPlayerTurn] = useState(1);
  const [scores, setScores] = useState({
    1: 0,
    2: 0,
  });

  const openedNumbers = useMemo(() => {
    return openedIndexes.map((index) => cards[index]);
  }, [openedIndexes, cards]);

  const startRound = () => {
    const availableBlueCards = blueCards.filter(
      (card) => !usedBlueCards.includes(card)
    );

    if (availableBlueCards.length === 0) {
      const winner =
        scores[1] > scores[2]
          ? 'Player 1 wins!'
          : scores[2] > scores[1]
          ? 'Player 2 wins!'
          : 'Draw!';

      Alert.alert(
        'Game Over',
        `Player 1: ${scores[1]} points\nPlayer 2: ${scores[2]} points\n\n${winner}`
      );
      return;
    }

    const randomBlueCard =
      availableBlueCards[Math.floor(Math.random() * availableBlueCards.length)];

    setTargetNumber(randomBlueCard);
    setOpenedIndexes([]);
    setCards(shuffleArray(originalCards));
  };

  const openCard = (index) => {
    if (targetNumber === null) {
      Alert.alert('Start Round', 'Please select a blue target card first.');
      return;
    }

    if (openedIndexes.includes(index)) return;

    const newOpenedIndexes = [...openedIndexes, index];
    const newOpenedNumbers = newOpenedIndexes.map((i) => cards[i]);

    setOpenedIndexes(newOpenedIndexes);

    const solution = canReachTarget(newOpenedNumbers, targetNumber);

    if (solution) {
      const newScores = {
        ...scores,
        [playerTurn]: scores[playerTurn] + targetNumber,
      };

      setScores(newScores);
      setUsedBlueCards([...usedBlueCards, targetNumber]);

      Alert.alert(
        '🎉 Round Winner!',
        `Player ${playerTurn} reached ${targetNumber}\n\n${solution}\n\nPlayer ${playerTurn} wins ${targetNumber} points!`
      );

      setTargetNumber(null);
      setOpenedIndexes([]);
      setCards(shuffleArray(originalCards));
      setPlayerTurn(playerTurn === 1 ? 2 : 1);
      return;
    }

    setPlayerTurn(playerTurn === 1 ? 2 : 1);
  };

  const resetGame = () => {
    setCards(shuffleArray(originalCards));
    setOpenedIndexes([]);
    setTargetNumber(null);
    setUsedBlueCards([]);
    setPlayerTurn(1);
    setScores({ 1: 0, 2: 0 });
  };

  return (
    <ImageBackground
      source={require('../assets/trioabout.png')}
      style={styles.backgroundImage}
    >
      <LinearGradient
        colors={['#141E30', '#243B55', '#000000']}
        style={styles.container}
      >
        <Text style={styles.title}>Game Type 3</Text>
        <Text style={styles.subtitle}>Hidden Card Challenge</Text>

        <View style={styles.scoreBox}>
          <Text style={styles.scoreText}>Player 1: {scores[1]}</Text>
          <Text style={styles.scoreText}>Player 2: {scores[2]}</Text>
        </View>

        <Text style={styles.turnText}>Turn: Player {playerTurn}</Text>

        <TouchableOpacity style={styles.blueButton} onPress={startRound}>
          <Text style={styles.buttonText}>
            {targetNumber === null ? 'Draw Blue Card' : `Target: ${targetNumber}`}
          </Text>
        </TouchableOpacity>

        <View style={styles.table}>
          {Array.from({ length: 7 }).map((_, rowIndex) => (
            <View key={rowIndex} style={styles.row}>
              {cards.slice(rowIndex * 7, rowIndex * 7 + 7).map((value, colIndex) => {
                const index = rowIndex * 7 + colIndex;
                const isOpened = openedIndexes.includes(index);

                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.cell,
                      {
                        backgroundColor: isOpened
                          ? cardColors[index % cardColors.length]
                          : '#111827',
                      },
                    ]}
                    onPress={() => openCard(index)}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.cellText}>
                      {isOpened ? value : '?'}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>

        <View style={styles.openedBox}>
          <Text style={styles.openedTitle}>Opened Numbers</Text>
          <Text style={styles.openedNumbers}>
            {openedNumbers.length > 0 ? openedNumbers.join('  |  ') : '-'}
          </Text>
        </View>

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
    color: '#dbeafe',
    fontSize: 14,
    marginBottom: 10,
  },

  scoreBox: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },

  scoreText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },

  turnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },

  blueButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 13,
    paddingHorizontal: 22,
    borderRadius: 30,
    marginBottom: 10,
  },

  resetButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 30,
    marginTop: 12,
  },

  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },

  table: {
    marginVertical: 6,
  },

  row: {
    flexDirection: 'row',
  },

  cell: {
    width: 43,
    height: 43,
    margin: 3,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },

  cellText: {
    fontSize: 20,
    color: '#fff',
    fontWeight: '900',
  },

  openedBox: {
    marginTop: 8,
    backgroundColor: 'rgba(255,255,255,0.14)',
    padding: 10,
    borderRadius: 14,
    minWidth: '85%',
    alignItems: 'center',
  },

  openedTitle: {
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 4,
  },

  openedNumbers: {
    color: '#fff',
    fontSize: 15,
  },
});