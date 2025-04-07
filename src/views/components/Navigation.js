import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const Navigation = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component={RouterLink} to="/" sx={{ flexGrow: 1, textDecoration: 'none', color: 'inherit' }}>
          Travel Planner AI
        </Typography>
        <Box>
          <Button color="inherit" component={RouterLink} to="/flights">
            Flights
          </Button>
          <Button color="inherit" component={RouterLink} to="/hotels">
            Hotels
          </Button>
          <Button color="inherit" component={RouterLink} to="/activities">
            Activities
          </Button>
          <Button color="inherit" component={RouterLink} to="/restaurants">
            Restaurants
          </Button>
          <Button color="inherit" component={RouterLink} to="/history">
            History
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navigation; 