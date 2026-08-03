import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Box,
  Typography,
  List,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Avatar,
  TextField,
  IconButton,
  CircularProgress,
  Divider,
  InputAdornment,
  Badge,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  Tooltip,
  useTheme,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import AddCommentIcon from '@mui/icons-material/AddComment';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import CheckIcon from '@mui/icons-material/Check';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import ScheduleIcon from '@mui/icons-material/Schedule';
import Header from './Header';
import { connectSocket, onSocketEvent } from '../services/socket';
import {
  getConversations,
  getOrCreateConversation,
  getMessages,
  sendMessage,
  markConversationRead,
  searchUsers,
} from '../services/chatService';
import { timeAgo, formatMessageTime, formatDayLabel, formatLastSeen } from '../utils/format';

const Chat = () => {
  const [searchParams] = useSearchParams();
  const theme = useTheme();
  const uid = localStorage.getItem('uid');

  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [activeOther, setActiveOther] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState({});
  const [typingUsers, setTypingUsers] = useState({});
  const [initialWith, setInitialWith] = useState(null);
  const [mobilePane, setMobilePane] = useState('list');

  const [startOpen, setStartOpen] = useState(false);
  const [searchQ, setSearchQ] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const messagesBoxRef = useRef(null);
  const deliveredIdsRef = useRef(new Set());
  const readConvsRef = useRef(new Set());
  const sendingRef = useRef(false);
  const prevLenRef = useRef(0);

  useEffect(() => {
    const withUid = searchParams.get('with');
    if (withUid && withUid !== uid) setInitialWith(withUid);
  }, [searchParams, uid]);

  useEffect(() => {
    if (!uid) return;
    connectSocket(uid);

    const refreshList = async () => {
      try {
        const data = await getConversations(uid);
        setConversations(data);
      } catch (error) {
        console.error('Error fetching conversations:', error);
      } finally {
        setLoading(false);
      }
    };

    refreshList();

    const unsubMessage = onSocketEvent('chat:message', ({ conversationId, message }) => {
      if (conversationId === activeId) {
        setMessages((prev) => {
          const cleaned = prev.filter(
            (m) => !(m._tempId && m.clientId && m.clientId === message.clientId)
          );
          if (cleaned.some((m) => m._id === message._id)) return cleaned;
          return [...cleaned, message];
        });
        if (message.senderUid !== uid) {
          markConversationRead(conversationId, uid);
        }
      } else {
        setConversations((prev) => {
          const existing = prev.find((c) => c._id === conversationId);
          const updated = existing
            ? prev.map((c) =>
                c._id === conversationId
                  ? { ...c, lastMessagePreview: message.text, lastMessageAt: message.createdAt, unreadCount: c.unreadCount + (message.senderUid !== uid ? 1 : 0) }
                  : c
              )
            : prev;
          return updated;
        });
      }
    });

    const unsubDelivered = onSocketEvent('chat:delivered', ({ conversationId, messageId }) => {
      if (conversationId !== activeId) return;
      deliveredIdsRef.current.add(messageId);
      setMessages((prev) => prev.map((m) => (m._id === messageId ? { ...m, delivered: true } : m)));
    });

    const unsubRead = onSocketEvent('chat:read', ({ conversationId }) => {
      if (conversationId !== activeId) return;
      readConvsRef.current.add(conversationId);
      setMessages((prev) => prev.map((m) => (m.senderUid === uid ? { ...m, read: true } : m)));
    });

    const unsubOnline = onSocketEvent('chat:online', ({ uid: onlineUid, online }) => {
      setOnlineUsers((prev) => ({ ...prev, [onlineUid]: online }));
    });

    const unsubPresence = onSocketEvent('presence:init', ({ onlineUids }) => {
      const snapshot = {};
      onlineUids.forEach((onlineUid) => {
        snapshot[onlineUid] = true;
      });
      setOnlineUsers((prev) => ({ ...snapshot, ...prev }));
    });

    const unsubTyping = onSocketEvent('chat:typing', ({ uid: typingUid, conversationId }) => {
      if (conversationId !== activeId) return;
      setTypingUsers((prev) => ({ ...prev, [typingUid]: Date.now() }));
    });

    return () => {
      unsubMessage();
      unsubDelivered();
      unsubRead();
      unsubOnline();
      unsubPresence();
      unsubTyping();
    };
  }, [uid, activeId]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTypingUsers((prev) => {
        const now = Date.now();
        const filtered = {};
        Object.keys(prev).forEach((key) => {
          if (now - prev[key] < 3000) filtered[key] = prev[key];
        });
        return filtered;
      });
    }, 1500);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const len = messages.length;
    if (len > prevLenRef.current) {
      const last = messages[len - 1];
      const isOwn = last && last.senderUid === uid;
      const el = messagesBoxRef.current;
      const nearBottom = !el || el.scrollHeight - el.scrollTop - el.clientHeight < 150;
      if (isOwn || nearBottom) {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    }
    prevLenRef.current = len;
  }, [messages, uid]);

  useEffect(() => {
    if (!startOpen) return;
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
  }, [searchQ, startOpen]);

  const openConversation = useCallback(
    async (conversationId, otherUser, preferSelected) => {
      setActiveId(conversationId);
      setActiveOther(otherUser);
      setMessages([]);
      setMobilePane('chat');

      const socket = connectSocket(uid);
      socket?.emit('chat:join', conversationId);

      try {
        const data = await getMessages(conversationId);
        setMessages(data);
        markConversationRead(conversationId, uid);
        setConversations((prev) =>
          prev.map((c) => (c._id === conversationId ? { ...c, unreadCount: 0 } : c))
        );
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
      if (preferSelected && inputRef.current) inputRef.current.focus();
    },
    [uid]
  );

  useEffect(() => {
    if (!initialWith) return;
    getOrCreateConversation(uid, initialWith)
      .then(({ conversation, otherUser }) => {
        setInitialWith(null);
        setConversations((prev) => {
          if (prev.some((c) => c._id === conversation._id)) return prev;
          return [{ ...conversation, otherUser, unreadCount: 0 }, ...prev];
        });
        openConversation(conversation._id, otherUser, true);
      })
      .catch((error) => {
        console.error('Error starting conversation:', error);
        setInitialWith(null);
      });
  }, [initialWith, uid, openConversation]);

  const handleStartChat = async (user) => {
    setStartOpen(false);
    try {
      const { conversation, otherUser } = await getOrCreateConversation(uid, user.uid);
      setConversations((prev) =>
        prev.some((c) => c._id === conversation._id)
          ? prev
          : [{ ...conversation, otherUser, unreadCount: 0 }, ...prev]
      );
      openConversation(conversation._id, otherUser, true);
    } catch (error) {
      console.error('Error starting conversation:', error);
    }
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || !activeId || sendingRef.current) return;
    sendingRef.current = true;
    setInput('');
    const tempId = `temp-${Date.now()}`;
    const clientId = `c-${uid}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const optimistic = {
      _id: tempId,
      _tempId: tempId,
      clientId,
      conversationId: activeId,
      senderUid: uid,
      text,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);

    try {
      const saved = await sendMessage({ conversationId: activeId, text, clientId });
      setMessages((prev) => {
        const cleaned = prev.filter((m) => m._tempId !== tempId);
        if (cleaned.some((m) => m._id === saved._id)) return cleaned;
        const delivered = deliveredIdsRef.current.has(saved._id);
        const read = readConvsRef.current.has(activeId);
        return [...cleaned, { ...saved, delivered, read }];
      });
      setConversations((prev) =>
        prev.map((c) =>
          c._id === activeId
            ? { ...c, lastMessagePreview: text, lastMessageAt: saved.createdAt }
            : c
        )
      );
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages((prev) => prev.filter((m) => m._tempId !== tempId));
      setInput((prev) => (prev ? prev : text));
    } finally {
      sendingRef.current = false;
    }
  };

  const handleTyping = () => {
    const socket = connectSocket(uid);
    socket?.emit('chat:typing', { conversationId: activeId });
  };

  const otherOnline = activeOther ? !!onlineUsers[activeOther.uid] : false;
  const activeTyping = activeOther && typingUsers[activeOther.uid] ? true : false;

  const chatBg = theme.palette.mode === 'light'
    ? { backgroundColor: '#ececec', backgroundImage: 'radial-gradient(rgba(0,0,0,0.04) 1px, transparent 1px)', backgroundSize: '22px 22px' }
    : { backgroundColor: '#111417', backgroundImage: 'radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize: '22px 22px' };

  let lastDayKey = null;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <Box sx={{ flexGrow: 1, width: '100%', maxWidth: 'lg', mx: 'auto', px: { xs: 1, sm: 2 } }}>
          <Box
            sx={{
              display: 'flex',
              gap: { md: 2 },
              height: 'calc(100dvh - 90px)',
              minHeight: 520,
              overflow: 'hidden',
            }}
          >
          <Box
            sx={{
              width: { xs: '100%', md: 340 },
              flexShrink: 0,
              border: { md: '1px solid' },
              borderColor: 'divider',
              borderRadius: { md: 3 },
              overflow: 'hidden',
              bgcolor: 'background.paper',
              display: { xs: mobilePane === 'list' ? 'flex' : 'none', md: 'flex' },
              flexDirection: 'column',
              flex: { xs: '1 1 100%', md: '0 0 340px' },
            }}
          >
            <Box
              sx={{
                px: 2,
                py: 1.5,
                borderBottom: '1px solid',
                borderColor: 'divider',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                bgcolor: theme.palette.mode === 'light' ? '#f8fafc' : 'background.paper',
              }}
            >
              <Typography variant="h6" fontWeight={800}>
                Chats
              </Typography>
              <Tooltip title="Start a new conversation">
                <IconButton size="small" onClick={() => setStartOpen(true)} color="primary">
                  <AddCommentIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
            <Box sx={{ overflowY: 'auto', flexGrow: 1 }}>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                  <CircularProgress size={28} />
                </Box>
              ) : conversations.length === 0 ? (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <ChatBubbleOutlineIcon sx={{ fontSize: 44, mb: 1, opacity: 0.5 }} />
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    No conversations yet.
                  </Typography>
                  <Button size="small" variant="outlined" onClick={() => setStartOpen(true)} sx={{ textTransform: 'none' }}>
                    Start a conversation
                  </Button>
                </Box>
              ) : (
                <List sx={{ p: 0 }}>
                  {conversations.map((conversation) => {
                    const isActive = conversation._id === activeId;
                    const isOnline = !!onlineUsers[conversation.otherUser.uid];
                    const unread = conversation.unreadCount || 0;
                    return (
                      <React.Fragment key={conversation._id}>
                        <ListItemButton
                          onClick={() => openConversation(conversation._id, conversation.otherUser, false)}
                          sx={{
                            px: 2,
                            py: 1.25,
                            bgcolor: isActive ? 'action.selected' : 'transparent',
                            '&:hover': { bgcolor: isActive ? 'action.selected' : 'action.hover' },
                          }}
                        >
                          <ListItemAvatar>
                            <Badge
                              overlap="circular"
                              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                              variant="dot"
                              color="success"
                              invisible={!isOnline}
                            >
                              <Avatar src={conversation.otherUser.profilePhotoUrl} alt={conversation.otherUser.name} />
                            </Badge>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Box display="flex" alignItems="center" justifyContent="space-between" gap={1}>
                                <Typography variant="subtitle2" fontWeight={unread > 0 ? 800 : 600} noWrap>
                                  {conversation.otherUser.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>
                                  {timeAgo(conversation.lastMessageAt)}
                                </Typography>
                              </Box>
                            }
                            secondary={
                              <Box display="flex" alignItems="center" justifyContent="space-between" gap={1}>
                                <Typography
                                  variant="body2"
                                  color={unread > 0 ? 'text.primary' : 'text.secondary'}
                                  noWrap
                                  fontWeight={unread > 0 ? 700 : 400}
                                >
                                  {conversation.lastMessagePreview || 'Say hello'}
                                </Typography>
                                {unread > 0 && (
                                  <Box
                                    sx={{
                                      minWidth: 20,
                                      height: 20,
                                      borderRadius: 10,
                                      bgcolor: 'primary.main',
                                      color: 'primary.contrastText',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      fontSize: '0.7rem',
                                      fontWeight: 800,
                                      px: 0.5,
                                      flexShrink: 0,
                                    }}
                                  >
                                    {unread}
                                  </Box>
                                )}
                              </Box>
                            }
                            secondaryTypographyProps={{ component: 'div' }}
                          />
                        </ListItemButton>
                        <Divider sx={{ '&:last-child': { display: 'none' } }} />
                      </React.Fragment>
                    );
                  })}
                </List>
              )}
            </Box>
          </Box>

          <Box
            sx={{
              flexGrow: 1,
              display: { xs: mobilePane === 'chat' ? 'flex' : 'none', md: 'flex' },
              flexDirection: 'column',
              border: { md: '1px solid' },
              borderColor: 'divider',
              borderRadius: { md: 3 },
              overflow: 'hidden',
              bgcolor: 'background.paper',
              minWidth: 0,
            }}
          >
            {!activeId ? (
              <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'text.secondary', p: 4 }}>
                <Box
                  sx={{
                    width: 90,
                    height: 90,
                    borderRadius: 6,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2,
                    bgcolor: theme.palette.mode === 'light' ? '#eef2ff' : 'rgba(255,255,255,0.06)',
                    color: 'primary.main',
                  }}
                >
                  <ChatBubbleOutlineIcon sx={{ fontSize: 46 }} />
                </Box>
                <Typography variant="body1" fontWeight={600} color="text.primary">
                  Your messages
                </Typography>
                <Typography variant="body2" align="center" sx={{ maxWidth: 320, mt: 0.5 }}>
                  Pick a conversation to start chatting, or find someone new from the community.
                </Typography>
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<AddCommentIcon />}
                  onClick={() => setStartOpen(true)}
                  sx={{ mt: 2, borderRadius: 4, textTransform: 'none' }}
                >
                  Start a chat
                </Button>
              </Box>
            ) : (
              <>
                <Box
                  sx={{
                    px: 1.5,
                    py: 1,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    bgcolor: theme.palette.mode === 'light' ? '#f8fafc' : 'background.paper',
                  }}
                >
                  <IconButton
                    size="small"
                    onClick={() => setMobilePane('list')}
                    sx={{ display: { md: 'none' }, mr: 0.5 }}
                  >
                    <ArrowBackIcon />
                  </IconButton>
                  <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    variant="dot"
                    color="success"
                    invisible={!otherOnline}
                  >
                    <Avatar src={activeOther?.profilePhotoUrl} alt={activeOther?.name} sx={{ width: 40, height: 40 }} />
                  </Badge>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={700} lineHeight={1.2}>
                      {activeOther?.name}
                    </Typography>
                    <Typography variant="caption" color={otherOnline ? 'success.main' : 'text.secondary'} fontWeight={otherOnline ? 600 : 400}>
                      {activeTyping ? 'typing...' : otherOnline ? 'Online' : formatLastSeen(activeOther?.lastSeenAt) || 'Offline'}
                    </Typography>
                  </Box>
                </Box>

                <Box ref={messagesBoxRef} sx={{ flexGrow: 1, overflowY: 'auto', px: { xs: 1.5, md: 3 }, py: 2, ...chatBg }}>
                  {messages.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 6 }}>
                      No messages yet. Say hello!
                    </Typography>
                  ) : (
                    messages.map((message) => {
                      const mine = message.senderUid === uid;
                      const dayKey = new Date(message.createdAt).toDateString();
                      const showDay = dayKey !== lastDayKey;
                      lastDayKey = dayKey;
                      return (
                        <React.Fragment key={message._id}>
                          {showDay && (
                            <Box sx={{ display: 'flex', justifyContent: 'center', my: 1.5 }}>
                              <Typography
                                variant="caption"
                                sx={{
                                  px: 1.5,
                                  py: 0.5,
                                  borderRadius: 6,
                                  bgcolor: 'background.paper',
                                  border: '1px solid',
                                  borderColor: 'divider',
                                  color: 'text.secondary',
                                  fontWeight: 600,
                                  boxShadow: 1,
                                }}
                              >
                                {formatDayLabel(message.createdAt)}
                              </Typography>
                            </Box>
                          )}
                          <Box
                            sx={{
                              display: 'flex',
                              gap: 1,
                              mb: 0.75,
                              justifyContent: mine ? 'flex-end' : 'flex-start',
                              alignItems: 'flex-end',
                            }}
                          >
                            {!mine && (
                              <Avatar
                                src={activeOther?.profilePhotoUrl}
                                alt={activeOther?.name}
                                sx={{ width: 26, height: 26, flexShrink: 0, mb: 0.5 }}
                              />
                            )}
                            <Box
                              sx={{
                                maxWidth: { xs: '82%', md: '65%' },
                                px: 1.5,
                                py: 0.75,
                                borderRadius: mine ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                                bgcolor: mine ? 'primary.main' : 'background.paper',
                                color: mine ? 'primary.contrastText' : 'text.primary',
                                boxShadow: 1,
                                border: mine ? 'none' : '1px solid',
                                borderColor: 'divider',
                              }}
                            >
                              <Typography variant="body2" sx={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
                                {message.text}
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.25, mt: 0.25 }}>
                                <Typography
                                  variant="caption"
                                  sx={{
                                    fontSize: '0.65rem',
                                    lineHeight: 1,
                                    color: mine ? 'rgba(255,255,255,0.75)' : 'text.secondary',
                                  }}
                                >
                                  {formatMessageTime(message.createdAt)}
                                </Typography>
                                {mine &&
                                  (message._tempId ? (
                                    <ScheduleIcon sx={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.55)' }} />
                                  ) : message.read || readConvsRef.current.has(activeId) ? (
                                    <DoneAllIcon sx={{ fontSize: '0.95rem', color: '#a9d3ff' }} />
                                  ) : message.delivered || deliveredIdsRef.current.has(message._id) ? (
                                    <DoneAllIcon sx={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.85)' }} />
                                  ) : (
                                    <CheckIcon sx={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.85)' }} />
                                  ))}
                              </Box>
                            </Box>
                          </Box>
                        </React.Fragment>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </Box>

                <Box sx={{ px: 1.5, py: 1.25, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
                  <TextField
                    inputRef={inputRef}
                    fullWidth
                    size="small"
                    placeholder="Type a message..."
                    value={input}
                    onChange={(e) => {
                      setInput(e.target.value);
                      handleTyping();
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 5 } }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={handleSend} disabled={!input.trim()} color="primary">
                            <SendIcon />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>
              </>
            )}
          </Box>
        </Box>
      </Box>

      <Dialog open={startOpen} onClose={() => setStartOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 700 }}>Start a New Conversation</DialogTitle>
        <DialogContent sx={{ pb: 2 }}>
          <TextField
            fullWidth
            autoFocus
            size="small"
            placeholder="Search users by name..."
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
            sx={{ mb: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
          {searching ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress size={26} />
            </Box>
          ) : (
            <List sx={{ p: 0, maxHeight: 320, overflowY: 'auto' }}>
              {searchResults
                .filter((user) => user.uid !== uid)
                .map((user) => (
                  <ListItemButton key={user.uid} onClick={() => handleStartChat(user)} sx={{ borderRadius: 2 }}>
                    <ListItemAvatar>
                      <Avatar src={user.profilePhotoUrl} alt={user.name} />
                    </ListItemAvatar>
                    <ListItemText
                      primary={<Typography variant="subtitle2" fontWeight={600}>{user.name}</Typography>}
                      secondary={user.hostelName ? `Hostel ${user.hostelName}` : user.email}
                      secondaryTypographyProps={{ component: 'div' }}
                    />
                  </ListItemButton>
                ))}
              {!searching && searchResults.filter((user) => user.uid !== uid).length === 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                  {searchQ.trim() ? 'No users found.' : 'Type a name to search the community.'}
                </Typography>
              )}
            </List>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Chat;
