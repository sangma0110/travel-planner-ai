import { useState } from 'react';

export const useRestaurantController = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchRestaurants = async (location) => {
    setIsLoading(true);
    setError(null);

    try {
      // First, get the coordinates for the location
      const geocodeResponse = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          location
        )}&key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}`
      );
      const geocodeData = await geocodeResponse.json();

      if (!geocodeData.results || geocodeData.results.length === 0) {
        throw new Error('Location not found');
      }

      const { lat, lng } = geocodeData.results[0].geometry.location;

      // Then, search for nearby restaurants
      const placesResponse = await fetch(
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=1500&type=restaurant&key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}`
      );
      const placesData = await placesResponse.json();

      if (placesData.status !== 'OK') {
        throw new Error('Failed to fetch restaurants');
      }

      // Get detailed information for each restaurant
      const detailedRestaurants = await Promise.all(
        placesData.results.map(async (place) => {
          const detailsResponse = await fetch(
            `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,rating,formatted_address,geometry,opening_hours,photos,user_ratings_total&key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}`
          );
          const detailsData = await detailsResponse.json();
          return detailsData.result;
        })
      );

      // Sort restaurants by rating and number of reviews
      const sortedRestaurants = detailedRestaurants.sort((a, b) => {
        const ratingDiff = b.rating - a.rating;
        if (ratingDiff !== 0) return ratingDiff;
        return b.user_ratings_total - a.user_ratings_total;
      });

      setRestaurants(sortedRestaurants);
    } catch (err) {
      setError(err.message);
      setRestaurants([]);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    restaurants,
    isLoading,
    error,
    searchRestaurants,
  };
}; 