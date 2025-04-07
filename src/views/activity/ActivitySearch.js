import React, { useState, useCallback } from 'react';
import { Container, Box, Typography, TextField, Button, Paper, CircularProgress, Grid, Card, CardContent, CardMedia, Rating, Chip, Tabs, Tab } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { useActivityController } from '../../hooks/useActivityController';

const mapContainerStyle = {
  width: '100%',
  height: '400px'
};

const center = {
  lat: 37.7749,
  lng: -122.4194
};

const ActivitySearch = () => {
  const [location, setLocation] = useState('');
  const [date, setDate] = useState(null);
  const [category, setCategory] = useState('all');
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [tabValue, setTabValue] = useState(0);

  const { activities, packages, isLoading, error, searchActivities } = useActivityController();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!location.trim()) return;

    const searchParams = {
      location,
      date: date ? date.toISOString().split('T')[0] : null,
      category
    };

    await searchActivities(searchParams);
  };

  const onMapClick = useCallback((e) => {
    setSelectedActivity(null);
  }, []);

  const onMarkerClick = useCallback((activity) => {
    setSelectedActivity(activity);
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Activity Search
        </Typography>

        <Paper sx={{ p: 3, mb: 3 }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Enter city or place"
                  required
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Date"
                    value={date}
                    onChange={setDate}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  select
                  label="Category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  SelectProps={{
                    native: true
                  }}
                >
                  <option value="all">All Activities</option>
                  <option value="attractions">Attractions</option>
                  <option value="tours">Tours</option>
                  <option value="outdoor">Outdoor Activities</option>
                  <option value="cultural">Cultural Experiences</option>
                  <option value="food">Food & Drink</option>
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  disabled={isLoading}
                >
                  {isLoading ? <CircularProgress size={24} /> : 'Search Activities'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>

        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3 }}>
          <Tab label="Map View" />
          <Tab label="List View" />
          <Tab label="Packages" />
        </Tabs>

        {tabValue === 0 && (
          <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={center}
              zoom={13}
              onClick={onMapClick}
            >
              {activities.map((activity) => (
                <Marker
                  key={activity.id}
                  position={{
                    lat: activity.location.lat,
                    lng: activity.location.lng
                  }}
                  onClick={() => onMarkerClick(activity)}
                />
              ))}

              {selectedActivity && (
                <InfoWindow
                  position={{
                    lat: selectedActivity.location.lat,
                    lng: selectedActivity.location.lng
                  }}
                  onCloseClick={() => setSelectedActivity(null)}
                >
                  <Box>
                    <Typography variant="subtitle1">
                      {selectedActivity.name}
                    </Typography>
                    <Rating value={selectedActivity.rating} readOnly />
                    <Typography variant="body2">
                      {selectedActivity.address}
                    </Typography>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => window.open(selectedActivity.bookingLink, '_blank')}
                      sx={{ mt: 1 }}
                    >
                      Book Now
                    </Button>
                  </Box>
                </InfoWindow>
              )}
            </GoogleMap>
          </LoadScript>
        )}

        {tabValue === 1 && (
          <Grid container spacing={3}>
            {activities.map((activity) => (
              <Grid item xs={12} sm={6} md={4} key={activity.id}>
                <Card>
                  <CardMedia
                    component="img"
                    height="140"
                    image={activity.image || 'https://via.placeholder.com/300x200'}
                    alt={activity.name}
                  />
                  <CardContent>
                    <Typography gutterBottom variant="h6" component="div">
                      {activity.name}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Rating value={activity.rating} readOnly />
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                        ({activity.reviewCount} reviews)
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {activity.address}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Duration: {activity.duration}
                    </Typography>
                    <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
                      ${activity.price}
                    </Typography>
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      sx={{ mt: 1 }}
                      onClick={() => window.open(activity.bookingLink, '_blank')}
                    >
                      Book Now
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {tabValue === 2 && (
          <Grid container spacing={3}>
            {packages.map((pkg) => (
              <Grid item xs={12} sm={6} key={pkg.id}>
                <Card>
                  <CardMedia
                    component="img"
                    height="200"
                    image={pkg.image || 'https://via.placeholder.com/600x400'}
                    alt={pkg.name}
                  />
                  <CardContent>
                    <Typography gutterBottom variant="h5" component="div">
                      {pkg.name}
                    </Typography>
                    <Typography variant="body1" paragraph>
                      {pkg.description}
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      {pkg.activities.map((activity, index) => (
                        <Chip
                          key={index}
                          label={activity}
                          sx={{ mr: 1, mb: 1 }}
                        />
                      ))}
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Duration: {pkg.duration}
                    </Typography>
                    <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
                      ${pkg.price}
                    </Typography>
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      sx={{ mt: 2 }}
                      onClick={() => window.open(pkg.bookingLink, '_blank')}
                    >
                      Book Package
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Container>
  );
};

export default ActivitySearch; 