import React from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Button,
  Divider,
  Chip,
  IconButton,
  useTheme,
  AppBar,
  Toolbar,
  Avatar,
  Menu,
  MenuItem
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useLocation, useNavigate } from 'react-router-dom';
import SaveIcon from '@mui/icons-material/Save';
import ShareIcon from '@mui/icons-material/Share';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import GroupIcon from '@mui/icons-material/Group';
import CategoryIcon from '@mui/icons-material/Category';
import LocalHotelIcon from '@mui/icons-material/LocalHotel';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  marginTop: theme.spacing(4),
  background: 'linear-gradient(145deg, #ffffff 0%, #f5f5f5 100%)',
  borderRadius: '16px',
  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
}));

const TimelineItem = styled(Box)(({ theme }) => ({
  position: 'relative',
  paddingLeft: theme.spacing(4),
  marginBottom: theme.spacing(4),
  '& .MuiTypography-root': {
    '& strong': {
      fontSize: '1.2rem',
      fontWeight: 700,
      color: theme.palette.primary.main,
    }
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    left: 0,
    top: 0,
    width: '2px',
    height: '100%',
    backgroundColor: theme.palette.primary.main,
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    left: -6,
    top: 0,
    width: '14px',
    height: '14px',
    borderRadius: '50%',
    backgroundColor: theme.palette.primary.main,
  },
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.5rem',
  fontWeight: 700,
  color: theme.palette.primary.main,
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(2),
}));

const BookNowButton = ({ url }) => (
  <Button
    variant="contained"
    color="primary"
    startIcon={<LocalHotelIcon />}
    endIcon={<OpenInNewIcon />}
    onClick={() => window.open(url, '_blank')}
    sx={{
      mt: 1,
      textTransform: 'none',
      borderRadius: 2,
      boxShadow: 2,
      backgroundColor: 'primary.main',
      '&:hover': {
        boxShadow: 4,
        transform: 'translateY(-2px)',
        backgroundColor: 'primary.dark',
      },
      transition: 'all 0.2s ease',
    }}
  >
    Book Now
  </Button>
);

// 백엔드 URL 설정
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001';

