import React, { useState } from 'react';
import { 
  Container, 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  Grid,
  Card,
  CardContent,
  CardMedia,
  Rating,
  CircularProgress
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useHotelController } from '../../hooks/useHotelController';

const HotelSearch = () => {
  const [location, setLocation] = useState('');
  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [guests, setGuests] = useState(1);
  const [rooms, setRooms] = useState(1);
  const { hotels, isLoading, searchHotels } = useHotelController();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!location || !checkIn || !checkOut) return;

    await searchHotels({
      location,
      checkIn,
      checkOut,
      guests,
      rooms
    });
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          호텔 검색
        </Typography>

        <Paper sx={{ p: 3, mb: 3 }}>
          <form onSubmit={handleSearch}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="위치"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="체크인"
                    value={checkIn}
                    onChange={setCheckIn}
                    renderInput={(params) => <TextField {...params} fullWidth required />}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={12} md={2}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="체크아웃"
                    value={checkOut}
                    onChange={setCheckOut}
                    renderInput={(params) => <TextField {...params} fullWidth required />}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  label="게스트"
                  type="number"
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value))}
                  inputProps={{ min: 1 }}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  label="객실"
                  type="number"
                  value={rooms}
                  onChange={(e) => setRooms(Number(e.target.value))}
                  inputProps={{ min: 1 }}
                />
              </Grid>
              <Grid item xs={12} md={1}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  sx={{ height: '100%' }}
                  disabled={isLoading}
                >
                  {isLoading ? <CircularProgress size={24} /> : '검색'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {hotels.map((hotel) => (
              <Grid item xs={12} md={6} lg={4} key={hotel.id}>
                <Card>
                  <CardMedia
                    component="img"
                    height="200"
                    image={hotel.image}
                    alt={hotel.name}
                  />
                  <CardContent>
                    <Typography variant="h6" component="h2">
                      {hotel.name}
                    </Typography>
                    <Typography color="text.secondary" gutterBottom>
                      {hotel.location}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Rating value={hotel.rating} readOnly precision={0.5} />
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                        ({hotel.reviews} reviews)
                      </Typography>
                    </Box>
                    <Typography variant="body1" gutterBottom>
                      {hotel.description}
                    </Typography>
                    <Typography variant="h6" color="primary">
                      ₩{hotel.price.toLocaleString()} / 박
                    </Typography>
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      sx={{ mt: 2 }}
                    >
                      예약하기
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

export default HotelSearch; 