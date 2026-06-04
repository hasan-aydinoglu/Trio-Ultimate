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

const tableNumbers = [
  3,7,3,5,8,4,9,
  5,1,8,6,5,2,7,
  8,6,2,4,9,1,9,
  2,6,4,7,5,5,3,
  7,4,3,2,1,6,3,
  2,1,4,8,3,9,5,
  1,8,6,7,2,4,6,
];

const blueCards = [20,24,27,30,32,36,40,44,45,48,50];

const players = [
  { id: 1, name: 'Player 1', photo: null },
  { id: 2, name: 'Player 2', photo: null },
];

const shuffleArray = (array) => {
  return [...array].sort(() => Math.random() - 0.5);
};

export default function GameScreen5({ route }) {
  const [cards] = useState(shuffleArray(tableNumbers));
  const [openedCards, setOpenedCards] = useState([]);
  const [wonBlueCards, setWonBlueCards] = useState([]);
  const [playerTurn, setPlayerTurn] = useState(1);
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
              ? ['#7b1fa2', '#ce93d8']
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
      </View>
    );
  };

  const openCard = (index) => {
    if (openedCards.includes(index)) return;

    if (openedCards.length >= 3) {
      Alert.alert('Limit', 'You can only choose 3 cards.');
      return;
    }

    setOpenedCards([...openedCards, index]);
  };

  const checkBlueCards = () => {
    if (openedCards.length !== 3) {
      Alert.alert('Pick 3 cards first!');
      return;
    }

    const nums = openedCards.map((index) => cards[index]);

    const possibleResults = [
      nums[0] + nums[1] + nums[2],
      nums[0] * nums[1] + nums[2],
      nums[0] * nums[1] - nums[2],
      (nums[0] + nums[1]) * nums[2],
      (nums[0] - nums[1]) * nums[2],
    ];

    const matchedBlueCard = blueCards.find(
      (card) =>
        possibleResults.includes(card) &&
        !wonBlueCards.includes(card)
    );

    if (matchedBlueCard) {
      setWonBlueCards([...wonBlueCards, matchedBlueCard]);

      Alert.alert(
        '🎉 Blue Card Won!',
        `${getPlayerName(playerTurn)} won blue card ${matchedBlueCard}`
      );
    } else {
      Alert.alert('❌ No Match', 'No blue card found.');
    }

    setOpenedCards([]);
    setPlayerTurn(playerTurn === 1 ? 2 : 1);
  };

  if (showRules) {
    return (
      <ImageBackground
        source={require('../assets/trioabout.png')}
        style={styles.backgroundImage}
      >
        <LinearGradient
          colors={['#1a0033', '#4a148c', '#7b1fa2', '#ce93d8']}
          style={styles.rulesContainer}
        >
          <Text style={styles.rulesTitle}>TRIO GAME TYPE 5</Text>
          <Text style={styles.rulesSubtitle}>Blue Card Hunt Mode</Text>

          <View style={styles.rulesCard}>
            <Text style={styles.ruleText}>• This mode is played by 2 players.</Text>
            <Text style={styles.ruleText}>• Blue cards are shown at the top of the screen.</Text>
            <Text style={styles.ruleText}>• Players take turns choosing 3 hidden cards.</Text>
            <Text style={styles.ruleText}>• Try to match one of the blue card numbers.</Text>
            <Text style={styles.ruleText}>• You can use addition, multiplication, and subtraction formulas.</Text>
            <Text style={styles.ruleText}>• If your 3 numbers match a blue card, you win that card.</Text>
            <Text style={styles.ruleText}>• Won blue cards turn green with a check mark.</Text>
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
        colors={['#1a0033', '#4a148c', '#7b1fa2', '#ce93d8']}
        style={styles.container}
      >
        <Text style={styles.title}>Game Type 5</Text>
        <Text style={styles.subtitle}>Blue Card Hunt Mode</Text>

        <View style={styles.playersBox}>
          {renderPlayerCard(1)}
          {renderPlayerCard(2)}
        </View>

        <Text style={styles.turnText}>
          Turn: {getPlayerName(playerTurn)}
        </Text>

        <View style={styles.blueCardContainer}>
          {blueCards.map((card) => (
            <View
              key={card}
              style={[
                styles.blueCard,
                wonBlueCards.includes(card)
                  ? styles.blueCardWon
                  : null,
              ]}
            >
              <Text style={styles.blueText}>
                {wonBlueCards.includes(card) ? '✓' : card}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.table}>
          {Array.from({ length: 7 }).map((_, rowIndex) => (
            <View key={rowIndex} style={styles.row}>
              {cards
                .slice(rowIndex * 7, rowIndex * 7 + 7)
                .map((value, colIndex) => {
                  const index = rowIndex * 7 + colIndex;
                  const isOpened = openedCards.includes(index);

                  return (
                    <TouchableOpacity
                      key={index}
                      style={styles.cell}
                      onPress={() => openCard(index)}
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

        <TouchableOpacity
          style={styles.checkButton}
          onPress={checkBlueCards}
        >
          <Text style={styles.buttonText}>
            Check Blue Cards
          </Text>
        </TouchableOpacity>
      </LinearGradient>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage:{
    flex:1,
  },

  container:{
    flex:1,
    alignItems:'center',
    justifyContent:'center',
    padding:10,
  },

  title:{
    color:'#fff',
    fontSize:25,
    fontWeight:'bold',
  },

  subtitle:{
    color:'#fff',
    marginBottom:10,
  },

  playersBox: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
    marginBottom: 10,
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
    padding: 8,
    marginBottom: 4,
  },

  profileImage: {
    width: 62,
    height: 62,
    borderRadius: 31,
    borderWidth: 3,
    borderColor: '#ffffff',
  },

  defaultAvatar: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderWidth: 3,
    borderColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },

  defaultAvatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '900',
  },

  playerName: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '900',
    textAlign: 'center',
  },

  turnText:{
    color:'#fff',
    fontWeight:'bold',
    marginBottom:8,
  },

  blueCardContainer:{
    flexDirection:'row',
    flexWrap:'wrap',
    justifyContent:'center',
    marginBottom:10,
  },

  blueCard:{
    backgroundColor:'#3498db',
    width:40,
    height:40,
    borderRadius:20,
    margin:4,
    justifyContent:'center',
    alignItems:'center',
  },

  blueCardWon:{
    backgroundColor:'#16a34a',
  },

  blueText:{
    color:'#fff',
    fontWeight:'bold',
  },

  table:{
    marginVertical:8,
  },

  row:{
    flexDirection:'row',
  },

  cell:{
    width:42,
    height:42,
    margin:3,
    borderRadius:8,
    backgroundColor:'#111827',
    alignItems:'center',
    justifyContent:'center',
  },

  cellText:{
    color:'#fff',
    fontSize:20,
    fontWeight:'bold',
  },

  checkButton:{
    backgroundColor:'#2563eb',
    paddingHorizontal:20,
    paddingVertical:12,
    borderRadius:30,
    marginTop:10,
  },

  buttonText:{
    color:'#fff',
    fontWeight:'bold',
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
    backgroundColor: 'rgba(255,255,255,0.15)',
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