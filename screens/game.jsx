import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button, ScrollView, SafeAreaView, Pressable } from 'react-native';
import NumberButton from './number-button';
import NumberGenerator from './number-generator';
import { useState, useEffect } from 'react';
import BlueNumber from './blue-number';
import generateNumbers from './generate-numbers';
import Countdown from './count-down';
import TrioTable from './trio-table';
import generateTableNumbers from './generate-table-numbers';
import embedBlueSolution from './embed-blue-solution';
import solutions from './solutions';
import { GestureHandlerRootView, PanGestureHandler } from 'react-native-gesture-handler';
import Animated, { useAnimatedGestureHandler } from 'react-native-reanimated';
import Timer from './count-down';
import LottieView from 'lottie-react-native';

export default function Game({ navigation }) {
    const numbers = [3, 7, 3, 5, 8, 4, 9, 5, 1, 8, 6, 5, 2, 7, 8, 6, 2, 4, 9, 1, 9, 2, 6, 4, 7, 5, 5, 3, 7, 4, 3, 2, 1, 6, 3, 2, 1, 4, 8, 3, 9, 5, 1, 8, 6, 7, 2, 4, 6];

    const [showBlueNumber, setShowBlueNumber] = useState(true);
    const [currentNumber, setCurrentNumber] = useState("Start");
    const [usedNumbers, setUsedNumbers] = useState([]);
    const [generatedNumbers, setGeneratedNumbers] = useState(generateNumbers());
    const [tableNumbers, setTableNumbers] = useState([[], [], [], [], [], [], []]);
    const [blueNumbersArray, setBlueNumbersArray] = useState(solutions());
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let array = [[], [], [], [], [], [], []];
        for (let i = 0; i < 7; i++) {
            const tableArray = generateTableNumbers();
            array[i] = tableArray;
        }
        setTableNumbers(array);
        navigation.getParent()?.setOptions({
            tabBarStyle: {
                display: "none"
            }
        });

        const load = setTimeout(() => {
            setIsLoading(false);
        }, 3000);

        return () => {
            navigation.getParent()?.setOptions({
                tabBarStyle: undefined
            });
            clearTimeout(load);
        }
    }, [navigation]);



    const pressNextNumber = () => {

        let curNumber = currentNumber;
        if (generatedNumbers && generatedNumbers.length !== 0) {

            setShowBlueNumber(true);
            curNumber = generatedNumbers.pop();
            setCurrentNumber(curNumber);
            setUsedNumbers(...usedNumbers, currentNumber);
            console.log(currentNumber);
        } else {
            setCurrentNumber("Game finished");
        }

        let array = [[], [], [], [], [], [], []];
        for (let i = 0; i < 7; i++) {
            const tableArray = generateTableNumbers();
            array[i] = tableArray;
        }

        if (blueNumbersArray.length >= curNumber) {
            console.log("Current number: ", curNumber);
            const arrayWithSolution = embedBlueSolution(array, blueNumbersArray[curNumber - 1]);
            setTableNumbers(arrayWithSolution);
        } else {
            setTableNumbers(array);
        }
    }

    const handleGesture = (evt) => {
        let { nativeEvent } = evt
        console.log(nativeEvent)
    }

    return ((!isLoading) ? (
        <GestureHandlerRootView style={{ flex: 1 }}>{
            <View>
                <View style={styles.numberGenerator}>
                    <NumberGenerator onPress={pressNextNumber} />
                </View>
                {showBlueNumber ?
                    <View style={styles.next} >
                        <View>
                            <BlueNumber number={currentNumber} />
                        </View>

                    </View>

                    : ''}

                <View style={styles.timer}>
                    <Timer />
                </View>

                <PanGestureHandler onGestureEvent={handleGesture}>

                    <View>
                        <TrioTable tableData={tableNumbers} />
                    </View>
                </PanGestureHandler>
            </View>
        }</GestureHandlerRootView>) :
        (<View style={{ flex: 1 }}>
            <View style={styles.container}>
                <LottieView style={styles.containerAnimation} source={require("../assets/animations/loadingTwo.json")}
                    autoPlay={true} loop={true} />
            </View></View>)




    )
};


const styles = StyleSheet.create({
    buttonContainer: {
        margin: 1,
        flex: 10,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        flexWrap: 'wrap',
        display: 'flex',
    },

    titleContainer: {
        margin: 10,
        flex: 0,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'left',
    },

    container: {
        marginLeft: 2,
        marginRight: 2,
        flex: 2,
        backgroundColor: '#fff',
        // alignItems: 'center',
        justifyContent: 'left',

    },
    next: {
        backgroundColor: "red",
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'left',
        paddingVertical: 20,
        paddingHorizontal: 20,
        //borderRadius: 120,
        marginLeft: 150,
        marginRight: 150,
        borderBottomColor: 'white',
        marginBottom: 20



    },

    row: {
        margin: 1,
        fontSize: 55,

    },
    numberGenerator: {
        marginBottom: 10
    },
    timer: {
        alignItems: 'center',
        display: 'flex',
        justifyContent: 'left',
        backgroundColor: "red",
        paddingVertical: 20,
        paddingHorizontal: 20,
        marginLeft: 150,
        marginRight: 150,

    },
    animation: {
        height: 400,
        width: 300,
        justifyContent: 'center',
        alignItems: 'center'
    },
    containerAnimation: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    }

});