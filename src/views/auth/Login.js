import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Divider,
  Alert
} from '@mui/material';
import { useGoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { useAuth } from '../../contexts/AuthContext';
import GoogleIcon from '@mui/icons-material/Google';

const Login = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const response = await fetch(`http://localhost:5001${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      setUser(data.user);
      navigate('/');
    } catch (error) {
      setError(error.message);
    }
  };

  const googleLogin = useGoogleLogin({
    flow: 'implicit',
    onSuccess: async (tokenResponse) => {
      try {
        const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: {
            Authorization: `Bearer ${tokenResponse.access_token}`,
          },
        });

        const userInfo = await response.json();
        
        const backendResponse = await fetch('http://localhost:5001/api/auth/google', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            googleId: userInfo.sub,
            email: userInfo.email,
            name: userInfo.name,
            imageUrl: userInfo.picture
          }),
        });

        const data = await backendResponse.json();

        if (!backendResponse.ok) {
          throw new Error(data.error || 'Google login failed');
        }

        setUser(data.user);
        navigate('/');
      } catch (error) {
        setError(error.message);
      }
    },
    onError: () => {
      setError('Google login failed');
    }
  });

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            {isLogin ? 'Login' : 'Register'}
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <TextField
                fullWidth
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                margin="normal"
                required
              />
            )}
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              margin="normal"
              required
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              sx={{ mt: 3, mb: 2 }}
            >
              {isLogin ? 'Login' : 'Register'}
            </Button>
          </form>

          <Divider sx={{ my: 2 }}>OR</Divider>

          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <Button
              variant="outlined"
              onClick={googleLogin}
              startIcon={<GoogleIcon />}
              sx={{
                backgroundColor: 'white',
                '&:hover': {
                  backgroundColor: '#f5f5f5',
                },
              }}
            >
              Continue with Google
            </Button>
          </Box>

          <Button
            fullWidth
            onClick={() => setIsLogin(!isLogin)}
            sx={{ mt: 2 }}
          >
            {isLogin ? 'Need an account? Register' : 'Already have an account? Login'}
          </Button>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login; 