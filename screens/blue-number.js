import { Text, View, Animated } from 'react-native';
import { useEffect, useState } from 'react';

export default function BlueNumber(props) {
    const [fadeAnim] = useState(new Animated.Value(0));

    useEffect(() => {
        Animated.timing(
          fadeAnim,
          {
            toValue: 1,
            duration: 5000,
            useNativeDriver: true
          }
        ).start();
      }, [props.number])

    return (
        <Animated.View
            style={{...props.style, opacity: fadeAnim,
            }}
        >
            <Text>{props.number}</Text>
        </Animated.View>

    );
}