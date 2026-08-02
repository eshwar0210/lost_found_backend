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
  useMediaQuery,
} from '@mui/material';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import EmailIcon from '@mui/icons-material/Email';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SendIcon from '@mui/icons-material/Send';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ForumIcon from '@mui/icons-material/Forum';
import ImageCarousel from './ImageCarousel';
import { timeAgo } from '../utils/format';

const PostComponent = ({ post }) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [commentLoading, setCommentLoading] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editedComment, setEditedComment] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_BASE_URL}/auth/user/${post.uid}`);
        const data = await response.json();
        setProfilePhoto(data.profilePhotoUrl);
        setWhatsapp(data.whatsappNumber);
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

    setCommentLoading(true);
    const userId = localStorage.getItem('uid');
    const userName = localStorage.getItem('name');

    const newCommentObj = { userId, userName, comment: newComment };
    setComments((prevComments) => [...prevComments, newCommentObj]);
    setNewComment('');

    try {
      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/post/${post._id}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCommentObj),
      });

      if (!response.ok) {
        throw new Error('Failed to add comment');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      setComments((prevComments) => prevComments.slice(0, -1));
    } finally {
      setCommentLoading(false);
    }
  };

  const handleSaveEditedComment = async (commentId) => {
    if (editedComment.trim() === '') return;

    setCommentLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/post/${post._id}/comment/${commentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
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
      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/post/${post._id}/comment/${commentId}`, {
        method: 'DELETE',
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
  const typeColor = isLost ? 'error' : 'success';
  const currentUserId = localStorage.getItem('uid');
  const isSmallScreen = useMediaQuery('(max-width:600px)');

  return (
    <Card sx={{ mb: 3, p: { xs: 2, sm: 3 }, overflow: 'hidden' }}>
      <Box display="flex" alignItems="center" mb={2}>
        <Avatar src={profilePhoto} alt={name} sx={{ width: 48, height: 48 }} />
        <Box ml={1.5} sx={{ flexGrow: 1 }}>
          {loadingUser ? (
            <CircularProgress size={18} />
          ) : (
            <Typography
              variant="subtitle1"
              fontWeight={700}
              component={Link}
              to={`/profile/${post.uid}`}
              sx={{ textDecoration: 'none', color: 'inherit' }}
            >
              {name}
            </Typography>
          )}
          <Typography variant="caption" color="text.secondary">
            {timeAgo(post.createdAt)}
          </Typography>
        </Box>
        <Chip
          label={post.postType.charAt(0).toUpperCase() + post.postType.slice(1)}
          size="small"
          color={typeColor}
          variant="filled"
          sx={{ fontWeight: 600 }}
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
          startIcon={<ForumIcon />}
          sx={{ color: 'text.primary', flex: 1, minWidth: { xs: '100%', sm: 0 } }}
        >
          {comments.length > 0 ? `${comments.length} Comments` : 'Comments'}
        </Button>
        <Button
          variant="contained"
          color="success"
          startIcon={!isSmallScreen && <WhatsAppIcon />}
          onClick={() => window.open(`https://wa.me/91${whatsapp}`, '_blank')}
          sx={{ flex: 1 }}
        >
          {isSmallScreen ? <WhatsAppIcon /> : 'WhatsApp'}
        </Button>
        <Button
          variant="contained"
          color="error"
          startIcon={!isSmallScreen && <EmailIcon />}
          onClick={() => window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${email}`, '_blank')}
          sx={{ flex: 1 }}
        >
          {isSmallScreen ? <EmailIcon /> : 'Email'}
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
                      onClick={() => handleSaveEditedComment(comment._id)}
                    >
                      Save
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
                  <IconButton onClick={handleCommentSubmit} disabled={commentLoading} edge="end">
                    {commentLoading ? <CircularProgress size={18} /> : <SendIcon fontSize="small" />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Box>
      </Collapse>
    </Card>
  );
};

export default PostComponent;
