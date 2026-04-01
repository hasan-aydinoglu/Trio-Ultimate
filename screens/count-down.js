import { Text, View } from 'react-native';
import { useState, useEffect } from 'react';
import CountDown from 'react-native-countdown-component';
import moment from 'moment';

const Timer = ({ seconds }) => {
  
  const [timeLeft, setTimeLeft] = useState(60);

  useEffect(() => {
   
    if (!timeLeft) return;

   
    const intervalId = setInterval(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    
    return () => clearInterval(intervalId);
    
  }, [timeLeft]);

  return (
    <View>
      <Text>{timeLeft}</Text>
    </View>
  );
};
export default Timer ;