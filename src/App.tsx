import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import io from "socket.io-client";
import axios from 'axios';
import { 
  TextField, 
  Button, 
  List, 
  ListItem, 
  ListItemText, 
  Typography, 
  Box, 
  AppBar, 
  Toolbar,
  Avatar,
  CircularProgress,
  Link // Added this import
} from '@mui/material';
import Login from './Login';

const API_URL = process.env.REACT_APP_API_URL || 'https://msz-backend.onrender.com/';
const socket = io(process.env.REACT_APP_API_URL || 'https://msz-backend.onrender.com/');

interface Message {
  id: number;
  userId: number;
  username: string;
  content: string;
  createdAt: string;
}

interface User {
  id: number;
  username: string;
  email: string;
}

interface ChatAppProps {
  user: User;
}

function ChatApp({ user }: ChatAppProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API_URL}/messages`)
      .then(response => {
        setMessages(response.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });

    socket.on('newMessage', (message: Message) => {
      setMessages(prev => [message, ...prev]);
    });

    return () => {
      socket.off('newMessage');
    };
  }, []);

  const sendMessage = () => {
    if (currentMessage.trim()) {
      socket.emit('sendMessage', {
        userId: user.id,
        content: currentMessage
      });
      setCurrentMessage('');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        <List>
          {messages.map((message) => (
            <ListItem key={message.id}>
              <Avatar sx={{ mr: 2 }}>
                {message.username.charAt(0).toUpperCase()}
              </Avatar>
              <ListItemText
                primary={message.username}
                secondary={message.content}
              />
            </ListItem>
          ))}
        </List>
      </Box>
      <Box sx={{ p: 2, borderTop: '1px solid #eee' }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Type a message..."
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          />
          <Button 
            variant="contained" 
            color="primary"
            onClick={sendMessage}
          >
            Send
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const userId = localStorage.getItem('userId');
      if (userId) {
        try {
          const response = await axios.get(`${API_URL}/me`, {
            headers: { 'user-id': userId }
          });
          setUser(response.data);
        } catch (err) {
          console.error('Auth check failed:', err);
          localStorage.removeItem('userId');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem('userId', userData.id.toString());
  };

  const handleLogout = () => {
    localStorage.removeItem('userId');
    setUser(null);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Router>
      <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6">Real-Time Chat</Typography>
            {user && (
              <Button 
                onClick={handleLogout} 
                sx={{ position: 'absolute', right: 16 }}
                color="inherit"
              >
                Logout
              </Button>
            )}
          </Toolbar>
        </AppBar>

        <Routes>
          <Route 
            path="/" 
            element={user ? <ChatApp user={user} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/login" 
            element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/" />} 
          />
          <Route 
            path="/register" 
            element={!user ? (
              <Register onRegister={handleLogin} />
            ) : <Navigate to="/" />} 
          />
        </Routes>
      </Box>
    </Router>
  );
}

function Register({ onRegister }: { onRegister: (user: User) => void }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/register`, { 
        username, 
        email, 
        password 
      });
      onRegister(response.data);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || 'Registration failed');
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', mt: 4, p: 3 }}>
      <Typography variant="h5" gutterBottom>Register</Typography>
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}
      <form onSubmit={handleSubmit}>
        <TextField
          label="Username"
          fullWidth
          margin="normal"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          disabled={loading}
        />
        <TextField
          label="Email"
          type="email"
          fullWidth
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
        />
        <TextField
          label="Password"
          type="password"
          fullWidth
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
        />
        <Button 
          type="submit" 
          variant="contained" 
          sx={{ mt: 2 }}
          disabled={loading}
          fullWidth
        >
          {loading ? <CircularProgress size={24} /> : 'Register'}
        </Button>
      </form>
      <Typography sx={{ mt: 2 }}>
        Already have an account? <Link href="/login">Login</Link>
      </Typography>
    </Box>
  );
}

export default App;