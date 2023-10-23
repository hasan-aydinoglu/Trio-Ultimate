import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Button } from 'react-native-paper';
import LottieView from 'lottie-react-native';
import { useFocusEffect } from '@react-navigation/core';

const Home = ({ navigation }) => {

    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const load = setTimeout(() => {
            setIsLoading(false);
        }, 3000);

        return () => clearTimeout(load);
    }, [])

    const playGame = () => {
        navigation.navigate('game');
    }

    return ((!isLoading) ? (
        <View style={styles.container}>
            <Text style={styles.text}>
                Welcome to Trio
            </Text>

            <Button padding={15} icon="cards-club" mode="contained" onPress={playGame}>
                Play
            </Button>

        </View>) : (
            <View style={styles.container}>
                <LottieView style={styles.animation} source={require("../assets/animations/loading.json")}
                    autoPlay={true} loop={true} />
            </View>
    )
    );

}


const styles = {

    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    text: {
        color: 'black',
        fontSize: 30,
    },
    animation: {
        height: 400,
        width: 300,
        justifyContent: 'center',
        alignItems: 'center'
    }
}

export default Home;
