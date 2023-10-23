import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import LottieView from 'lottie-react-native';
import { useFocusEffect } from '@react-navigation/native';

const Settings = ({ navigation }) => {


    const [isLoading, setIsLoading] = useState(true);

    useFocusEffect(
        React.useCallback(() => {
            const load = setTimeout(() => {
                setIsLoading(false);
            }, 3000);

            return () => clearTimeout(load);
        }, [navigation])
    );

    return ((!isLoading) ? (
        <View style={styles.container}>
            <Text style={styles.text}>
                Welcome to Settings
            </Text>



        </View>) : (
        <>
            <View style={styles.container}>
                <LottieView style={styles.animation} source={require("../assets/animations/loadingFour.json")}
                    autoPlay={true} loop={true} />
            </View>
        </>
    )
    );

}

const styles = {
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    animation: {
        flex:1,
        height: 300,
        width: 300,
        justifyContent: 'center',
        alignItems: 'center'
    }



}

export default Settings;