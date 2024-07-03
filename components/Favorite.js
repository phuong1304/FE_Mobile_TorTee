import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  Alert,
  FlatList,
  Pressable,
  Image,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Button, Dialog, Portal, Provider } from "react-native-paper";
import { baseURL } from "../constants/api";

const Item = ({ item, removeFromFavorites }) => {
  const navigation = useNavigation();

  const navigateToDetail = () => {
    navigation.navigate("Detail", { product: item, nav: "Favorite" });
  };

  return (
    <Pressable onPress={navigateToDetail} style={styles.itemContainer}>
      <Image style={styles.itemImage} source={{ uri: item.image }} />
      <View style={styles.itemDetails}>
        <View style={styles.itemHeader}>
          <Text style={styles.itemName}>{item.perfumeName}</Text>
          <Pressable
            onPress={() => removeFromFavorites(item.id)}
            style={styles.removeButton}
          >
            <Ionicons name="trash" size={20} color="red" />
          </Pressable>
        </View>
        <View style={styles.itemRow}>
          <Text style={styles.itemCompany}>{item.company}</Text>
          <Text style={styles.itemPrice}>${item.price}</Text>
        </View>
      </View>
    </Pressable>
  );
};
const Favorite = ({ navigation }) => {
  const [favorites, setFavorites] = useState([]);
  const [visible, setVisible] = useState(false);

  const fetchFavorites = useCallback(async () => {
    try {
      const favoritesSto = JSON.parse(await AsyncStorage.getItem("favorites"));
      if (favoritesSto) {
        const updatedFavorites = await Promise.all(
          favoritesSto.map(async (item) => {
            const response = await fetch(`${baseURL}/product/${item.id}`);
            if (response.ok) {
              const product = await response.json();
              return product;
            } else {
              return null;
            }
          })
        );
        const validFavorites = updatedFavorites.filter((item) => item !== null);
        setFavorites(validFavorites);
        await AsyncStorage.setItem("favorites", JSON.stringify(validFavorites));
      } else {
        setFavorites([]);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to fetch favorites.");
    }
  }, []);

  const removeFromFavorites = async (id) => {
    const updatedFavorites = favorites.filter((item) => item.id !== id);
    setFavorites(updatedFavorites);
    try {
      await AsyncStorage.setItem("favorites", JSON.stringify(updatedFavorites));
      Alert.alert("Success", "Item removed from favorites!");
    } catch (error) {
      Alert.alert("Error", "Failed to remove item from favorites.");
    }
  };

  const clearAllFavorites = async () => {
    setFavorites([]);
    try {
      await AsyncStorage.setItem("favorites", JSON.stringify([]));
      Alert.alert("Success", "All favorites removed!");
    } catch (error) {
      Alert.alert("Error", "Failed to clear favorites.");
    }
  };

  const showDialog = () => setVisible(true);
  const hideDialog = () => setVisible(false);

  const confirmRemoveAllFavorites = () => {
    clearAllFavorites();
    hideDialog();
  };

  useFocusEffect(
    useCallback(() => {
      fetchFavorites();
    }, [fetchFavorites])
  );

  useEffect(() => {
    if (favorites.length > 0) {
      navigation.setOptions({
        headerRight: () => (
          <Pressable
            disabled={favorites.length === 0}
            onPress={showDialog}
            style={styles.clearButton}
          >
            <Ionicons name="trash" size={20} color="black" />
          </Pressable>
        ),
      });
    }
  }, [navigation, favorites]);

  const renderItem = ({ item }) => (
    <Item
      item={item}
      removeFromFavorites={() => removeFromFavorites(item.id)}
      navigation={navigation}
    />
  );

  return (
    <Provider>
      <View style={{ flex: 1, padding: 10, ...styles.container }}>
        {favorites.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Favorites List is Empty</Text>
          </View>
        ) : (
          <FlatList
            data={favorites}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
          />
        )}
      </View>
      <Portal>
        <Dialog visible={visible} onDismiss={hideDialog}>
          <Dialog.Title>Remove All Favorites</Dialog.Title>
          <Dialog.Content>
            <Text>Are you sure you want to remove all favorites?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={hideDialog}>Cancel</Button>
            <Button onPress={confirmRemoveAllFavorites}>OK</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "gray",
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  itemImage: {
    width: 60,
    height: 80,
    marginRight: 10,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemCompany: {
    fontSize: 14,
    color: "gray",
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "green",
  },
  favoriteButton: {
    marginLeft: "auto",
  },
  clearButton: {
    marginRight: 10,
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  itemImage: {
    width: 60,
    height: 80,
    marginRight: 10,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemCompany: {
    fontSize: 14,
    color: "gray",
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "green",
  },
  removeButton: {
    marginTop: 10,
    alignItems: "flex-end",
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});

export default Favorite;
