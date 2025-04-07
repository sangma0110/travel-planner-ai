import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { GoogleOAuthProvider } from '@react-oauth/google';
import theme from './theme';
import HomePage from './views/HomePage';
import Login from './views/auth/Login';
import TripHistory from './views/trip/TripHistory';
import TripPlanDetail from './views/trip/TripPlanDetail';
import { AuthProvider } from './contexts/AuthContext';
import { TripProvider } from './contexts/TripContext';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <React.StrictMode>
      <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <AuthProvider>
            <TripProvider>
              <Router>
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/" element={<HomePage />} />
                  <Route path="/trip-plan" element={<PrivateRoute><TripPlanDetail /></PrivateRoute>} />
                  <Route path="/trip-history" element={<PrivateRoute><TripHistory /></PrivateRoute>} />
                </Routes>
              </Router>
            </TripProvider>
          </AuthProvider>
        </ThemeProvider>
      </GoogleOAuthProvider>
    </React.StrictMode>
  );
}

export default App;
