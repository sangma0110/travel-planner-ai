import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  TextField,
  IconButton,
  Avatar,
  Menu,
  MenuItem as MuiMenuItem,
  Alert,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Paper,
  useTheme,
  CircularProgress,
  Autocomplete
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { useAuth } from '../contexts/AuthContext';
import { gptService } from '../services/GPTService';
import { bookingService } from '../services/BookingService';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import HotelIcon from '@mui/icons-material/Hotel';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CategoryIcon from '@mui/icons-material/Category';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

const PREFERENCE_OPTIONS = [
  { value: '', label: 'None' },
  { value: 'family', label: 'Family-friendly' },
  { value: 'adventure', label: 'Adventure' },
  { value: 'luxury', label: 'Luxury' },
  { value: 'budget', label: 'Budget-friendly' },
  { value: 'romantic', label: 'Romantic' },
  { value: 'cultural', label: 'Cultural' },
  { value: 'beach', label: 'Beach' },
  { value: 'mountain', label: 'Mountain' },
  { value: 'city', label: 'City' },
  { value: 'nature', label: 'Nature' }
];

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

// 백엔드 URL 설정
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001';

const HomePage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState({
    origin: '',
    destination: '',
    startDate: null,
    endDate: null,
    budget: '',
    preferences: '',
    needsHotel: false,
    needsFlight: false,
    travelers: {
      adults: 1,
      children: 0
    }
  });
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await fetch(`${BACKEND_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      setUser(null);
      handleMenuClose();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'adults' || name === 'children') {
      const parsedValue = parseInt(value) || 0;
      const validatedValue = name === 'adults' 
        ? Math.max(1, parsedValue)  // adults minimum is 1
        : Math.max(0, parsedValue); // children minimum is 0
      
      setFormData(prev => ({
        ...prev,
        travelers: {
          ...prev.travelers,
          [name]: validatedValue
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleDateChange = (name) => (date) => {
    if (name === 'startDate') {
      setFormData(prev => ({
        ...prev,
        startDate: date,
        // If end date is before new start date, reset it
        endDate: prev.endDate && date > prev.endDate ? null : prev.endDate
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: date
      }));
    }
  };

  const generatePlan = async () => {
    try {
      setIsGenerating(true);
      console.log('Starting plan generation...');

      if (!user) {
        setError('Please login to generate a travel plan');
        return;
      }

      if (!formData.destination) {
        setError('Please enter destination');
        return;
      }

      // Format dates to YYYY-MM-DD
      const formatDate = (date) => {
        if (!date) return null;
        const d = new Date(date);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      };

      const startDate = formatDate(formData.startDate);
      const endDate = formatDate(formData.endDate);

      if (!startDate || !endDate) {
        setError('Please select both start and end dates');
        return;
      }

      console.log('Formatted dates:', { startDate, endDate });

      // 1. Search for hotels and flights using Booking.com API
      let hotelData = [];
      let flightData = [];

      if (formData.needsHotel) {
        try {
          console.log('Searching for hotels...');
          hotelData = await bookingService.searchHotels(
            formData.destination,
            startDate,
            endDate,
            formData.travelers.adults,
            formData.travelers.children
          );
          console.log('Hotel search results:', hotelData);
        } catch (error) {
          console.error('Error fetching hotel data:', error);
          setSnackbar({
            open: true,
            message: 'Failed to fetch hotel information, but continuing with plan generation.',
            severity: 'warning'
          });
        }
      }

      if (formData.needsFlight && formData.origin) {
        try {
          console.log('Searching for flights...');
          flightData = await bookingService.searchFlights(
            formData.origin,
            formData.destination,
            startDate,
            endDate,
            formData.travelers.adults,
            formData.travelers.children
          );
          console.log('Flight search results:', flightData);
        } catch (error) {
          console.error('Error fetching flight data:', error);
          setSnackbar({
            open: true,
            message: 'Failed to fetch flight information, but continuing with plan generation.',
            severity: 'warning'
          });
        }
      }

      // 2. Prepare data for GPT service
      const planData = {
        destination: formData.destination,
        origin: formData.origin,
        startDate: startDate,
        endDate: endDate,
        preferences: formData.preferences,
        budget: formData.budget,
        travelers: {
          adults: formData.travelers.adults,
          children: formData.travelers.children
        },
        needsHotel: formData.needsHotel,
        needsFlight: formData.needsFlight
      };

      console.log('Sending data to GPT service:', { planData, hotelData, flightData });

      // 3. Generate travel plan using GPT
      const gptResponse = await gptService.generateTravelPlan(planData, hotelData, flightData);
      console.log('GPT Response received');

      console.log("user", user); 

      // 4. Create new travel plan object with all data
      const newPlan = {
        ...formData,
        startDate: startDate,
        endDate: endDate,
        content: gptResponse,
        hotelData: hotelData,
        flightData: flightData,
        createdAt: new Date().toISOString(),
        userId: user.id
      };

      // 5. Save to backend
      console.log('Saving plan to backend:', newPlan);
      const response = await fetch(`${BACKEND_URL}/api/travel-plans`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        credentials: 'include',
        body: JSON.stringify(newPlan),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to save plan:', errorData);
        throw new Error(errorData.error || 'Failed to save plan');
      }

      const savedPlan = await response.json();
      console.log('Plan saved successfully:', savedPlan);

      // 6. Show success message
      setSnackbar({
        open: true,
        message: 'Travel plan generated successfully!',
        severity: 'success'
      });

      // 7. Navigate to plan detail page
      navigate('/trip-plan', { state: { plan: savedPlan } });
    } catch (error) {
      console.error('Error generating plan:', error);
      setSnackbar({
        open: true,
        message: error.message || 'Failed to generate travel plan. Please try again.',
        severity: 'error'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Box sx={{ 
      flexGrow: 1,
      minHeight: '100vh',
      background: 'linear-gradient(120deg, #f6f9fc 0%, #eef2f7 100%)'
    }}>
      <AppBar position="static" elevation={0} sx={{ 
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)'
      }}>
        <Toolbar>
          <Typography variant="h5" component="div" sx={{ 
            flexGrow: 1, 
            color: theme.palette.primary.main,
            fontWeight: 600
          }}>
            Travel Planner AI
          </Typography>
          {user ? (
            <>
              <IconButton
                size="large"
                edge="end"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenuOpen}
                sx={{ 
                  border: '2px solid',
                  borderColor: theme.palette.primary.main,
                  '&:hover': {
                    backgroundColor: theme.palette.primary.light
                  }
                }}
              >
                <Avatar alt={user.name} src={user.imageUrl} />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                PaperProps={{
                  elevation: 3,
                  sx: {
                    mt: 1,
                    borderRadius: 2,
                    minWidth: 180
                  }
                }}
              >
                <MuiMenuItem onClick={() => { navigate('/trip-history'); handleMenuClose(); }}>
                  My Trips
                </MuiMenuItem>
                <MuiMenuItem onClick={handleLogout}>Logout</MuiMenuItem>
              </Menu>
            </>
          ) : (
            <Button
              variant="contained"
              onClick={() => navigate('/login')}
              sx={{
                borderRadius: '20px',
                px: 3,
                textTransform: 'none',
                fontWeight: 600
              }}
            >
              Login
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ mt: 8, mb: 4 }}>
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: 3,
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            border: '1px solid',
            borderColor: 'rgba(255, 255, 255, 0.3)'
          }}
        >
          <Typography 
            variant="h4" 
            component="h1" 
            gutterBottom 
            sx={{ 
              fontWeight: 700,
              color: theme.palette.primary.main,
              textAlign: 'center',
              mb: 4
            }}
          >
            Plan Your Dream Trip
          </Typography>
          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3,
                borderRadius: 2
              }}
            >
              {error}
            </Alert>
          )}
          <Box component="form" noValidate>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  required
                  fullWidth
                  label="From"
                  name="origin"
                  value={formData.origin}
                  onChange={handleChange}
                  placeholder="Enter departure city"
                  InputProps={{
                    startAdornment: <LocationOnIcon sx={{ mr: 1, color: theme.palette.primary.main }} />,
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  required
                  fullWidth
                  label="To"
                  name="destination"
                  value={formData.destination}
                  onChange={handleChange}
                  placeholder="Enter destination city"
                  InputProps={{
                    startAdornment: <LocationOnIcon sx={{ mr: 1, color: theme.palette.primary.main }} />,
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2
                    }
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Start Date"
                    value={formData.startDate}
                    onChange={handleDateChange('startDate')}
                    minDate={new Date()}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        sx: {
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2
                          }
                        }
                      },
                      day: {
                        sx: {
                          '&:hover': {
                            backgroundColor: 'primary.light',
                            '&:not(.Mui-selected)': {
                              backgroundColor: 'primary.light',
                            }
                          },
                          '&.Mui-selected': {
                            backgroundColor: 'primary.main',
                            color: 'white',
                            '&:hover': {
                              backgroundColor: 'primary.dark',
                            }
                          }
                        }
                      }
                    }}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={12} md={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="End Date"
                    value={formData.endDate}
                    onChange={handleDateChange('endDate')}
                    minDate={formData.startDate || new Date()}
                    disabled={!formData.startDate}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        sx: {
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2
                          }
                        }
                      },
                      day: {
                        sx: {
                          '&:hover': {
                            backgroundColor: 'primary.light',
                            '&:not(.Mui-selected)': {
                              backgroundColor: 'primary.light',
                            }
                          },
                          '&.Mui-selected': {
                            backgroundColor: 'primary.main',
                            color: 'white',
                            '&:hover': {
                              backgroundColor: 'primary.dark',
                            }
                          },
                          '&.MuiPickersDay-dayBetween': {
                            backgroundColor: 'primary.light',
                            color: 'primary.main',
                            '&:hover': {
                              backgroundColor: 'primary.main',
                              color: 'white'
                            }
                          }
                        }
                      },
                      popper: {
                        sx: {
                          '& .MuiPickersDay-root': {
                            '&.MuiPickersDay-dayBetween': {
                              backgroundColor: 'primary.light',
                              color: 'primary.main',
                              '&:hover': {
                                backgroundColor: 'primary.main',
                                color: 'white'
                              }
                            }
                          }
                        }
                      }
                    }}
                    shouldDisableDate={(date) => {
                      if (!formData.startDate) return false;
                      return date < formData.startDate;
                    }}
                  />
                </LocalizationProvider>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Adults"
                  type="number"
                  name="adults"
                  value={formData.travelers.adults}
                  onChange={handleChange}
                  InputProps={{
                    inputProps: { min: 1 }
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Children"
                  type="number"
                  name="children"
                  value={formData.travelers.children}
                  onChange={handleChange}
                  InputProps={{
                    inputProps: { min: 0 }
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2
                    }
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel id="preferences-label">Travel Theme</InputLabel>
                  <Select
                    labelId="preferences-label"
                    name="preferences"
                    value={formData.preferences}
                    label="Travel Theme"
                    onChange={handleChange}
                    sx={{
                      borderRadius: 2,
                      '& .MuiSelect-select': {
                        display: 'flex',
                        alignItems: 'center',
                      }
                    }}
                    startAdornment={<CategoryIcon sx={{ mr: 1, color: theme.palette.primary.main }} />}
                  >
                    {PREFERENCE_OPTIONS.map((option) => (
                      <MenuItem 
                        key={option.value} 
                        value={option.value}
                        sx={{
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Budget"
                  name="budget"
                  value={formData.budget}
                  onChange={handleChange}
                  placeholder="In USD Dollar"
                  InputProps={{
                    startAdornment: <AttachMoneyIcon sx={{ mr: 1, color: theme.palette.primary.main }} />,
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2
                    }
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <Paper 
                  elevation={0}
                  sx={{ 
                    p: 3, 
                    borderRadius: 2,
                    backgroundColor: 'rgba(0, 0, 0, 0.02)',
                    border: '1px solid',
                    borderColor: 'rgba(0, 0, 0, 0.1)'
                  }}
                >
                  <FormGroup row sx={{ justifyContent: 'space-around' }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.needsHotel}
                          onChange={handleChange}
                          name="needsHotel"
                          icon={<HotelIcon sx={{ color: 'rgba(0, 0, 0, 0.3)', fontSize: 28 }} />}
                          checkedIcon={<HotelIcon sx={{ color: theme.palette.primary.main, fontSize: 28 }} />}
                        />
                      }
                      label={
                        <Typography sx={{ 
                          color: formData.needsHotel ? theme.palette.primary.main : 'text.secondary',
                          fontWeight: formData.needsHotel ? 600 : 400
                        }}>
                          Hotel Booking
                        </Typography>
                      }
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.needsFlight}
                          onChange={handleChange}
                          name="needsFlight"
                          icon={<FlightTakeoffIcon sx={{ color: 'rgba(0, 0, 0, 0.3)', fontSize: 28 }} />}
                          checkedIcon={<FlightTakeoffIcon sx={{ color: theme.palette.primary.main, fontSize: 28 }} />}
                        />
                      }
                      label={
                        <Typography sx={{ 
                          color: formData.needsFlight ? theme.palette.primary.main : 'text.secondary',
                          fontWeight: formData.needsFlight ? 600 : 400
                        }}>
                          Flight Booking
                        </Typography>
                      }
                    />
                  </FormGroup>
                </Paper>
              </Grid>
            </Grid>

            <Box sx={{ mt: 4 }}>
              <Button
                variant="contained"
                fullWidth
                onClick={generatePlan}
                disabled={isGenerating}
                sx={{
                  py: 2,
                  borderRadius: 2,
                  fontSize: '1.2rem',
                  textTransform: 'none',
                  fontWeight: 600,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  '&:hover': {
                    boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2)',
                    transform: 'translateY(-1px)'
                  },
                  transition: 'all 0.2s ease-in-out'
                }}
              >
                {isGenerating ? (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CircularProgress size={24} sx={{ mr: 1, color: 'white' }} />
                    Generating Plan...
                  </Box>
                ) : (
                  'Generate Travel Plan'
                )}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ 
            width: '100%',
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default HomePage; 