import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Button,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Card,
  Chip,
  CircularProgress,
  IconButton,
  useTheme,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import axios from 'axios';
import Header from './Header';
import Footer from './footer';
import ImageCarousel from './ImageCarousel';
import { timeAgo } from '../utils/format';

const MyProfile = () => {
  const theme = useTheme();
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editType, setEditType] = useState('lost');
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  const [openSurveyDialog, setOpenSurveyDialog] = useState(false);
  const [surveyResponse, setSurveyResponse] = useState('');

  useEffect(() => {
    const uid = localStorage.getItem('uid');
    if (uid) {
      axios
        .get(`${process.env.REACT_APP_BASE_URL}/post/user/${uid}`)
        .then((response) => {
          const sorted = [...response.data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          setPosts(sorted);
        })
        .catch((error) => {
          console.error('Error fetching posts:', error);
        })
        .finally(() => setLoading(false));
    }
  }, []);

  const handleEditClick = (post) => {
    setSelectedPost(post);
    setEditContent(post.description);
    setEditLocation(post.location);
    setEditType(post.postType);
    setOpenEditDialog(true);
  };

  const handleDelete = (post) => {
    setSelectedPost(post);
    setOpenSurveyDialog(true);
  };

  const confirmDeletePost = async () => {
    try {
      await axios.delete(`${process.env.REACT_APP_BASE_URL}/post/${selectedPost._id}`);
      setPosts((prev) => prev.filter((post) => post._id !== selectedPost._id));
      setNotification({ open: true, message: 'Post deleted successfully!', severity: 'success' });

      if (surveyResponse.trim() !== '') {
        const uid = localStorage.getItem('uid');
        await axios.post(`${process.env.REACT_APP_BASE_URL}/auth/survey`, {
          uid,
          surveyResponse: surveyResponse.trim(),
        });
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      setNotification({ open: true, message: 'Failed to delete post.', severity: 'error' });
    } finally {
      setOpenSurveyDialog(false);
      setSurveyResponse('');
    }
  };

  const handleUpdatePost = async () => {
    try {
      await axios.put(`${process.env.REACT_APP_BASE_URL}/post/${selectedPost._id}`, {
        description: editContent,
        location: editLocation,
        postType: editType,
      });
      setPosts((prev) =>
        prev.map((post) =>
          post._id === selectedPost._id
            ? { ...post, description: editContent, location: editLocation, postType: editType }
            : post
        )
      );
      setNotification({ open: true, message: 'Post updated successfully!', severity: 'success' });
      setOpenEditDialog(false);
    } catch (error) {
      console.error('Error updating post:', error);
      setNotification({ open: true, message: 'Failed to update post.', severity: 'error' });
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <Container maxWidth="md" sx={{ flexGrow: 1, width: '100%' }}>
        <Typography variant="h5" fontWeight={800} mb={3}>
          My Posts
        </Typography>

        {loading ? (
          <Box display="flex" justifyContent="center" py={8}>
            <CircularProgress />
          </Box>
        ) : posts.length === 0 ? (
          <Box textAlign="center" py={8} color="text.secondary">
            <Typography variant="h6">No posts yet</Typography>
            <Typography variant="body2">Your posted items will show up here.</Typography>
          </Box>
        ) : (
          posts.map((post) => (
            <Card key={post._id} sx={{ mb: 3, p: { xs: 2, sm: 3 } }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Chip
                  label={post.postType.charAt(0).toUpperCase() + post.postType.slice(1)}
                  size="small"
                  color={post.postType === 'lost' ? 'error' : 'success'}
                  sx={{ fontWeight: 600 }}
                />
                <Typography variant="caption" color="text.secondary">
                  {timeAgo(post.createdAt)}
                </Typography>
              </Box>

              <Box display="flex" alignItems="center" gap={0.5} color="text.secondary" mb={1}>
                <LocationOnIcon fontSize="small" />
                <Typography variant="body2">{post.location}</Typography>
              </Box>

              <Typography variant="body1" sx={{ mb: 2, whiteSpace: 'pre-wrap' }}>
                {post.description}
              </Typography>

              {post.imageUrls && post.imageUrls.length > 0 && (
                <Box mb={2}>
                  <ImageCarousel images={post.imageUrls} height={220} />
                </Box>
              )}

              <Box display="flex" gap={1} justifyContent="flex-end">
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<EditIcon />}
                  onClick={() => handleEditClick(post)}
                >
                  Edit
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  startIcon={<DeleteIcon />}
                  onClick={() => handleDelete(post)}
                >
                  Delete
                </Button>
              </Box>
            </Card>
          ))
        )}

        {/* Edit Post Dialog */}
        <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} fullWidth maxWidth="sm">
          <DialogTitle>Edit Post</DialogTitle>
          <DialogContent>
            <Box display="flex" gap={1} mb={2} mt={1}>
              <Button
                fullWidth
                variant={editType === 'lost' ? 'contained' : 'outlined'}
                color="error"
                onClick={() => setEditType('lost')}
              >
                Lost
              </Button>
              <Button
                fullWidth
                variant={editType === 'found' ? 'contained' : 'outlined'}
                color="success"
                onClick={() => setEditType('found')}
              >
                Found
              </Button>
            </Box>
            <TextField
              autoFocus
              margin="dense"
              label="Post Content"
              fullWidth
              multiline
              rows={3}
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
            />
            <TextField
              margin="dense"
              label="Location"
              fullWidth
              value={editLocation}
              onChange={(e) => setEditLocation(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenEditDialog(false)} color="inherit">
              Cancel
            </Button>
            <Button onClick={handleUpdatePost} variant="contained" color="primary">
              Update
            </Button>
          </DialogActions>
        </Dialog>

        {/* Survey Dialog for Post Deletion */}
        <Dialog open={openSurveyDialog} onClose={() => setOpenSurveyDialog(false)} fullWidth maxWidth="sm">
          <DialogTitle>Feedback Survey</DialogTitle>
          <DialogContent>
            <Typography variant="body1" mb={1}>
              Did this app help you? Please provide your feedback (optional):
            </Typography>
            <TextField
              autoFocus
              margin="dense"
              label="Your Feedback"
              fullWidth
              value={surveyResponse}
              onChange={(e) => setSurveyResponse(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenSurveyDialog(false)} color="inherit">
              Cancel
            </Button>
            <Button onClick={confirmDeletePost} variant="contained" color="error">
              Confirm Delete
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={notification.open}
          autoHideDuration={6000}
          onClose={() => setNotification({ ...notification, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={() => setNotification({ ...notification, open: false })} severity={notification.severity}>
            {notification.message}
          </Alert>
        </Snackbar>
      </Container>
      <Footer />
    </Box>
  );
};

export default MyProfile;
