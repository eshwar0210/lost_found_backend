import React, { useState, useEffect, useRef } from 'react';
import {
  Badge,
  Box,
  IconButton,
  Popover,
  Typography,
  Button,
  Divider,
  List,
  ListItemButton,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ChatIcon from '@mui/icons-material/Chat';
import CommentIcon from '@mui/icons-material/Comment';
import { useNavigate } from 'react-router-dom';
import { connectSocket, onSocketEvent } from '../services/socket';
import {
  getUnreadCount,
  getNotifications,
  markAllNotificationsRead,
} from '../services/notificationService';
import { timeAgo } from '../utils/format';

const NotificationBell = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [unread, setUnread] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const socketRef = useRef(null);
  const navigate = useNavigate();

  const uid = localStorage.getItem('uid');

  useEffect(() => {
    if (!uid) return;

    socketRef.current = connectSocket(uid);

    const refreshUnread = () => {
      getUnreadCount(uid).then(setUnread).catch(() => {});
    };

    refreshUnread();

    const unsub = onSocketEvent('notifications:new', (notification) => {
      if (notification && notification.recipientUid === uid) {
        setUnread((prev) => prev + 1);
        setNotifications((prev) => [notification, ...prev]);
      }
    });

    return () => unsub();
  }, [uid]);

  const openPopover = async (event) => {
    setAnchorEl(event.currentTarget);
    setLoading(true);
    try {
      const data = await getNotifications(uid);
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead(uid);
      setUnread(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (error) {
      console.error('Error marking all read:', error);
    }
  };

  const handleOpen = (notification) => {
    setAnchorEl(null);
    if (notification.type === 'chat') {
      navigate(`/chat?with=${notification.fromUid}`);
    } else {
      navigate('/home');
    }
  };

  const iconFor = (type) =>
    type === 'chat' ? <ChatIcon fontSize="small" /> : <CommentIcon fontSize="small" />;

  return (
    <>
      <Tooltip title="Notifications">
        <IconButton onClick={openPopover} color="inherit" aria-label="Notifications">
          <Badge badgeContent={unread} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
      </Tooltip>

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: { mt: 1, width: 360, maxHeight: 420, borderRadius: 3, display: 'flex', flexDirection: 'column' },
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1.5 }}>
          <Typography variant="subtitle1" fontWeight={800}>
            Notifications
          </Typography>
          {unread > 0 && (
            <Button size="small" onClick={handleMarkAllRead}>
              Mark all read
            </Button>
          )}
        </Box>
        <Divider />
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={28} />
          </Box>
        ) : notifications.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ p: 3, textAlign: 'center' }}>
            No notifications yet.
          </Typography>
        ) : (
          <List sx={{ flexGrow: 1, overflowY: 'auto', p: 0 }}>
            {notifications.map((notification) => (
              <ListItemButton
                key={notification._id}
                alignItems="flex-start"
                onClick={() => handleOpen(notification)}
                sx={{
                  px: 2,
                  py: 1.5,
                  bgcolor: notification.read ? 'transparent' : 'action.hover',
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <ListItemAvatar>
                  <Avatar
                    sx={{ width: 36, height: 36, bgcolor: notification.type === 'chat' ? 'primary.main' : 'success.main' }}
                  >
                    {iconFor(notification.type)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography variant="body2" fontWeight={notification.read ? 400 : 700} sx={{ wordBreak: 'break-word' }}>
                      {notification.type === 'chat'
                        ? `${notification.fromName} messaged you:`
                        : `${notification.fromName} commented on your post:`}
                    </Typography>
                  }
                  secondary={
                    <>
                      <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-word' }}>
                        {notification.text}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {timeAgo(notification.createdAt)}
                      </Typography>
                    </>
                  }
                />
              </ListItemButton>
            ))}
          </List>
        )}
      </Popover>
    </>
  );
};

export default NotificationBell;
