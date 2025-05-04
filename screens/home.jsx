import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Button } from 'react-native-paper';
import LottieView from 'lottie-react-native';
import { LinearGradient } from 'expo-linear-gradient'; // Linear Gradient modülünü ekliyoruz
import { useFocusEffect } from '@react-navigation/core';

const Home = ({ navigation }) => {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const load = setTimeout(() => {
            setIsLoading(false); // 3 saniye sonra yüklemeyi bitir
        }, 4000); // Animasyonun daha uzun görünmesi için 4 saniye

        return () => clearTimeout(load); // Temizleme
    }, []);

    const playGame = () => {
        navigation.navigate('game');
    };

    return (
        (!isLoading) ? (
            <LinearGradient
                colors={['#000000', '#2c3e50']} // Siyah ve koyu gri gradient
                style={styles.container}
            >
                <Text style={styles.text}>
                    Welcome to Trio
                </Text>

                <Pressable style={styles.button} onPress={playGame}>
                    <Text style={styles.buttonText}>Play</Text>
                </Pressable>
            </LinearGradient>
        ) : (
            <View style={styles.container}>
                <LottieView
                    style={styles.animation}
                    source={require("../assets/animations/modernLoader.json")} // Animasyon dosyasını kullanıyoruz
                    autoPlay={true}
                    loop={true}
                />
            </View>
        )
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000', // Siyah arka plan
    },
    text: {
        color: '#fff', // Beyaz yazı
        fontSize: 40, // Büyük yazı boyutu
        fontWeight: 'bold',
        textAlign: 'center',
        textShadowColor: '#000',
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 10, // Gölge efekti
        marginBottom: 30, // Alt margin
    },
    button: {
        backgroundColor: '#FF6F61', // Canlı bir renk buton
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 30,
        shadowColor: '#000', // Siyah gölge
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
        transform: [{ scale: 1.1 }],
    },
    buttonText: {
        color: '#fff', // Beyaz yazı
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    animation: {
        height: 400,
        width: 300,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default Home;
