import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Avatar,
  Typography,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Snackbar,
  Alert,
  Chip,
  CircularProgress,
  Tooltip,
  Tabs,
  Tab,
  InputAdornment,
  useTheme,
} from '@mui/material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import DeleteIcon from '@mui/icons-material/Delete';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EditNoteIcon from '@mui/icons-material/EditNote';
import SearchIcon from '@mui/icons-material/Search';
import Header from './Header';
import PostComponent from './Postcomponent';
import BASE_URL from '../config';
import Footer from './footer';

const Home = () => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [location, setLocation] = useState('');
  const [postType, setPostType] = useState('lost');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState([]);
  const [posts, setPosts] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [loading, setLoading] = useState(false);
  const [feedLoading, setFeedLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const uid = localStorage.getItem('uid');
  const profilePhoto = localStorage.getItem('profile');

  const handleClickOpen = (type) => {
    if (type) setPostType(type);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setDescription('');
    setLocation('');
    setImages([]);
    setPostType('lost');
  };

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch(`${BASE_URL}/post/`);
        const data = await response.json();
        const sorted = [...data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setPosts(sorted);
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setFeedLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const handleSubmit = async () => {
    if (!description.trim() && images.length === 0) {
      setSnackbarMessage('Add a description or at least one image.');
      setSnackbarSeverity('warning');
      setSnackbarOpen(true);
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('location', location);
    formData.append('postType', postType);
    formData.append('description', description);
    formData.append('uid', uid);
    images.forEach((image) => formData.append('images', image));

    try {
      const response = await fetch(`${BASE_URL}/post/`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const { post } = await response.json();
        setPosts((prev) => [post, ...prev]);
        setSnackbarMessage('Post created successfully!');
        setSnackbarSeverity('success');
        handleClose();
      } else {
        setSnackbarMessage('Error creating post: ' + response.statusText);
        setSnackbarSeverity('error');
      }
    } catch (error) {
      setSnackbarMessage('Error uploading images or creating post: ' + error.message);
      setSnackbarSeverity('error');
    } finally {
      setLoading(false);
      setSnackbarOpen(true);
    }
  };

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    setImages((prevImages) => [...prevImages, ...files]);
  };

  const handleRemoveImage = (index) => {
    setImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  const filteredPosts = posts.filter((post) => {
    const matchesType = filter === 'all' || post.postType === filter;
    const query = search.trim().toLowerCase();
    const matchesSearch =
      !query ||
      (post.location || '').toLowerCase().includes(query) ||
      (post.description || '').toLowerCase().includes(query);
    return matchesType && matchesSearch;
  });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <Container maxWidth="md" sx={{ flexGrow: 1, width: '100%' }}>
        {/* Create Post Composer */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            p: 2,
            borderRadius: 3,
            backgroundColor: 'background.paper',
            border: `1px solid ${theme.palette.divider}`,
            mb: 3,
            cursor: 'pointer',
            flexWrap: 'wrap',
            '&:hover': {
              borderColor: 'primary.main',
              boxShadow: `0 0 0 3px ${theme.palette.primary.main}22`,
            },
          }}
          onClick={() => handleClickOpen()}
        >
          <Avatar
            src={profilePhoto}
            sx={{ width: 46, height: 46, border: '2px solid', borderColor: 'primary.light' }}
          />
          <Box sx={{ flexGrow: 1, minWidth: { xs: '100%', sm: 0 }, order: { xs: 2, sm: 0 } }}>
            <Typography variant="body1" fontWeight={600} color="text.primary">
              What did you lose or find today?
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Add a location, photos and details for your campus community.
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, order: { xs: 1, sm: 0 }, ml: { sm: 'auto' } }}>
            <Button
              size="small"
              variant="outlined"
              color="error"
              onClick={(e) => {
                e.stopPropagation();
                handleClickOpen('lost');
              }}
            >
              Lost
            </Button>
            <Button
              size="small"
              variant="outlined"
              color="success"
              onClick={(e) => {
                e.stopPropagation();
                handleClickOpen('found');
              }}
            >
              Found
            </Button>
            <IconButton
              sx={{ bgcolor: 'primary.main', color: '#fff', '&:hover': { bgcolor: 'primary.dark' } }}
              onClick={(e) => {
                e.stopPropagation();
                handleClickOpen();
              }}
            >
              <EditNoteIcon />
            </IconButton>
          </Box>
        </Box>

        {/* Create Post Dialog */}
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
          <DialogTitle>Create a Post</DialogTitle>
          <DialogContent>
            <Box display="flex" gap={1} mb={2}>
              <Button
                fullWidth
                variant={postType === 'lost' ? 'contained' : 'outlined'}
                color="error"
                onClick={() => setPostType('lost')}
              >
                Lost
              </Button>
              <Button
                fullWidth
                variant={postType === 'found' ? 'contained' : 'outlined'}
                color="success"
                onClick={() => setPostType('found')}
              >
                Found
              </Button>
            </Box>

            <TextField
              margin="dense"
              label="Location"
              type="text"
              fullWidth
              variant="outlined"
              value={location}
              required
              onChange={(e) => setLocation(e.target.value)}
              InputProps={{
                startAdornment: <LocationOnIcon color="action" fontSize="small" sx={{ mr: 1 }} />,
              }}
            />

            <TextField
              margin="dense"
              label="Description"
              type="text"
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              value={description}
              required
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the item, colour, brand, distinguishing features..."
            />

            <Box mt={2}>
              <Button
                variant="contained"
                component="label"
                startIcon={<PhotoCameraIcon />}
              >
                Upload Images
                <input
                  hidden
                  accept="image/*"
                  type="file"
                  multiple
                  onChange={handleImageUpload}
                />
              </Button>
              <Box mt={1.5} display="flex" flexWrap="wrap">
                {images.map((image, index) => (
                  <Box
                    key={index}
                    sx={{ position: 'relative', marginRight: 1, marginBottom: 1 }}
                  >
                    <img
                      src={URL.createObjectURL(image)}
                      alt={`Uploaded ${index}`}
                      style={{ width: '90px', height: '90px', objectFit: 'cover', borderRadius: '10px' }}
                    />
                    <Tooltip title="Remove image">
                      <IconButton
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: -6,
                          right: -6,
                          bgcolor: 'error.main',
                          color: '#fff',
                          '&:hover': { bgcolor: 'error.dark' },
                        }}
                        onClick={() => handleRemoveImage(index)}
                      >
                        <DeleteIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                ))}
              </Box>
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={handleClose} color="inherit">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              color="primary"
              disabled={loading}
            >
              {loading ? <CircularProgress size={20} color="inherit" /> : 'Post'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Filters */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'stretch', sm: 'center' },
            gap: 1,
            mb: 3,
          }}
        >
          <TextField
            fullWidth
            size="small"
            placeholder="Search by location or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ flexGrow: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
          <Tabs
            value={filter}
            onChange={(_, value) => setFilter(value)}
            sx={{ minHeight: 36, '& .MuiTab-root': { minHeight: 36, py: 0.5 } }}
          >
            <Tab label="All" value="all" />
            <Tab label="Lost" value="lost" />
            <Tab label="Found" value="found" />
          </Tabs>
        </Box>

        {/* Feed */}
        {feedLoading ? (
          <Box display="flex" justifyContent="center" py={8}>
            <CircularProgress />
          </Box>
        ) : filteredPosts.length === 0 ? (
          <Box textAlign="center" py={8} color="text.secondary">
            <Typography variant="h6">No posts found</Typography>
            <Typography variant="body2">
              {posts.length === 0
                ? 'Be the first to report a lost or found item.'
                : 'Try a different filter or search term.'}
            </Typography>
          </Box>
        ) : (
          filteredPosts.map((post) => <PostComponent key={post._id} post={post} />)
        )}

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Container>
      <Footer />
    </Box>
  );
};

export default Home;
