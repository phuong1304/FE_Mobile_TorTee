// CustomTabIcon.js
import React, { useCallback, useState } from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const CustomTabIcon = ({ name, color, size, favorites }) => {
  return (
    <View>
      <Ionicons name={name} size={size} color={color} />
      {favorites.length > 0 && (
        <View
          style={{
            position: "absolute",
            right: -6,
            top: -3,
            backgroundColor: "red",
            borderRadius: 6,
            width: 12,
            height: 12,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text style={{ color: "white", fontSize: 10 }}>
            {favorites.length}
          </Text>
        </View>
      )}
    </View>
  );
};

export default CustomTabIcon;
