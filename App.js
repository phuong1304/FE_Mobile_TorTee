import { Ionicons } from "@expo/vector-icons";
import { NavigationContainer, useFocusEffect } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React, { useCallback, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Favorite from "./components/Favorite";
import Perfumes from "./components/Products";
import Detail from "./components/ProductDetail";
import CustomTabIcon from "./components/navigation/TabBarIcon";
import WelcomeScreen from "./components/Welcome";
import { createDrawerNavigator } from "@react-navigation/drawer";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

function MainTabs({ navigation }) {
  const [favorites, setFavorites] = useState([]);

  console.log("navigation", navigation);
  const fetchFavorites = useCallback(async () => {
    try {
      const favoritesSto = await AsyncStorage.getItem("favorites");
      if (favoritesSto !== null) {
        setFavorites(JSON.parse(favoritesSto));
      }
    } catch (error) {
      Alert.alert("Error", "Failed to fetch favorites.");
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchFavorites();
    }, [fetchFavorites])
  );

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          size = 20;
          if (route.name === "Perfumes") {
            iconName = focused ? "list" : "list-outline";
            return <Ionicons name={iconName} size={size} color={color} />;
          } else if (route.name === "Favorite") {
            iconName = focused ? "heart" : "heart-outline";
            return (
              <CustomTabIcon
                name={iconName}
                color={color}
                size={size}
                favorites={favorites}
              />
            );
          }
        },
        tabBarActiveTintColor: "tomato",
        tabBarInactiveTintColor: "gray",
        tabBarLabelStyle: { fontSize: 14, paddingBottom: 4 },
        tabBarStyle: {
          height: 60,
          paddingBottom: 5,
        },
      })}
    >
      <Tab.Screen name="Perfumes" component={Perfumes} />
      <Tab.Screen name="Favorite" component={Favorite} />
    </Tab.Navigator>
  );
}

function DrawerNavigator() {
  return (
    <Drawer.Navigator>
      <Drawer.Screen
        name="Home"
        component={Perfumes}
        options={{ title: "Home" }}
      />
      <Drawer.Screen
        name="Favorite"
        component={Favorite}
        options={{ title: "Favorite" }}
      />
      {/* Add more drawer screens as needed */}
    </Drawer.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Welcome"
          component={WelcomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Main"
          component={MainTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Detail"
          component={Detail}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
