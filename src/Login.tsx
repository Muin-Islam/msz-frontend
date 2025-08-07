import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Box, Typography, CircularProgress, Link } from '@mui/material';
import axios from 'axios';

interface User {
  id: number;
  username: string;
  email: string;
}

interface LoginProps {
  onLogin: (user: User) => void;
  apiUrl?: string;
}

const Login: React.FC<LoginProps> = ({ onLogin, apiUrl = process.env.REACT_APP_API_URL || 'https://msz-backend.onrender.com/' }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await axios.post(`${apiUrl}/login`, { 
        email, 
        password 
      });
      onLogin(response.data);
      navigate('/');
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || 'Login failed');
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', mt: 4, p: 3 }}>
      <Typography variant="h5" gutterBottom>Login</Typography>
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}
      <form onSubmit={handleSubmit}>
        <TextField
          label="Email"
          type="email"
          fullWidth
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isLoading}
        />
        <TextField
          label="Password"
          type="password"
          fullWidth
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={isLoading}
        />
        <Button 
          type="submit" 
          variant="contained" 
          sx={{ mt: 2 }}
          disabled={isLoading}
          fullWidth
        >
          {isLoading ? <CircularProgress size={24} /> : 'Login'}
        </Button>
      </form>
      <Typography sx={{ mt: 2 }}>
        Don't have an account? <Link href="/register">Register</Link>
      </Typography>
    </Box>
  );
};

export default Login;