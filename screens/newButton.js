import React from "react";
import { View, Button, StyleSheet } from "react-native";

const AppButton = props => {
  return (
    <View style={styles.screenContainer}>
      <Button title="Next Number" />
    </View>
  );
};

const styles = StyleSheet.create({
    
    appButtonContainer: {
      elevation: 8,
      backgroundColor: "#009688",
      borderRadius: 15,
      paddingVertical: 10,
      paddingHorizontal: 12
    },
    appButtonText: {
      fontSize: 30,
      color: "#fff",
      fontWeight: "bold",
      alignSelf: "center",
      textTransform: "uppercase"
    }
    
   
  });

export default AppButton;