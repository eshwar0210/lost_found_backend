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
  Tooltip,
  TextField,
  InputAdornment,
  List,
  ListItemAvatar,
  ListItemButton,
  CircularProgress,
  useTheme,
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import PostAddIcon from '@mui/icons-material/PostAdd';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import BASE_URL from '../config';
import LogoutIcon from '@mui/icons-material/Logout';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import InfoIcon from '@mui/icons-material/Info';
import SearchIcon from '@mui/icons-material/Search';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ColorModeContext } from '../theme';
import NotificationBell from './NotificationBell';
import { searchUsers } from '../services/chatService';

const Header = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [name, setName] = useState('');
  const [profilePhoto, setProfilePhoto] = useState('');
  const [openInfoDialog, setOpenInfoDialog] = useState(false);
  const [searchQ, setSearchQ] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const colorMode = useContext(ColorModeContext);
  const theme = useTheme();
  const navigate = useNavigate();
  const uid = localStorage.getItem('uid');

  useEffect(() => {
    if (uid) {
      axios
        .get(`${BASE_URL}/auth/user/${uid}`)
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
  }, [uid]);

  useEffect(() => {
    if (!searchFocused) return;
    const delay = setTimeout(async () => {
      setSearching(true);
      try {
        const results = await searchUsers(searchQ.trim());
        setSearchResults(results);
      } catch (error) {
        console.error('Error searching users:', error);
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(delay);
  }, [searchQ, searchFocused]);

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

  const openChatWith = (userUid) => {
    setSearchQ('');
    setSearchResults([]);
    setSearchFocused(false);
    navigate(`/chat?with=${userUid}`);
  };

  const renderSearch = () => (
    <>
      <TextField
        fullWidth
        size="small"
        placeholder="Search people to chat with..."
        value={searchQ}
        onChange={(e) => setSearchQ(e.target.value)}
        onFocus={() => setSearchFocused(true)}
        onBlur={() => setTimeout(() => setSearchFocused(false), 150)}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: 5,
            bgcolor: theme.palette.mode === 'light' ? '#f1f5f9' : 'rgba(255,255,255,0.06)',
          },
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" />
            </InputAdornment>
          ),
        }}
      />
      {searchFocused && (
        <Box
          sx={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            right: 0,
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 3,
            boxShadow: 6,
            zIndex: 1300,
            overflow: 'hidden',
          }}
        >
          {searching ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
              <CircularProgress size={22} />
            </Box>
          ) : (
            <List sx={{ p: 0, maxHeight: 320, overflowY: 'auto' }}>
              {searchResults
                .filter((user) => user.uid !== uid)
                .map((user) => (
                  <ListItemButton
                    key={user.uid}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      openChatWith(user.uid);
                    }}
                    sx={{ px: 1.5 }}
                  >
                    <ListItemAvatar>
                      <Avatar src={user.profilePhotoUrl} alt={user.name} sx={{ width: 34, height: 34 }} />
                    </ListItemAvatar>
                    <ListItemText
                      primary={<Typography variant="body2" fontWeight={600}>{user.name}</Typography>}
                      secondary={user.hostelName ? `Hostel ${user.hostelName}` : user.email}
                      secondaryTypographyProps={{ component: 'div' }}
                    />
                    <ChatBubbleIcon fontSize="small" color="primary" />
                  </ListItemButton>
                ))}
              {!searching && searchResults.filter((user) => user.uid !== uid).length === 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ px: 2, py: 2, textAlign: 'center' }}>
                  {searchQ.trim() ? 'No users found.' : 'Type a name to search.'}
                </Typography>
              )}
            </List>
          )}
        </Box>
      )}
    </>
  );

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
        <Toolbar sx={{ px: { xs: 1.5, sm: 2 } }}>
          <Box
            sx={{
              width: '100%',
              maxWidth: 'lg',
              mx: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: { xs: 1, sm: 2 },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer', flexShrink: 0 }} onClick={() => navigate('/')}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'linear-gradient(135deg, #4f46e5 0%, #0ea5e9 100%)',
                  color: '#fff',
                  boxShadow: `0 4px 12px ${theme.palette.primary.main}55`,
                  transition: 'transform .2s ease',
                  '&:hover': { transform: 'scale(1.05) rotate(-3deg)' },
                }}
              >
                <SearchIcon fontSize="small" />
              </Box>
              <Box sx={{ lineHeight: 1.15, display: { xs: 'none', sm: 'block' } }}>
                <Typography variant="subtitle1" fontWeight={800} sx={{ display: 'block' }}>
                  Lost &amp; Found
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Campus Community
                </Typography>
              </Box>
            </Box>

            <Box sx={{ flexGrow: 1, maxWidth: 460, ml: { xs: 0, sm: 2 }, position: 'relative', display: { xs: 'none', md: 'block' } }}>
              {renderSearch()}
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 'auto' }}>
              <Tooltip title="Toggle theme">
                <IconButton onClick={colorMode.toggleColorMode} color="inherit" aria-label="Toggle theme" sx={{ '&:hover': { color: 'primary.main' } }}>
                  {theme.palette.mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
                </IconButton>
              </Tooltip>

              <NotificationBell />

              <Tooltip title="Rules & regulations">
                <IconButton onClick={() => setOpenInfoDialog(true)} color="inherit" aria-label="Rules and info" sx={{ '&:hover': { color: 'primary.main' } }}>
                  <InfoIcon />
                </IconButton>
              </Tooltip>

              <Typography
                variant="body2"
                fontWeight={600}
                sx={{ mr: 0.5, display: { xs: 'none', sm: 'block' } }}
              >
                Hi, {name || 'there'}
              </Typography>

              <IconButton
                onClick={handleMenuOpen}
                edge="end"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                sx={{ ml: 0.5 }}
              >
                {profilePhoto ? (
                  <Avatar src={profilePhoto} alt={name} sx={{ width: 38, height: 38, border: '2px solid', borderColor: 'primary.light' }} />
                ) : (
                  <Avatar sx={{ width: 38, height: 38, bgcolor: 'primary.main', border: '2px solid', borderColor: 'primary.light' }}>
                    {(name || 'U').charAt(0).toUpperCase()}
                  </Avatar>
                )}
              </IconButton>
            </Box>
          </Box>

          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            slotProps={{ paper: { sx: { mt: 1, minWidth: 240, borderRadius: 3 } } }}
          >
            <Box sx={{ px: 2, py: 1.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
              {profilePhoto ? (
                <Avatar src={profilePhoto} alt={name} />
              ) : (
                <Avatar sx={{ bgcolor: 'primary.main' }}>{(name || 'U').charAt(0).toUpperCase()}</Avatar>
              )}
              <Box>
                <Typography variant="subtitle2" fontWeight={700}>
                  {name || 'User'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {uid ? 'Signed in' : 'Not signed in'}
                </Typography>
              </Box>
            </Box>
            <Divider />
            <MenuItem onClick={() => goTo('/home')} sx={{ borderRadius: 2, mx: 1 }}>
              <ListItemIcon><HomeIcon fontSize="small" /></ListItemIcon>
              <ListItemText>Home</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => goTo('/myprofile')} sx={{ borderRadius: 2, mx: 1 }}>
              <ListItemIcon><PostAddIcon fontSize="small" /></ListItemIcon>
              <ListItemText>My Posts</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => goTo('/chat')} sx={{ borderRadius: 2, mx: 1 }}>
              <ListItemIcon><ChatBubbleIcon fontSize="small" /></ListItemIcon>
              <ListItemText>Messages</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => goTo('/editprofile')} sx={{ borderRadius: 2, mx: 1 }}>
              <ListItemIcon><ManageAccountsIcon fontSize="small" /></ListItemIcon>
              <ListItemText>Edit Profile</ListItemText>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout} sx={{ color: 'error.main', borderRadius: 2, mx: 1 }}>
              <ListItemIcon><LogoutIcon fontSize="small" color="error" /></ListItemIcon>
              <ListItemText>Logout</ListItemText>
            </MenuItem>
          </Menu>
        </Toolbar>

        <Box sx={{ display: { xs: 'block', md: 'none' }, position: 'relative', px: 1.5, pb: 1.25 }}>
          {renderSearch()}
        </Box>
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
