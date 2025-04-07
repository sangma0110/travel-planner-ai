import React, { useState, useCallback } from 'react';
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
  CircularProgress,
  Autocomplete,
  Chip,
  Alert
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format, addDays } from 'date-fns';
import { useFlightController } from '../../hooks/useFlightController';
import debounce from 'lodash/debounce';

const cabinClasses = ['ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS', 'FIRST'];

const LocationOption = ({ option }) => (
  <Box>
    <Typography variant="body1">
      {option.name}
    </Typography>
    <Typography variant="caption" color="text.secondary">
      {option.type === 'AIRPORT' ? '✈️ Airport' : '🏢 City'} • {option.iataCode}
    </Typography>
  </Box>
);

export const FlightSearch = () => {
  const {
    flights,
    locations,
    isLoading,
    error: apiError,
    searchFlights,
    searchLocations
  } = useFlightController();

  const [searchParams, setSearchParams] = useState({
    origin: '',
    originDetails: null,
    destination: '',
    destinationDetails: null,
    departureDate: null,
    returnDate: null,
    adults: 1,
    children: 0,
    infants: 0,
    cabinClass: 'ECONOMY'
  });

  const [originOptions, setOriginOptions] = useState([]);
  const [destinationOptions, setDestinationOptions] = useState([]);
  const [locationLoading, setLocationLoading] = useState(false);
  const [error, setError] = useState('');

  // Debounced location search
  const debouncedLocationSearch = useCallback(
    debounce(async (type, value) => {
      if (!value || value.length < 2) {
        if (type === 'origin') {
          setOriginOptions([]);
        } else {
          setDestinationOptions([]);
        }
        return;
      }

      setLocationLoading(true);
      try {
        console.log(`Searching ${type} locations for:`, value);
        const results = await searchLocations(value);
        console.log(`Search results for ${type}:`, results);
        
        if (type === 'origin') {
          setOriginOptions(results || []);
        } else {
          setDestinationOptions(results || []);
        }
      } catch (err) {
        console.error(`Error searching ${type} locations:`, err);
        if (type === 'origin') {
          setOriginOptions([]);
        } else {
          setDestinationOptions([]);
        }
        setError(`Failed to search ${type} locations: ${err.message}`);
      } finally {
        setLocationLoading(false);
      }
    }, 300),
    [searchLocations]
  );

  const handleLocationSearch = (type, value) => {
    setError('');
    debouncedLocationSearch(type, value);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors
    
    if (!searchParams.origin || !searchParams.destination || !searchParams.departureDate) {
      const missingFields = [];
      if (!searchParams.origin) missingFields.push('Origin');
      if (!searchParams.destination) missingFields.push('Destination');
      if (!searchParams.departureDate) missingFields.push('Departure Date');
      
      const errorMessage = `Please fill in the required fields: ${missingFields.join(', ')}`;
      setError(errorMessage);
      console.log('Missing required search parameters:', {
        origin: searchParams.origin,
        destination: searchParams.destination,
        departureDate: searchParams.departureDate
      });
      return;
    }

    console.log('Search Parameters:', {
      origin: searchParams.origin,
      originDetails: searchParams.originDetails,
      destination: searchParams.destination,
      destinationDetails: searchParams.destinationDetails,
      departureDate: searchParams.departureDate,
      returnDate: searchParams.returnDate,
      adults: searchParams.adults,
      children: searchParams.children,
      infants: searchParams.infants,
      cabinClass: searchParams.cabinClass
    });

    const formattedParams = {
      ...searchParams,
      departureDate: format(searchParams.departureDate, 'yyyy-MM-dd'),
      returnDate: searchParams.returnDate ? format(searchParams.returnDate, 'yyyy-MM-dd') : undefined
    };

    console.log('Formatted Parameters for API:', formattedParams);

    try {
      const results = await searchFlights(formattedParams);
      console.log('Flight search results:', results);
      
      if (!results || results.length === 0) {
        setError('No flights found for the selected criteria. Please try different dates or locations.');
      }
    } catch (err) {
      console.error('Error searching flights:', err);
      setError(err.message || 'Failed to search flights. Please try again.');
    }
  };

  const formatDuration = (duration) => {
    return duration.replace('PT', '').toLowerCase();
  };

  return (
    <Container maxWidth="lg">
      <Box my={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Flight Search
        </Typography>

        {(error || apiError) && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error || apiError}
          </Alert>
        )}

        <Paper component="form" onSubmit={handleSearch} sx={{ p: 3, mb: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Autocomplete
                options={originOptions}
                getOptionLabel={(option) => 
                  typeof option === 'string' ? option : option.name
                }
                groupBy={(option) => option.countryName}
                onInputChange={(_, value) => handleLocationSearch('origin', value)}
                onChange={(_, newValue) => {
                  setSearchParams(prev => ({
                    ...prev,
                    origin: newValue?.iataCode || '',
                    originDetails: newValue
                  }));
                }}
                value={searchParams.originDetails}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Origin"
                    placeholder="Enter city or airport"
                    required
                    fullWidth
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {locationLoading && <CircularProgress size={20} />}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
                renderOption={(props, option) => (
                  <li {...props}>
                    <LocationOption option={option} />
                  </li>
                )}
                noOptionsText="Enter city or airport name..."
                loading={locationLoading}
                loadingText="Searching..."
                isOptionEqualToValue={(option, value) => option.iataCode === value?.iataCode}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Autocomplete
                options={destinationOptions}
                getOptionLabel={(option) => 
                  typeof option === 'string' ? option : option.name
                }
                groupBy={(option) => option.countryName}
                onInputChange={(_, value) => handleLocationSearch('destination', value)}
                onChange={(_, newValue) => {
                  setSearchParams(prev => ({
                    ...prev,
                    destination: newValue?.iataCode || '',
                    destinationDetails: newValue
                  }));
                }}
                value={searchParams.destinationDetails}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Destination"
                    placeholder="Enter city or airport"
                    required
                    fullWidth
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {locationLoading && <CircularProgress size={20} />}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
                renderOption={(props, option) => (
                  <li {...props}>
                    <LocationOption option={option} />
                  </li>
                )}
                noOptionsText="Enter city or airport name..."
                loading={locationLoading}
                loadingText="Searching..."
                isOptionEqualToValue={(option, value) => option.iataCode === value?.iataCode}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <DatePicker
                label="Departure Date"
                value={searchParams.departureDate}
                onChange={(date) => {
                  setSearchParams(prev => ({
                    ...prev,
                    departureDate: date,
                    // If return date is before the new departure date, update it
                    returnDate: prev.returnDate && date > prev.returnDate ? addDays(date, 1) : prev.returnDate
                  }));
                }}
                minDate={new Date()}
                renderInput={(params) => <TextField {...params} required fullWidth />}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <DatePicker
                label="Return Date (Optional)"
                value={searchParams.returnDate}
                onChange={(date) => setSearchParams(prev => ({ ...prev, returnDate: date }))}
                minDate={searchParams.departureDate ? addDays(searchParams.departureDate, 1) : new Date()}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                label="Adults"
                type="number"
                value={searchParams.adults}
                onChange={(e) => setSearchParams(prev => ({ ...prev, adults: parseInt(e.target.value) }))}
                InputProps={{ inputProps: { min: 1 } }}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                label="Children"
                type="number"
                value={searchParams.children}
                onChange={(e) => setSearchParams(prev => ({ ...prev, children: parseInt(e.target.value) }))}
                InputProps={{ inputProps: { min: 0 } }}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                label="Infants"
                type="number"
                value={searchParams.infants}
                onChange={(e) => setSearchParams(prev => ({ ...prev, infants: parseInt(e.target.value) }))}
                InputProps={{ inputProps: { min: 0 } }}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                select
                label="Cabin Class"
                value={searchParams.cabinClass}
                onChange={(e) => setSearchParams(prev => ({ ...prev, cabinClass: e.target.value }))}
                fullWidth
                SelectProps={{
                  native: true
                }}
              >
                {cabinClasses.map((option) => (
                  <option key={option} value={option}>
                    {option.replace('_', ' ')}
                  </option>
                ))}
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
                {isLoading ? <CircularProgress size={24} /> : 'Search Flights'}
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {flights.length > 0 && (
          <Grid container spacing={3}>
            {flights.map((flight) => (
              <Grid item xs={12} key={flight.id}>
                <Card>
                  <CardContent>
                    <Grid container spacing={2}>
                      {flight.itineraries.map((itinerary, index) => (
                        <Grid item xs={12} key={index}>
                          <Typography variant="h6" gutterBottom>
                            {index === 0 ? 'Outbound' : 'Return'} Flight
                          </Typography>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" color="textSecondary">
                              Duration: {formatDuration(itinerary.duration)}
                            </Typography>
                          </Box>
                          {itinerary.segments.map((segment, segIndex) => (
                            <Paper
                              key={segIndex}
                              sx={{ p: 2, mb: 2, backgroundColor: 'background.default' }}
                            >
                              <Grid container spacing={2}>
                                <Grid item xs={12} sm={4}>
                                  <Typography variant="subtitle2">
                                    {format(new Date(segment.departure.time), 'MMM d, HH:mm')}
                                  </Typography>
                                  <Typography variant="body2">
                                    {segment.departure.airport}
                                    {segment.departure.terminal && ` Terminal ${segment.departure.terminal}`}
                                  </Typography>
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                  <Box sx={{ textAlign: 'center' }}>
                                    <Typography variant="body2" color="textSecondary">
                                      {formatDuration(segment.duration)}
                                    </Typography>
                                    <Typography variant="body2">
                                      {segment.airlineName} {segment.carrierCode}{segment.flightNumber}
                                    </Typography>
                                    {segment.stops > 0 && (
                                      <Chip
                                        label={`${segment.stops} stop${segment.stops > 1 ? 's' : ''}`}
                                        size="small"
                                        color="primary"
                                      />
                                    )}
                                  </Box>
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                  <Typography variant="subtitle2">
                                    {format(new Date(segment.arrival.time), 'MMM d, HH:mm')}
                                  </Typography>
                                  <Typography variant="body2">
                                    {segment.arrival.airport}
                                    {segment.arrival.terminal && ` Terminal ${segment.arrival.terminal}`}
                                  </Typography>
                                </Grid>
                              </Grid>
                            </Paper>
                          ))}
                        </Grid>
                      ))}
                      <Grid item xs={12}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box>
                            <Typography variant="h6" component="span">
                              ${flight.price.amount}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              {flight.numberOfBookableSeats} seats left
                            </Typography>
                          </Box>
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={() => window.open(`https://www.amadeus.com/flights`, '_blank')}
                          >
                            Book Now
                          </Button>
                        </Box>
                      </Grid>
                    </Grid>
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

export default FlightSearch; 