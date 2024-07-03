import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ScrollView, TextInput } from "react-native-gesture-handler";
import { baseURL } from "../constants/api";
import axios from "axios";
import FeedbackInput from "./FeedbackInput";
import { Ionicons } from "react-native-vector-icons";
import { format, isValid } from "date-fns";

const formatDateTime = (dateString) => {
  const date = new Date(dateString);
  if (!isValid(date)) {
    return "Invalid Date";
  }
  return format(date, "dd/MM/yyyy hh:mm:ss a");
};

const Detail = () => {
  const route = useRoute();
  const { product } = route.params || {};
  const navigation = useNavigation();

  const [feedbacks, setFeedbacks] = useState(product?.feedbacks || []);
  const [feedbacksToShow, setFeedbacksToShow] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [option, setOption] = useState("");
  const [averageStar, setAverageStar] = useState(0);
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(0);
  const [ratingCounts, setRatingCounts] = useState({
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0,
  });

  const handleBack = () => {
    navigation.goBack();
  };

  useEffect(() => {
    const counts = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    };

    feedbacks.forEach((feedback) => {
      counts[feedback.rating] += 1;
    });

    setRatingCounts(counts);
  }, [feedbacks]);

  const fetchFavorites = async () => {
    try {
      const favoritesSto = JSON.parse(await AsyncStorage.getItem("favorites"));
      setFavorites(favoritesSto);
    } catch (error) {
      Alert.alert("Error", "Failed to fetch favorites.");
    }
  };

  const checkIsFavorited = (favoriteList) => {
    return favoriteList?.some((favorite) => favorite.id === product.id);
  };

  const saveToFavorites = async (item) => {
    try {
      const favorites =
        JSON.parse(await AsyncStorage.getItem("favorites")) || [];
      const updatedFavorites = [...favorites, item];
      await AsyncStorage.setItem("favorites", JSON.stringify(updatedFavorites));
      Alert.alert("Success", "Item added to favorites!");
      fetchFavorites();
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
    } catch (error) {
      console.error(error);
    }
  };

  const averageStarCal = (feedbacks) => {
    if (feedbacks.length === 0) return 0;
    const totalStars = feedbacks.reduce(
      (acc, feedback) => acc + feedback.rating,
      0
    );
    return totalStars / feedbacks.length;
  };

  useEffect(() => {
    setFeedbacks(product?.feedbacks);
    setFeedbacksToShow(product?.feedbacks);
    setAverageStar(averageStarCal(product?.feedbacks));
    fetchFavorites();
  }, [product]);

  useEffect(() => {
    checkIsFavorited(favorites) ? setIsFavorite(true) : setIsFavorite(false);
  }, [favorites]);

  const handleFavoriteToggle = () => {
    if (isFavorite) {
      removeFromFavorites(product.id);
    } else {
      saveToFavorites(product);
    }
  };

  const renderFeedbackItem = ({ item }) => (
    <View style={styles.feedbackItem}>
      <Text style={styles.feedbackAuthor}>{item.author}</Text>
      <Text style={styles.feedbackComment}>{item.comment}</Text>
      <Text style={styles.feedbackRating}>Rating: {item.rating}/5</Text>
    </View>
  );

  if (!product) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Product not found</Text>
      </View>
    );
  }

  const addFeedback = (newFeedback) => {
    // Update feedbacks state with the new feedback
    setFeedbacks([...feedbacks, newFeedback]);
    setFeedbacksToShow([...feedbacks, newFeedback]); // Update shown feedbacks (if needed)
  };

  const handleRatingTabPress = (selectedRating) => {
    setOption(selectedRating);
    if (selectedRating === "0") {
      setFeedbacksToShow(feedbacks);
    } else {
      const filteredFeedbacks = feedbacks.filter(
        (feedback) => feedback.rating === parseInt(selectedRating)
      );
      setFeedbacksToShow(filteredFeedbacks);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity onPress={handleBack} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>
      <Text style={styles.headerText}>Perfumes Detail</Text>

      {/* Product Image and Info */}
      <Image style={styles.image} source={{ uri: product.image }} />
      <View style={styles.productContainer}>
        <View style={styles.infoContainer}>
          <Text style={styles.productName}>{product.perfumeName}</Text>
          <Text style={styles.company}>{product.company}</Text>
          <Text style={styles.price}>${product.price}</Text>
          <Text style={styles.description}>{product.perfumeDescription}</Text>
          <TouchableOpacity
            onPress={handleFavoriteToggle}
            style={styles.favoriteButton}
          >
            <Ionicons
              name={isFavorite ? "heart" : "heart-outline"}
              size={24}
              color="red"
            />
          </TouchableOpacity>
          <Text style={styles.averageRating}>
            Average Rating: {averageStar.toFixed(1)}/5
          </Text>
        </View>
      </View>

      {/* Feedback Input */}
      <FeedbackInput
        productId={product.id}
        product={product}
        onAddFeedback={addFeedback}
      />

      <View style={styles.ratingTabs}>
        {[5, 4, 3, 2, 1].map((rating) => (
          <TouchableOpacity
            key={rating}
            style={[
              styles.ratingTab,
              option === rating.toString() && styles.activeRatingTab,
            ]}
            onPress={() => handleRatingTabPress(rating.toString())}
          >
            <Text> {rating} </Text>
            <Ionicons name={"star"} size={20} color={"gold"} />{" "}
            <Text>({ratingCounts[rating]})</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Feedback Section */}
      <View style={styles.feedbackContainer}>
        <Text style={styles.feedbackTitle}>Feedbacks:</Text>
        <FlatList
          data={feedbacksToShow}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={styles.feedbackItem}>
              <Text style={styles.feedbackRating}>
                {formatDateTime(item?.date)}
              </Text>
              <Text style={styles.feedbackAuthor}>{item.author}</Text>
              <Text style={styles.feedbackComment}>{item.comment}</Text>
              <Text style={styles.feedbackRating}>Rating: {item.rating}/5</Text>
            </View>
          )}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  feedbackRating: {
    fontSize: 16,
    color: "#000",
  },
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "#fff",
  },
  backButton: {
    position: "absolute",
    top: 10,
    left: 10,
    zIndex: 1,
  },
  headerText: {
    textAlign: "center",
    fontSize: 20,
    fontWeight: 600,
    marginTop: 20,
    marginBottom: 10,
  },
  productContainer: {
    flexDirection: "row",
    marginBottom: 20,
  },
  image: {
    width: "70%",
    height: 380,
    margin: "auto",
  },
  infoContainer: {
    flex: 1,
  },
  productName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    width: "85%",
  },
  company: {
    fontSize: 16,
    marginBottom: 5,
  },
  price: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: "bold",
  },
  description: {
    fontSize: 14,
    marginBottom: 10,
  },
  favoriteButton: {
    position: "absolute",
    top: 10,
    right: 10,
  },
  averageRating: {
    fontSize: 14,
    marginTop: 5,
  },
  feedbackContainer: {
    flex: 1,
  },
  feedbackTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  feedbackItem: {
    marginBottom: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
  },
  feedbackAuthor: {
    fontWeight: "bold",
    marginBottom: 5,
  },
  feedbackComment: {
    marginBottom: 5,
  },
  feedbackRating: {
    fontStyle: "italic",
    color: "#666",
  },
  errorText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 50,
  },
  addFeedbackContainer: {
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    paddingTop: 20,
  },
  addFeedbackTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  inputComment: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    minHeight: 100,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  ratingText: {
    fontSize: 16,
    marginRight: 10,
  },
  ratingStarContainer: {
    padding: 5,
  },
  submitButton: {
    backgroundColor: "green",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: "center",
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  ratingTabs: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 10,
  },
  ratingTab: {
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#ccc",
    flexDirection: "row",
  },
  activeRatingTab: {
    backgroundColor: "#f0f0f0",
  },
});

export default Detail;
