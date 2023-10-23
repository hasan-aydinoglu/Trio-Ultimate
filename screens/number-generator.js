import { setStatusBarBackgroundColor } from 'expo-status-bar';
import React from 'react';
import { Text, View, StyleSheet, Pressable, TouchableHighlight } from 'react-native';

export default function NumberGenerator(props) {
  const { number, color } = props;

  return (
<View style={styles.button}>
  <View style={styles.number} >
    <Pressable style={({ pressed }) => [
        {backgroundColor: pressed ?  'white' : 'silver' }
         ]} onPress={props.onPress}>
      <Text >Next Number</Text>
    </Pressable>
    </View>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    marginTop: 50,
    
  },
  number: {
    backgroundColor: "silver",
    display: "flex",
    alignItems: 'center',
    justifyContent: 'left',
    paddingVertical: 20,
    paddingHorizontal: 9,
   
    
  }
});