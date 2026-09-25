import React, { useState, useEffect, useContext } from 'react';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  ToggleButton,
  ToggleButtonGroup,
  useTheme,
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import PostAddIcon from '@mui/icons-material/PostAdd';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import BASE_URL, { ADMIN_EMAIL, mailtoLink } from '../config';
import LogoutIcon from '@mui/icons-material/Logout';
import InfoIcon from '@mui/icons-material/Info';
import SettingsIcon from '@mui/icons-material/Settings';
import BrightnessAutoIcon from '@mui/icons-material/BrightnessAuto';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import EmailIcon from '@mui/icons-material/Email';
import SearchIcon from '@mui/icons-material/Search';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import NotificationBell from './NotificationBell';
import UserAvatar from './UserAvatar';
import RulesDialog from './RulesDialog';
import { ColorModeContext } from '../theme';
import { searchUsers } from '../services/chatService';

const Header = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [name, setName] = useState('');
  const [profilePhoto, setProfilePhoto] = useState('');
  const [openInfoDialog, setOpenInfoDialog] = useState(false);
  const [openSettingsDialog, setOpenSettingsDialog] = useState(false);
  const [searchQ, setSearchQ] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);
  const navigate = useNavigate();
  const location = useLocation();
  const uid = localStorage.getItem('uid');

  const navItems = [
    { label: 'Home', to: '/home', icon: <HomeIcon fontSize="small" /> },
    { label: 'My Posts', to: '/myprofile', icon: <PostAddIcon fontSize="small" /> },
    { label: 'Messages', to: '/chat', icon: <ChatBubbleIcon fontSize="small" /> },
  ];

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

  const renderNav = (showLabels) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      {navItems.map((item) => {
        const active = location.pathname === item.to;
        const activeBg =
          theme.palette.mode === 'light' ? 'rgba(79, 70, 229, 0.08)' : 'rgba(129, 140, 248, 0.15)';
        return (
          <Button
            key={item.to}
            onClick={() => navigate(item.to)}
            startIcon={showLabels ? item.icon : undefined}
            aria-label={item.label}
            aria-current={active ? 'page' : undefined}
            sx={{
              minWidth: showLabels ? undefined : 38,
              px: showLabels ? 1.75 : 1,
              borderRadius: 5,
              color: active ? 'primary.main' : 'text.secondary',
              bgcolor: active ? activeBg : 'transparent',
              '&:hover': { color: 'primary.main', bgcolor: activeBg },
            }}
          >
            {showLabels ? item.label : item.icon}
          </Button>
        );
      })}
    </Box>
  );

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
                      <UserAvatar src={user.profilePhotoUrl} name={user.name} sx={{ width: 34, height: 34 }} />
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

            <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
              {renderNav(true)}
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 'auto' }}>
              <NotificationBell />

              <Tooltip title="Rules & regulations" arrow placement="bottom">
                <IconButton
                  onClick={() => setOpenInfoDialog(true)}
                  color="inherit"
                  aria-label="Rules and info"
                  sx={{
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      color: 'primary.main',
                      backgroundColor:
                        theme.palette.mode === 'light'
                          ? 'rgba(79, 70, 229, 0.08)'
                          : 'rgba(129, 140, 248, 0.15)',
                      transform: 'scale(1.08)',
                    },
                  }}
                >
                  <InfoIcon />
                </IconButton>
              </Tooltip>

              <Tooltip title="Settings" arrow placement="bottom">
                <IconButton
                  onClick={() => setOpenSettingsDialog(true)}
                  color="inherit"
                  aria-label="Toggle theme and settings"
                  sx={{
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      color: 'primary.main',
                      backgroundColor:
                        theme.palette.mode === 'light'
                          ? 'rgba(79, 70, 229, 0.08)'
                          : 'rgba(129, 140, 248, 0.15)',
                      transform: 'scale(1.08)',
                    },
                  }}
                >
                  <SettingsIcon />
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
              >
                <UserAvatar
                  src={profilePhoto}
                  name={name}
                  sx={{ width: 38, height: 38, border: '2px solid', borderColor: 'primary.light' }}
                />
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
                <UserAvatar src={profilePhoto} name={name} />
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

        <Box sx={{ display: { xs: 'block', md: 'none' }, px: 1.5, pb: 1.25 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ flexGrow: 1, minWidth: 0, position: 'relative' }}>{renderSearch()}</Box>
            {renderNav(false)}
          </Box>
        </Box>
      </AppBar>

      <Dialog
        open={openSettingsDialog}
        onClose={() => setOpenSettingsDialog(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Settings</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Appearance
          </Typography>
          <ToggleButtonGroup
            exclusive
            fullWidth
            size="small"
            value={colorMode.preference}
            onChange={(_, value) => value && colorMode.setPreference(value)}
            sx={{ mb: 1 }}
          >
            <ToggleButton value="system" aria-label="Match system theme">
              <BrightnessAutoIcon fontSize="small" />
              <Box component="span" sx={{ ml: 0.5, display: { xs: 'none', sm: 'inline' } }}>
                System
              </Box>
            </ToggleButton>
            <ToggleButton value="light" aria-label="Light theme">
              <LightModeIcon fontSize="small" />
              <Box component="span" sx={{ ml: 0.5, display: { xs: 'none', sm: 'inline' } }}>
                Light
              </Box>
            </ToggleButton>
            <ToggleButton value="dark" aria-label="Dark theme">
              <DarkModeIcon fontSize="small" />
              <Box component="span" sx={{ ml: 0.5, display: { xs: 'none', sm: 'inline' } }}>
                Dark
              </Box>
            </ToggleButton>
          </ToggleButtonGroup>

          <Divider sx={{ my: 1.5 }} />

          <List disablePadding>
            <ListItemButton
              component="a"
              href={mailtoLink(ADMIN_EMAIL, 'Lost & Found - Support Request')}
              onClick={() => setOpenSettingsDialog(false)}
              sx={{ borderRadius: 2 }}
            >
              <ListItemIcon>
                <EmailIcon />
              </ListItemIcon>
              <ListItemText primary="Contact admin" secondary={ADMIN_EMAIL} />
            </ListItemButton>
            <ListItemButton onClick={() => setOpenInfoDialog(true)} sx={{ borderRadius: 2 }}>
              <ListItemIcon>
                <InfoIcon />
              </ListItemIcon>
              <ListItemText
                primary="Rules & disclaimer"
                secondary="Community guidelines and reporting policy"
              />
            </ListItemButton>
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSettingsDialog(false)} color="inherit">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <RulesDialog open={openInfoDialog} onClose={() => setOpenInfoDialog(false)} />
    </>
  );
};

export default Header;
