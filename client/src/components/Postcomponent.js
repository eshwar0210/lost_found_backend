import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  Avatar,
  Button,
  TextField,
  Collapse,
  CircularProgress,
  Divider,
  IconButton,
  Chip,
  InputAdornment,
  Tooltip,
  Snackbar,
  Alert,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SendIcon from '@mui/icons-material/Send';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ScheduleIcon from '@mui/icons-material/Schedule';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import LinkIcon from '@mui/icons-material/Link';
import ImageCarousel from './ImageCarousel';
import { timeAgo } from '../utils/format';
import { useNavigate } from 'react-router-dom';
import BASE_URL from '../config';
import { authHeaders } from '../services/api';

const PostComponent = ({ post }) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [commentLoading, setCommentLoading] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editedComment, setEditedComment] = useState('');
  const [shareSnackbar, setShareSnackbar] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`${BASE_URL}/auth/user/${post.uid}`);
        const data = await response.json();
        setProfilePhoto(data.profilePhotoUrl);
        setEmail(data.email);
        setName(data.name);
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUser();
  }, [post.uid]);

  useEffect(() => {
    setComments(post.comments || []);
  }, [post.comments]);

  const handleCommentSubmit = async () => {
    if (newComment.trim() === '') return;

    const userId = localStorage.getItem('uid');
    const userName = localStorage.getItem('name');
    const tempId = `temp-${Date.now()}`;

    const optimistic = { _tempId: tempId, userId, userName, comment: newComment };
    setComments((prevComments) => [...prevComments, optimistic]);
    setNewComment('');

    try {
      const response = await fetch(`${BASE_URL}/post/${post._id}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(await authHeaders()) },
        body: JSON.stringify({ userId, userName, comment: newComment }),
      });

      if (!response.ok) {
        throw new Error('Failed to add comment');
      }

      const data = await response.json();
      const saved = data.comment;
      setComments((prevComments) =>
        prevComments.map((c) => (c._tempId === tempId ? saved : c))
      );
    } catch (error) {
      console.error('Error adding comment:', error);
      setComments((prevComments) => prevComments.filter((c) => c._tempId !== tempId));
    }
  };

  const handleSaveEditedComment = async (commentId) => {
    if (editedComment.trim() === '') return;

    setCommentLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/post/${post._id}/comment/${commentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...(await authHeaders()) },
        body: JSON.stringify({ comment: editedComment }),
      });

      if (!response.ok) {
        throw new Error('Failed to edit comment');
      }

      setComments((prevComments) =>
        prevComments.map((comment) =>
          comment._id === commentId ? { ...comment, comment: editedComment } : comment
        )
      );
      setEditingCommentId(null);
    } catch (error) {
      console.error('Error editing comment:', error);
    } finally {
      setCommentLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    setCommentLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/post/${post._id}/comment/${commentId}`, {
        method: 'DELETE',
        headers: await authHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to delete comment');
      }

      setComments((prevComments) => prevComments.filter((comment) => comment._id !== commentId));
    } catch (error) {
      console.error('Error deleting comment:', error);
    } finally {
      setCommentLoading(false);
    }
  };

  const isLost = post.postType === 'lost';
  const currentUserId = localStorage.getItem('uid');
  const isSmallScreen = useMediaQuery('(max-width:600px)');
  const theme = useTheme();
  const navigate = useNavigate();

  const handleMessage = () => {
    if (post.uid === currentUserId) return;
    navigate(`/chat?with=${post.uid}`);
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/post/${post._id}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch (error) {
      console.error('Clipboard copy failed:', error);
    }
    setShareSnackbar(true);
  };

  return (
    <Card
      sx={{
        mb: 3,
        p: { xs: 2, sm: 3 },
        overflow: 'hidden',
        transition: 'box-shadow .2s ease, transform .2s ease',
        '&:hover': {
          boxShadow:
            theme.palette.mode === 'light'
              ? '0 8px 24px rgba(15, 23, 42, 0.10)'
              : '0 8px 24px rgba(0, 0, 0, 0.45)',
          transform: 'translateY(-2px)',
        },
      }}
    >
      <Box display="flex" alignItems="center" mb={2}>
        <Avatar
          src={profilePhoto}
          alt={name}
          sx={{ width: 50, height: 50, border: '2px solid', borderColor: 'primary.light' }}
        />
        <Box ml={1.5} sx={{ flexGrow: 1, minWidth: 0 }}>
          {loadingUser ? (
            <CircularProgress size={18} />
          ) : (
            <Typography
              variant="subtitle1"
              fontWeight={700}
              component={Link}
              to={`/profile/${post.uid}`}
              sx={{ textDecoration: 'none', color: 'inherit', lineHeight: 1.3, '&:hover': { color: 'primary.main' } }}
            >
              {name}
            </Typography>
          )}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4, mt: 0.3 }}>
            <ScheduleIcon sx={{ fontSize: 13, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary" noWrap>
              {timeAgo(post.createdAt)}
            </Typography>
          </Box>
        </Box>
        <Chip
          label={post.postType.charAt(0).toUpperCase() + post.postType.slice(1)}
          size="small"
          variant="filled"
          sx={{
            fontWeight: 700,
            color: isLost ? 'error.main' : 'success.main',
            bgcolor: isLost ? 'rgba(225, 29, 72, 0.12)' : 'rgba(22, 163, 74, 0.12)',
            '& .MuiChip-label': { px: 1.5 },
          }}
        />
      </Box>

      <Box display="flex" alignItems="center" gap={0.5} mb={1} color="text.secondary">
        <LocationOnIcon fontSize="small" />
        <Typography variant="body2">{post.location}</Typography>
      </Box>

      {post.description && (
        <Typography variant="body1" sx={{ mb: 2, whiteSpace: 'pre-wrap' }}>
          {post.description}
        </Typography>
      )}

      {post.imageUrls && post.imageUrls.length > 0 && (
        <Box mb={2}>
          <ImageCarousel images={post.imageUrls} height={isSmallScreen ? 220 : 300} />
        </Box>
      )}

      <Divider sx={{ my: 2 }} />

      <Box
        sx={{
          display: 'flex',
          gap: 1,
          flexWrap: 'wrap',
        }}
      >
        <Button
          variant="text"
          onClick={() => setShowComments(!showComments)}
          startIcon={<ChatBubbleOutlineIcon />}
          sx={{ color: 'text.primary', flex: 1, minWidth: { xs: '100%', sm: 0 }, borderRadius: 2 }}
        >
          {comments.length > 0 ? `${comments.length} Comments` : 'Comments'}
        </Button>
        {post.uid !== currentUserId && (
          <Button
            variant="contained"
            color="primary"
            startIcon={!isSmallScreen && <ChatBubbleIcon />}
            onClick={handleMessage}
            sx={{ flex: 1, borderRadius: 2 }}
          >
            {isSmallScreen ? <ChatBubbleIcon /> : 'Message'}
          </Button>
        )}
        <Button
          variant="contained"
          color="error"
          startIcon={!isSmallScreen && <EmailIcon />}
          onClick={() => window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${email}`, '_blank')}
          sx={{ flex: 1, borderRadius: 2 }}
        >
          {isSmallScreen ? <EmailIcon /> : 'Email'}
        </Button>
        <Button
          variant="outlined"
          color="inherit"
          startIcon={!isSmallScreen && <LinkIcon />}
          onClick={handleShare}
          sx={{ flex: 1, borderRadius: 2 }}
        >
          {isSmallScreen ? <LinkIcon /> : 'Share'}
        </Button>
      </Box>

      <Collapse in={showComments} timeout="auto">
        <Divider sx={{ my: 2 }} />
        <Box>
          {comments.length === 0 ? (
            <Typography variant="body2" color="text.secondary" mb={1}>
              No comments yet. Be the first to comment!
            </Typography>
          ) : (
            comments.map((comment) => (
              <Box key={comment._id} mb={2}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography
                    variant="subtitle2"
                    fontWeight={700}
                    component={Link}
                    to={`/profile/${comment.userId}`}
                    sx={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    {comment.userName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {timeAgo(comment.createdAt)}
                  </Typography>
                </Box>

                {editingCommentId === comment._id ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                    <TextField
                      variant="outlined"
                      value={editedComment}
                      onChange={(e) => setEditedComment(e.target.value)}
                      fullWidth
                      size="small"
                    />
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      disabled={commentLoading}
                      onClick={() => handleSaveEditedComment(comment._id)}
                    >
                      {commentLoading ? <CircularProgress size={16} color="inherit" /> : 'Save'}
                    </Button>
                    <IconButton size="small" onClick={() => setEditingCommentId(null)} color="inherit">
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ) : (
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="body2" sx={{ flexGrow: 1 }}>
                      {comment.comment}
                    </Typography>
                    {comment.userId === currentUserId && (
                      <Box display="flex">
                        <Tooltip title="Edit comment">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setEditingCommentId(comment._id);
                              setEditedComment(comment.comment);
                            }}
                          >
                            <EditIcon sx={{ fontSize: 16, color: 'success.main' }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete comment">
                          <IconButton size="small" onClick={() => handleDeleteComment(comment._id)}>
                            <DeleteIcon sx={{ fontSize: 16, color: 'error.main' }} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    )}
                  </Box>
                )}
              </Box>
            ))
          )}
        </Box>

        <Box display="flex" alignItems="center" gap={1}>
          <TextField
            label="Add a comment..."
            variant="outlined"
            size="small"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            fullWidth
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCommentSubmit();
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={handleCommentSubmit} edge="end">
                    <SendIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Box>
      </Collapse>

      <Snackbar
        open={shareSnackbar}
        autoHideDuration={2500}
        onClose={() => setShareSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setShareSnackbar(false)} severity="success" variant="filled">
          Link copied to clipboard!
        </Alert>
      </Snackbar>
    </Card>
  );
};

export default PostComponent;
