import React from 'react';
import { Text, View, StyleSheet, Pressable } from 'react-native';

export default function NumberButton(props) {
  const { onPress, number, color } = props;
  
  return (
    <Pressable style=
      {({ pressed }) => [
        pressed ? styles(props).button_pressed : styles(props).button
         ]}
      onPress={onPress}>
      <Text adjustsFontSizeToFit={true} numberOfLines={1} style={styles(props).text}>{number}</Text>
    </Pressable>
  );
}

const styles = (props) => StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'left',
    padding: 15,
    borderRadius: 10,
    //elevation: 3,
    backgroundColor: props.color,
  },
  button_pressed: {
    alignItems: 'center',
    justifyContent: 'left',
    padding: 15,
    borderRadius: 10,
    elevation: 3,
    backgroundColor: 'white',
  },
  text: {
    fontSize: 20,
    alignItems: 'center',
    //lineHeight: 18,
    //fontWeight: 'bold',
    letterSpacing: 0.25,
    color: 'black',
    
  },
});

