import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import HomePage from './components/Home';
import Register from './components/Register';
import Login from './components/Login';
import EditProfile from './components/EditProfile';
import MyProfile from './components/myprofile';
import ViewProfile from './components/viewprofile';
import Chat from './components/Chat';
import SharedPost from './components/SharedPost';
import { ColorModeContext, useThemeMode } from './theme';
import './services/api';

const isAuthenticated = () => !!localStorage.getItem('authToken');

const PrivateRoute = ({ element }) => (isAuthenticated() ? element : <Navigate to="/login" />);

function App() {
  const { theme, colorMode } = useThemeMode();

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Routes>
            <Route
              path="/"
              element={isAuthenticated() ? <Navigate to="/home" /> : <Navigate to="/login" />}
            />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/home" element={<PrivateRoute element={<HomePage />} />} />
            <Route path="/chat" element={<PrivateRoute element={<Chat />} />} />
            <Route path="/editprofile" element={<PrivateRoute element={<EditProfile />} />} />
            <Route path="/myprofile" element={<PrivateRoute element={<MyProfile />} />} />
            <Route path="/profile/:userId" element={<ViewProfile />} />
            <Route path="/post/:id" element={<SharedPost />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;