const TripPlanDetail = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, setUser } = useAuth();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const { plan } = location.state || {};

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
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  if (!plan) {
    return (
      <Box sx={{ flexGrow: 1, minHeight: '100vh' }}>
        <AppBar position="static" elevation={0} sx={{ 
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)'
        }}>
          <Toolbar>
            <Typography 
              variant="h5" 
              component="div" 
              sx={{ 
                flexGrow: 1, 
                color: theme.palette.primary.main,
                fontWeight: 600,
                cursor: 'pointer'
              }}
              onClick={() => navigate('/')}
            >
              Travel Planner AI
            </Typography>
          </Toolbar>
        </AppBar>
        <Container>
          <Box sx={{ textAlign: 'center', mt: 8 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No travel plan found. Please create a new plan.
            </Typography>
            <Button 
              variant="contained" 
              onClick={handleBack}
              sx={{ mt: 2 }}
            >
              Create New Plan
            </Button>
          </Box>
        </Container>
      </Box>
    );
  }

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
          <Typography 
            variant="h5" 
            component="div" 
            sx={{ 
              flexGrow: 1, 
              color: theme.palette.primary.main,
              fontWeight: 600,
              cursor: 'pointer'
            }}
            onClick={() => navigate('/')}
          >
            Travel Planner AI
          </Typography>
          {user && (
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
              >
                <MenuItem onClick={() => { navigate('/trip-history'); handleMenuClose(); }}>
                  My Trips
                </MenuItem>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </>
          )}
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={handleBack}
              sx={{ 
                textTransform: 'none',
                borderRadius: 2,
                px: 3
              }}
            >
              Back to Home
            </Button>
          </Box>

          <StyledPaper elevation={3}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
              Travel Plan for {plan.destination}
            </Typography>
            
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom color="text.secondary">
                Trip Details
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper elevation={0} sx={{ p: 2, backgroundColor: 'rgba(0, 0, 0, 0.02)', borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <CalendarMonthIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                      <Typography variant="body2" color="text.secondary">
                        Dates
                      </Typography>
                    </Box>
                    <Typography variant="body1" sx={{ mt: 1 }}>
                      {formatDate(plan.startDate)} - {formatDate(plan.endDate)}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper elevation={0} sx={{ p: 2, backgroundColor: 'rgba(0, 0, 0, 0.02)', borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <AccountBalanceWalletIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                      <Typography variant="body2" color="text.secondary">
                        Budget
                      </Typography>
                    </Box>
                    <Typography variant="body1" sx={{ mt: 1 }}>
                      ${plan.budget}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper elevation={0} sx={{ p: 2, backgroundColor: 'rgba(0, 0, 0, 0.02)', borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <GroupIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                      <Typography variant="body2" color="text.secondary">
                        Travelers
                      </Typography>
                    </Box>
                    <Typography variant="body1" sx={{ mt: 1 }}>
                      {plan.travelers ? 
                        `${plan.travelers.adults || 1} Adults${plan.travelers.children ? `, ${plan.travelers.children} Children` : ''}`
                        : '1 Adult'}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper elevation={0} sx={{ p: 2, backgroundColor: 'rgba(0, 0, 0, 0.02)', borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <CategoryIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                      <Typography variant="body2" color="text.secondary">
                        Travel Theme
                      </Typography>
                    </Box>
                    <Typography variant="body1" sx={{ mt: 1 }}>
                      {plan.preferences || 'None'}
                    </Typography>
                  </Paper>
                </Grid>
                {(plan.needsHotel || plan.needsFlight) && (
                  <Grid item xs={12}>
                    <Paper elevation={0} sx={{ p: 2, backgroundColor: 'rgba(0, 0, 0, 0.02)', borderRadius: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          Additional Services
                        </Typography>
                      </Box>
                      <Box sx={{ mt: 1 }}>
                        {plan.needsHotel && (
                          <Chip 
                            icon={<LocalHotelIcon />}
                            label="Hotel Booking" 
                            color="primary" 
                            variant="outlined" 
                            sx={{ mr: 1 }} 
                          />
                        )}
                        {plan.needsFlight && (
                          <Chip 
                            icon={<FlightTakeoffIcon />}
                            label="Flight Booking" 
                            color="primary" 
                            variant="outlined" 
                          />
                        )}
                      </Box>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            </Box>

            <Divider sx={{ my: 4 }} />

            <Box>
              <Typography variant="h6" gutterBottom color="text.secondary">
                Travel Itinerary
              </Typography>
              <Box sx={{ mt: 3 }}>
                {plan.content.split('\n').map((line, index) => {
                  if (!line.trim()) return null;
                  
                  // Convert section titles to SectionTitle component
                  if (/^\d+\.\s+[A-Za-z\s\-&]+$/.test(line.trim())) {
                    return (
                      <SectionTitle key={index}>
                        {line.trim()}
                      </SectionTitle>
                    );
                  }
                  
                  // Handle Day headers separately
                  if (/^\[Day \d+\]/.test(line.trim())) {
                    return (
                      <Typography
                        key={index}
                        variant="h6"
                        sx={{
                          fontWeight: 600,
                          color: theme.palette.primary.main,
                          mt: 3,
                          mb: 2
                        }}
                      >
                        {line.trim()}
                      </Typography>
                    );
                  }
                  
                  // Handle booking links
                  if (line.includes('[Book Now]')) {
                    const [info, link] = line.split('[Book Now]');
                    const url = link.replace(/[()]/g, '').trim();
                    return (
                      <TimelineItem key={index}>
                        <Typography 
                          variant="body1" 
                          sx={{ 
                            whiteSpace: 'pre-line',
                            color: theme.palette.text.primary,
                            mb: 1
                          }}
                        >
                          {info.trim()}
                        </Typography>
                        <BookNowButton url={url} />
                      </TimelineItem>
                    );
                  }
                  
                  // Convert numbered list items to bold
                  const modifiedLine = line
                    .replace(/^\d+\.\s+/g, (match) => {
                      return `<strong>${match}</strong>`;
                    })
                    .replace(/[\u{1F300}-\u{1F9FF}]|[\u{2700}-\u{27BF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{2600}-\u{26FF}]/gu, '');
                  
                  return (
                    <TimelineItem key={index}>
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          whiteSpace: 'pre-line',
                          color: theme.palette.text.primary
                        }}
                        dangerouslySetInnerHTML={{ __html: modifiedLine }}
                      />
                    </TimelineItem>
                  );
                })}
              </Box>
            </Box>
          </StyledPaper>
        </Box>
      </Container>
    </Box>
  );
};

export default TripPlanDetail; 