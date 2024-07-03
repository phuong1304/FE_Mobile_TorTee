import React, { useEffect } from "react";
import {
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";

function WelcomeScreen({ navigation }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.navigate("Main");
    }, 2100);
    return () => clearTimeout(timer); // This will clear the timer when the component is unmounted
  }, [navigation]);
  return (
    <ImageBackground
      className="flex-1 justify-end items-center w-full"
      source={{
        uri: "https://images.pexels.com/photos/4998009/pexels-photo-4998009.jpeg",
      }}
    >
      {/* <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("Main")}
      >
        <Text style={styles.buttonText}>Go to Shopping</Text>
      </TouchableOpacity> */}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    padding: 10,
    marginBottom: 40,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 5,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
  },
});

export default WelcomeScreen;
