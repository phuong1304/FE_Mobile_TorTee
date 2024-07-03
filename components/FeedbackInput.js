import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Alert, Text } from 'react-native';
import axios from 'axios';
import { baseURL } from '../constants/api';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { Ionicons } from 'react-native-vector-icons';

const FeedbackInput = ({ productId, onAddFeedback, product }) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
  
    const addFeedback = async () => {
      try {
        setSubmitting(true);
        const response = await axios({
          method: 'put',
          url: `${baseURL}/product/${productId}`,
          data: {
            feedbacks: [
              ...product.feedbacks,
              {
                rating: rating,
                comment: comment,
                author: 'User',  // Customize based on your app's authentication or user context
                date: new Date().toISOString(),
              }
            ]
          }
        });
  
        // Trigger callback to update feedbacks list
        onAddFeedback(response.data.feedbacks);
        setRating(0);
        setComment('');
        setError('');
      } catch (error) {
        console.error('Error adding feedback:', error);
        setError('Failed to add feedback.');
      } finally {
        setSubmitting(false);
      }
    };

  return (
    <View style={styles.container}>
      {/* Rating Stars */}
      <View style={styles.ratingContainer}>
        <Text style={styles.ratingText}>Your Rating: </Text>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            style={styles.ratingStarContainer}
            onPress={() => setRating(star)}
          >
            <Ionicons
              name={rating >= star ? 'star' : 'star-outline'}
              size={24}
              color={rating >= star ? 'orange' : 'gray'}
            />
          </TouchableOpacity>
        ))}
      </View>
      
      {/* Comment Input */}
      <TextInput
        style={styles.input}
        placeholder="Enter Comment"
        value={comment}
        onChangeText={text => setComment(text)}
        multiline
      />
      
      {/* Submit Button */}
      <Button title={submitting ? 'Submitting...' : 'Submit Feedback'} onPress={addFeedback} disabled={submitting || rating === 0} />
      
      {/* Error Message */}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
      padding: 10,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 5,
    },
    ratingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
    },
    ratingText: {
      fontSize: 16,
      marginRight: 10,
    },
    ratingStarContainer: {
      padding: 5,
    },
    input: {
      height: 40,
      borderColor: '#ccc',
      borderWidth: 1,
      marginBottom: 10,
      padding: 10,
      borderRadius: 5,
    },
    error: {
      color: 'red',
      marginTop: 10,
    },
  });

export default FeedbackInput;
