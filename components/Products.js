import {
  View,
  Text,
  Image,
  FlatList,
  Pressable,
  Alert,
  TouchableOpacity,
  Modal,
  Dimensions,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { baseURL } from "../constants/api";
import { TextInput } from "react-native-gesture-handler";

const { width } = Dimensions.get("window");
const itemWidth = (width - 30) / 2; // Adjust based on your desired spacing

const Item = ({ item, isFavorite, saveToFavorites, removeFromFavorites }) => {
  const navigation = useNavigation();
  // Tính averageRating
  const ratings = item.feedbacks.map((feedback) => feedback.rating);
  const sumRatings = ratings.reduce((total, rating) => total + rating, 0);
  const averageRating = ratings.length > 0 ? sumRatings / ratings.length : 0;

  // Function to render stars based on average rating
  const renderRatingStars = (averageRating) => {
    const stars = [];
    const roundedRating = Math.round(averageRating);
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= roundedRating ? "star" : "star-outline"}
          size={20}
          color={i <= roundedRating ? "gold" : "black"}
          style={{ marginRight: 2 }}
        />
      );
    }
    return stars;
  };

  return (
    <TouchableOpacity
      onPress={() => navigation.navigate("Detail", { product: item })}
      style={{
        width: itemWidth,
        margin: 5,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        overflow: "hidden",
        backgroundColor: "white",
      }}
    >
      <View
        style={{
          position: "relative",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "white",
        }}
      >
        <Image
          style={{ width: "80%", height: itemWidth, alignSelf: "center" }}
          source={{ uri: item.image }}
        />
        <TouchableOpacity
          style={{ position: "absolute", top: 10, right: 10 }}
          onPress={() =>
            isFavorite ? removeFromFavorites(item.id) : saveToFavorites(item)
          }
        >
          <Ionicons
            name={isFavorite ? "heart" : "heart-outline"}
            size={24}
            color="red"
          />
        </TouchableOpacity>
      </View>
      <View style={{ padding: 10 }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Ionicons name="star" size={16} color="gold" />
          <Text style={{ marginLeft: 5 }}>{averageRating.toFixed(1)}</Text>
        </View>
        <Text style={{ fontSize: 18, fontWeight: "bold" }}>
          {item.perfumeName}
        </Text>
        <Text style={{ fontSize: 14, color: "#666" }}>{item.company}</Text>
        <Text style={{ fontSize: 16, color: "green" }}>${item.price}</Text>
      </View>
    </TouchableOpacity>
  );
};
const Perfumes = ({ navigation }) => {
  const [perfumes, setPerfumes] = useState([]);
  const [perfumesDislay, setPerfumesDisplay] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [company, setCompany] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [showCompanyList, setShowCompanyList] = useState(false);
  const [showPriceList, setShowPriceList] = useState(false);
  const [titleName, setTitleName] = useState("All Perfumes");
  const [searchText, setSearchText] = useState("");

  const fetchPerfumes = async () => {
    return axios.get(baseURL + "/product");
  };

  const getFavorites = async () => {
    try {
      const value = await AsyncStorage.getItem("favorites");
      if (value !== null) {
        setFavorites(JSON.parse(value));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const renderItem = ({ item }) => {
    const isFavorite = favorites.some(
      (favoriteItem) => favoriteItem.id === item.id
    );
    return (
      <Item
        item={item}
        isFavorite={isFavorite}
        saveToFavorites={saveToFavorites}
        removeFromFavorites={removeFromFavorites}
      />
    );
  };

  const saveToFavorites = async (item) => {
    try {
      const favorites =
        JSON.parse(await AsyncStorage.getItem("favorites")) || [];
      const updatedFavorites = [...favorites, item];
      await AsyncStorage.setItem("favorites", JSON.stringify(updatedFavorites));
      Alert.alert("Success", "Item added to favorites!");
      getFavorites();
    } catch (error) {
      Alert.alert("Error", "Failed to add item to favorites.");
    }
  };

  const removeFromFavorites = async (id) => {
    const updatedFavorites = favorites.filter((item) => item.id !== id);
    setFavorites(updatedFavorites);
    try {
      await AsyncStorage.setItem("favorites", JSON.stringify(updatedFavorites));
      Alert.alert("Success", "Item removed from favorites!");
      getFavorites();
    } catch (error) {
      console.error(e);
    }
  };

  const handleFilter = () => {
    setModalVisible(!modalVisible);
  };

  const handleCompanyClick = () => {
    setShowCompanyList(!showCompanyList);
    setShowPriceList(false);
  };

  const handlePricePress = () => {
    setShowPriceList(true);
  };

  const setAllPerfumes = () => {
    setPerfumesDisplay(perfumes);
    setModalVisible(false);
    setTitleName("All Perfumes");
  };

  const filterByCompany = (company) => {
    const filteredPerfumes = perfumes.filter(
      (perfume) => perfume.company === company
    );
    setPerfumesDisplay(filteredPerfumes);
    setTitleName("Perfumes of " + company);
    setShowCompanyList(false);
    setModalVisible(false);
  };

  const filterByPrice = (min, max) => {
    const numMin = Number(min);
    const numMax = Number(max);
    const filteredPerfumes = perfumes.filter((perfume) => {
      const numPrice = Number(perfume.price);
      return numPrice >= numMin && numPrice <= numMax;
    });
    setPerfumesDisplay(filteredPerfumes);
    if (min === 200) {
      setTitleName("Perfumes over $200");
    } else {
      setTitleName("Perfumes in price $" + min + " and $" + max);
    }

    setShowPriceList(false);
    setModalVisible(false);
  };

  const handleSearch = (text) => {
    setSearchText(text);
    const filteredPerfumes = perfumes.filter((perfume) =>
      perfume.perfumeName.toLowerCase().includes(text.toLowerCase())
    );
    setPerfumesDisplay(filteredPerfumes);
  };

  useFocusEffect(
    useCallback(() => {
      getFavorites();

      fetchPerfumes().then((response) => {
        setTitleName("All Perfumes");
        setPerfumes(response.data);
        setPerfumesDisplay(response.data);
      });
    }, [])
  );

  useEffect(() => {
    const companies = [...new Set(perfumes.map((item) => item.company))];
    setCompany((prev) => setCompany(companies));
  }, [perfumes]);

  return (
    <View style={{ flex: 1, padding: 10 }}>
      <TextInput
        style={{
          height: 100,
          borderColor: "gray",
          borderWidth: 1,
          borderRadius: 5,
          marginBottom: 10,
          paddingLeft: 10,
        }}
        placeholder="Search by product name"
        value={searchText}
        onChangeText={handleSearch}
      />
      <FlatList
        data={perfumesDislay}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: "space-between" }}
      />
    </View>
  );
};

export default Perfumes;
