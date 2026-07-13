import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { auth, db } from '../firebase';
import {
  doc,
  getDoc,
  onSnapshot,
} from 'firebase/firestore';

const MAX_PLAYERS = 4;

export default function OnlineLobbyScreen({ navigation, route }) {
  const roomId = route?.params?.roomId;
  const gameType = route?.params?.gameType || 1;

  const [players, setPlayers] = useState([]);
  const [loadingPlayers, setLoadingPlayers] = useState(true);

  useEffect(() => {
    let unsubscribeRoom;

    const initialiseLobby = async () => {
      const currentPlayer = await loadCurrentPlayer();

      if (!roomId) {
        setPlayers([
          currentPlayer,
          ...createEmptyPlayerSlots(2),
        ]);

        setLoadingPlayers(false);
        return;
      }

      const roomRef = doc(db, 'rooms', roomId);

      unsubscribeRoom = onSnapshot(
        roomRef,
        async (roomSnapshot) => {
          try {
            if (!roomSnapshot.exists()) {
              setPlayers([
                currentPlayer,
                ...createEmptyPlayerSlots(2),
              ]);

              setLoadingPlayers(false);
              return;
            }

            const roomData = roomSnapshot.data();

            const roomPlayers =
              roomData.players ||
              roomData.members ||
              roomData.playerIds ||
              [];

            const loadedPlayers = await loadRoomPlayers(
              roomPlayers,
              currentPlayer
            );

            setPlayers(fillPlayerSlots(loadedPlayers));
          } catch (error) {
            console.log('Room players load error:', error);

            setPlayers([
              currentPlayer,
              ...createEmptyPlayerSlots(2),
            ]);
          } finally {
            setLoadingPlayers(false);
          }
        },
        (error) => {
          console.log('Room listener error:', error);

          setPlayers([
            currentPlayer,
            ...createEmptyPlayerSlots(2),
          ]);

          setLoadingPlayers(false);
        }
      );
    };

    initialiseLobby();

    return () => {
      if (unsubscribeRoom) {
        unsubscribeRoom();
      }
    };
  }, [roomId]);

  const loadCurrentPlayer = async () => {
    const currentUser = auth.currentUser;

    let storedProfile = {};

    try {
      const savedProfile = await AsyncStorage.getItem('userProfile');

      if (savedProfile) {
        storedProfile = JSON.parse(savedProfile);
      }
    } catch (error) {
      console.log('Stored profile load error:', error);
    }

    let firestoreProfile = {};

    if (currentUser?.uid) {
      try {
        const userRef = doc(db, 'users', currentUser.uid);
        const userSnapshot = await getDoc(userRef);

        if (userSnapshot.exists()) {
          firestoreProfile = userSnapshot.data();
        }
      } catch (error) {
        console.log('Current user Firestore load error:', error);
      }
    }

    const username =
      firestoreProfile.username ||
      firestoreProfile.name ||
      firestoreProfile.fullName ||
      storedProfile.username ||
      storedProfile.name ||
      storedProfile.fullName ||
      currentUser?.displayName ||
      currentUser?.email?.split('@')[0] ||
      'Player 1';

    const profileImage =
      firestoreProfile.profileImage ||
      firestoreProfile.photoURL ||
      firestoreProfile.image ||
      firestoreProfile.avatar ||
      storedProfile.profileImage ||
      storedProfile.photoURL ||
      storedProfile.image ||
      storedProfile.avatar ||
      currentUser?.photoURL ||
      null;

    return {
      id: 1,
      uid: currentUser?.uid || 'local-player',
      name: username,
      username,
      photo: profileImage,
      image: profileImage,
      avatar: profileImage,
      status: 'Ready',
      isCurrentUser: true,
      isEmpty: false,
    };
  };

  const loadRoomPlayers = async (
    roomPlayerList,
    currentPlayer
  ) => {
    if (!Array.isArray(roomPlayerList)) {
      return [currentPlayer];
    }

    const resolvedPlayers = await Promise.all(
      roomPlayerList.slice(0, MAX_PLAYERS).map(
        async (roomPlayer, index) => {
          const playerUid =
            typeof roomPlayer === 'string'
              ? roomPlayer
              : roomPlayer?.uid ||
                roomPlayer?.userId ||
                roomPlayer?.id;

          if (
            playerUid &&
            currentPlayer.uid &&
            playerUid === currentPlayer.uid
          ) {
            return {
              ...currentPlayer,
              id: index + 1,
              status:
                roomPlayer?.status ||
                roomPlayer?.readyStatus ||
                'Ready',
            };
          }

          let userData = {};

          if (playerUid) {
            try {
              const userRef = doc(db, 'users', playerUid);
              const userSnapshot = await getDoc(userRef);

              if (userSnapshot.exists()) {
                userData = userSnapshot.data();
              }
            } catch (error) {
              console.log(
                `Player ${playerUid} profile load error:`,
                error
              );
            }
          }

          const playerName =
            userData.username ||
            userData.name ||
            userData.fullName ||
            roomPlayer?.username ||
            roomPlayer?.name ||
            roomPlayer?.fullName ||
            roomPlayer?.email?.split('@')[0] ||
            `Player ${index + 1}`;

          const playerPhoto =
            userData.profileImage ||
            userData.photoURL ||
            userData.image ||
            userData.avatar ||
            roomPlayer?.profileImage ||
            roomPlayer?.photoURL ||
            roomPlayer?.photo ||
            roomPlayer?.image ||
            roomPlayer?.avatar ||
            null;

          return {
            id: index + 1,
            uid: playerUid || `player-${index + 1}`,
            name: playerName,
            username: playerName,
            photo: playerPhoto,
            image: playerPhoto,
            avatar: playerPhoto,
            status:
              roomPlayer?.status ||
              roomPlayer?.readyStatus ||
              'Ready',
            isCurrentUser: false,
            isEmpty: false,
          };
        }
      )
    );

    const currentPlayerExists = resolvedPlayers.some(
      (player) => player.uid === currentPlayer.uid
    );

    if (!currentPlayerExists) {
      resolvedPlayers.unshift(currentPlayer);
    }

    return resolvedPlayers
      .slice(0, MAX_PLAYERS)
      .map((player, index) => ({
        ...player,
        id: index + 1,
      }));
  };

  const createEmptyPlayerSlots = (startingId = 1) => {
    const emptyPlayers = [];

    for (
      let playerId = startingId;
      playerId <= MAX_PLAYERS;
      playerId += 1
    ) {
      emptyPlayers.push({
        id: playerId,
        uid: null,
        name: `Player ${playerId}`,
        username: `Player ${playerId}`,
        photo: null,
        image: null,
        avatar: null,
        status: 'Waiting',
        isCurrentUser: false,
        isEmpty: true,
      });
    }

    return emptyPlayers;
  };

  const fillPlayerSlots = (loadedPlayers) => {
    const validPlayers = loadedPlayers
      .slice(0, MAX_PLAYERS)
      .map((player, index) => ({
        ...player,
        id: index + 1,
      }));

    while (validPlayers.length < MAX_PLAYERS) {
      const playerId = validPlayers.length + 1;

      validPlayers.push({
        id: playerId,
        uid: null,
        name: `Player ${playerId}`,
        username: `Player ${playerId}`,
        photo: null,
        image: null,
        avatar: null,
        status: 'Waiting',
        isCurrentUser: false,
        isEmpty: true,
      });
    }

    return validPlayers;
  };

  const getGameScreenName = () => {
    if (gameType === 1) return 'GameScreen';
    if (gameType === 2) return 'GameScreen2';
    if (gameType === 3) return 'GameScreen3';
    if (gameType === 4) return 'GameScreen4';
    if (gameType === 5) return 'GameScreen5';

    return 'GameScreen';
  };

  const handleInviteFriends = () => {
    if (!roomId) {
      Alert.alert(
        'Room Not Found',
        'Please create an online room first.'
      );
      return;
    }

    navigation.navigate('Friends', {
      roomId,
      gameType,
      inviteMode: true,
    });
  };

  const handleStartGame = () => {
    const actualPlayers = players.filter(
      (player) => !player.isEmpty && player.uid
    );

    if (actualPlayers.length === 0) {
      Alert.alert(
        'Players Not Found',
        'No players were found in this room.'
      );
      return;
    }

    const screenName = getGameScreenName();

    navigation.navigate(screenName, {
      roomId,
      gameType,
      isOnline: true,

      // GameScreen2, 3, 4 ve 5 bu listeyi kullanacak.
      players,

      // Gerçek oyuncular ayrıca burada tutuluyor.
      activePlayers: actualPlayers,
    });
  };

  const renderPlayer = ({ item }) => {
    const profilePhoto =
      item.photo ||
      item.profileImage ||
      item.image ||
      item.avatar ||
      null;

    const firstLetter =
      item.name && item.name.length > 0
        ? item.name.charAt(0).toUpperCase()
        : 'P';

    return (
      <View style={styles.playerRow}>
        {profilePhoto ? (
          <Image
            source={{ uri: profilePhoto }}
            style={styles.avatarImage}
          />
        ) : (
          <View
            style={[
              styles.avatar,
              item.isEmpty && styles.emptyAvatar,
            ]}
          >
            <Text
              style={[
                styles.avatarText,
                item.isEmpty && styles.emptyAvatarText,
              ]}
            >
              {firstLetter}
            </Text>
          </View>
        )}

        <View style={styles.playerDetails}>
          <Text
            style={[
              styles.playerName,
              item.isEmpty && styles.emptyPlayerName,
            ]}
            numberOfLines={1}
          >
            {item.name}
            {item.isCurrentUser ? ' (You)' : ''}
          </Text>

          <Text
            style={[
              styles.status,
              item.status === 'Ready'
                ? styles.readyStatus
                : styles.waitingStatus,
            ]}
          >
            {item.status}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <LinearGradient
      colors={['#00c6ff', '#0072ff', '#000']}
      style={styles.container}
    >
      <Text style={styles.title}>Online Players</Text>

      <Text style={styles.subtitle}>
        Game Type {gameType}
      </Text>

      {roomId ? (
        <Text style={styles.roomIdText}>
          Room ID: {roomId}
        </Text>
      ) : null}

      <View style={styles.card}>
        {loadingPlayers ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#ffffff" />

            <Text style={styles.loadingText}>
              Loading players...
            </Text>
          </View>
        ) : (
          <FlatList
            data={players}
            keyExtractor={(item) =>
              item.uid
                ? `${item.uid}-${item.id}`
                : `empty-${item.id}`
            }
            renderItem={renderPlayer}
            scrollEnabled={false}
          />
        )}

        <TouchableOpacity
          style={styles.inviteButton}
          onPress={handleInviteFriends}
          disabled={loadingPlayers}
        >
          <Text style={styles.inviteText}>
            Invite Friends
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[
          styles.startButton,
          loadingPlayers && styles.disabledButton,
        ]}
        onPress={handleStartGame}
        disabled={loadingPlayers}
      >
        <Text style={styles.startText}>
          Start Game
        </Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 25,
    justifyContent: 'center',
  },

  title: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },

  subtitle: {
    fontSize: 18,
    color: '#dbeafe',
    textAlign: 'center',
    marginBottom: 8,
  },

  roomIdText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 12,
    marginBottom: 18,
    opacity: 0.85,
  },

  card: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 25,
    padding: 20,
    marginBottom: 30,
  },

  loadingContainer: {
    minHeight: 250,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    color: '#fff',
    fontSize: 15,
    marginTop: 12,
  },

  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.2)',
  },

  playerDetails: {
    flex: 1,
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    borderWidth: 2,
    borderColor: '#fff',
  },

  emptyAvatar: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderColor: 'rgba(255,255,255,0.45)',
  },

  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 15,
    borderWidth: 2,
    borderColor: '#fff',
  },

  avatarText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0072ff',
  },

  emptyAvatarText: {
    color: 'rgba(255,255,255,0.7)',
  },

  playerName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },

  emptyPlayerName: {
    color: 'rgba(255,255,255,0.6)',
  },

  status: {
    fontSize: 14,
    marginTop: 2,
  },

  readyStatus: {
    color: '#86efac',
  },

  waitingStatus: {
    color: '#dbeafe',
  },

  inviteButton: {
    backgroundColor: '#1abc9c',
    paddingVertical: 14,
    borderRadius: 22,
    alignItems: 'center',
    marginTop: 18,
  },

  inviteText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  startButton: {
    backgroundColor: '#22c55e',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
  },

  disabledButton: {
    opacity: 0.55,
  },

  startText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});