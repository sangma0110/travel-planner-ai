import React, { useState, useCallback } from 'react';
import { Container, Box, Typography, TextField, Button, Paper, CircularProgress, Grid, Card, CardContent, CardMedia, Rating } from '@mui/material';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { useRestaurantController } from '../../hooks/useRestaurantController';

const mapContainerStyle = {
  width: '100%',
  height: '400px'
};

const center = {
  lat: 37.7749,
  lng: -122.4194
};

const RestaurantRecommender = () => {
  const [location, setLocation] = useState('');
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const { restaurants, isLoading, error, searchRestaurants } = useRestaurantController();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!location.trim()) return;

    try {
      await searchRestaurants(location);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const onMapClick = useCallback((e) => {
    setSelectedRestaurant(null);
  }, []);

  const onMarkerClick = useCallback((restaurant) => {
    setSelectedRestaurant(restaurant);
  }, []);

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Restaurant Recommendations
        </Typography>
        
        <Paper sx={{ p: 3, mb: 3 }}>
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Enter location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., San Francisco, CA"
              variant="outlined"
              sx={{ mb: 2 }}
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isLoading}
              fullWidth
            >
              {isLoading ? <CircularProgress size={24} /> : 'Search Restaurants'}
            </Button>
          </form>
        </Paper>

        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={center}
            zoom={13}
            onClick={onMapClick}
          >
            {restaurants.map((restaurant) => (
              <Marker
                key={restaurant.place_id}
                position={{
                  lat: restaurant.geometry.location.lat,
                  lng: restaurant.geometry.location.lng
                }}
                onClick={() => onMarkerClick(restaurant)}
              />
            ))}

            {selectedRestaurant && (
              <InfoWindow
                position={{
                  lat: selectedRestaurant.geometry.location.lat,
                  lng: selectedRestaurant.geometry.location.lng
                }}
                onCloseClick={() => setSelectedRestaurant(null)}
              >
                <Box>
                  <Typography variant="subtitle1">
                    {selectedRestaurant.name}
                  </Typography>
                  <Rating value={selectedRestaurant.rating} readOnly />
                  <Typography variant="body2">
                    {selectedRestaurant.vicinity}
                  </Typography>
                </Box>
              </InfoWindow>
            )}
          </GoogleMap>
        </LoadScript>

        <Grid container spacing={3} sx={{ mt: 4 }}>
          {restaurants.map((restaurant) => (
            <Grid item xs={12} sm={6} md={4} key={restaurant.place_id}>
              <Card>
                <CardMedia
                  component="img"
                  height="140"
                  image={restaurant.photos?.[0]?.getUrl() || 'https://via.placeholder.com/300x200'}
                  alt={restaurant.name}
                />
                <CardContent>
                  <Typography gutterBottom variant="h6" component="div">
                    {restaurant.name}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Rating value={restaurant.rating} readOnly />
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                      ({restaurant.user_ratings_total} reviews)
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {restaurant.vicinity}
                  </Typography>
                  {restaurant.opening_hours && (
                    <Typography variant="body2" color={restaurant.opening_hours.open_now ? 'success.main' : 'error.main'}>
                      {restaurant.opening_hours.open_now ? 'Open Now' : 'Closed'}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
};

export default RestaurantRecommender; 