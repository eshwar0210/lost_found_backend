import React, { useState, useEffect, useContext } from 'react';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  ListItemIcon,
  ListItemText,
  Divider,
  useTheme,
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import ArticleIcon from '@mui/icons-material/Article';
import EditIcon from '@mui/icons-material/Edit';
import LogoutIcon from '@mui/icons-material/Logout';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import InfoIcon from '@mui/icons-material/Info';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ColorModeContext } from '../theme';

const Header = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [name, setName] = useState('');
  const [profilePhoto, setProfilePhoto] = useState('');
  const [openInfoDialog, setOpenInfoDialog] = useState(false);
  const colorMode = useContext(ColorModeContext);
  const theme = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    const uid = localStorage.getItem('uid');
    if (uid) {
      axios
        .get(`${process.env.REACT_APP_BASE_URL}/auth/user/${uid}`)
        .then((response) => {
          const { name, profilePhotoUrl } = response.data;
          setName(name);
          setProfilePhoto(profilePhotoUrl);
          localStorage.setItem('name', name);
          localStorage.setItem('profile', profilePhotoUrl);
        })
        .catch((error) => {
          console.error('Error fetching user details:', error);
        });
    }
  }, []);

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('uid');
    localStorage.removeItem('name');
    localStorage.removeItem('profile');
    setAnchorEl(null);
    navigate('/login');
  };

  const goTo = (path) => {
    setAnchorEl(null);
    navigate(path);
  };

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          backgroundColor: theme.palette.mode === 'light' ? 'rgba(255,255,255,0.85)' : 'rgba(17,26,46,0.85)',
          backdropFilter: 'blur(10px)',
          borderBottom: `1px solid ${theme.palette.divider}`,
          color: 'text.primary',
          mb: 3,
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer' }} onClick={() => navigate('/')}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #4f46e5 0%, #0ea5e9 100%)',
                color: '#fff',
              }}
            >
              <SearchIcon fontSize="small" />
            </Box>
            <Box sx={{ lineHeight: 1.1 }}>
              <Typography variant="subtitle1" fontWeight={800} sx={{ display: 'block' }}>
                Lost &amp; Found
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Campus Community
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {name && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ display: { xs: 'none', sm: 'block' }, mr: 0.5 }}
              >
                {name}
              </Typography>
            )}

            <IconButton onClick={colorMode.toggleColorMode} color="inherit" aria-label="Toggle theme">
              {theme.palette.mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>

            <IconButton onClick={() => setOpenInfoDialog(true)} color="inherit" aria-label="Rules and info">
              <InfoIcon />
            </IconButton>

            <IconButton
              onClick={handleMenuOpen}
              edge="end"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
            >
              {profilePhoto ? (
                <Avatar src={profilePhoto} alt={name} sx={{ width: 38, height: 38 }} />
              ) : (
                <Avatar sx={{ width: 38, height: 38, bgcolor: 'primary.main' }}>
                  {(name || 'U').charAt(0).toUpperCase()}
                </Avatar>
              )}
            </IconButton>
          </Box>

          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            slotProps={{ paper: { sx: { mt: 1, minWidth: 220, borderRadius: 3 } } }}
          >
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant="subtitle2" fontWeight={700}>
                {name || 'User'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {localStorage.getItem('uid') ? 'Signed in' : 'Not signed in'}
              </Typography>
            </Box>
            <Divider />
            <MenuItem onClick={() => goTo('/home')}>
              <ListItemIcon><HomeIcon fontSize="small" /></ListItemIcon>
              <ListItemText>Home</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => goTo('/myprofile')}>
              <ListItemIcon><ArticleIcon fontSize="small" /></ListItemIcon>
              <ListItemText>My Posts</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => goTo('/editprofile')}>
              <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
              <ListItemText>Edit Profile</ListItemText>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
              <ListItemIcon><LogoutIcon fontSize="small" color="error" /></ListItemIcon>
              <ListItemText>Logout</ListItemText>
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Dialog open={openInfoDialog} onClose={() => setOpenInfoDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>Rules &amp; Regulations</DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            Welcome to the Lost and Found app! Please adhere to the following rules:
          </Typography>
          {[
            'Respect other users and their belongings.',
            'Only post items that you have found or lost.',
            'Report any inappropriate content to the admin.',
            'Use the contact options responsibly and cross-check before exchange of items.',
          ].map((rule, index) => (
            <Typography variant="body2" key={rule} sx={{ mb: 0.5 }}>
              {index + 1}. {rule}
            </Typography>
          ))}
          <Typography variant="body2" sx={{ mt: 1 }}>
            By using this app, you agree to abide by these rules.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenInfoDialog(false)} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Header;
