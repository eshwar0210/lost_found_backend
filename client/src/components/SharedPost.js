import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Avatar,
  CircularProgress,
  Card,
  Chip,
  Button,
  Divider,
  useTheme,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ScheduleIcon from '@mui/icons-material/Schedule';
import EmailIcon from '@mui/icons-material/Email';
import ImageCarousel from './ImageCarousel';
import { timeAgo } from '../utils/format';
import BASE_URL from '../config';

const SharedPost = () => {
  const { id } = useParams();
  const theme = useTheme();
  const [post, setPost] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const postResponse = await fetch(`${BASE_URL}/post/${id}`);
        if (!postResponse.ok) {
          setNotFound(true);
          return;
        }
        const postData = await postResponse.json();
        setPost(postData);

        const userResponse = await fetch(`${BASE_URL}/auth/user/${postData.uid}`);
        if (userResponse.ok) {
          setUser(await userResponse.json());
        }
      } catch (error) {
        console.error('Error fetching shared post:', error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  const isLost = post && post.postType === 'lost';

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: theme.palette.mode === 'light' ? '#f8fafc' : '#0b1220',
      }}
    >
      <Box
        sx={{
          px: { xs: 2, sm: 4 },
          py: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: `1px solid ${theme.palette.divider}`,
          bgcolor: 'background.paper',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 38,
              height: 38,
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
          <Typography variant="subtitle1" fontWeight={800}>
            Lost &amp; Found
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button component={Link} to="/login" variant="text" color="inherit">
            Sign in
          </Button>
          <Button component={Link} to="/register" variant="contained" size="small">
            Join
          </Button>
        </Box>
      </Box>

      <Container maxWidth="sm" sx={{ flexGrow: 1, width: '100%', py: 4 }}>
        {loading ? (
          <Box display="flex" justifyContent="center" py={10}>
            <CircularProgress />
          </Box>
        ) : notFound || !post ? (
          <Card sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" fontWeight={700}>
              Post not found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
              This post may have been deleted or the link is incorrect.
            </Typography>
            <Button component={Link} to="/" variant="contained">
              Back to Lost &amp; Found
            </Button>
          </Card>
        ) : (
          <Card sx={{ overflow: 'hidden' }}>
            <Box sx={{ p: { xs: 2.5, sm: 3 } }}>
              <Box display="flex" alignItems="center" mb={2}>
                <Avatar src={user?.profilePhotoUrl} sx={{ width: 48, height: 48 }}>
                  {(user?.name || 'U').charAt(0).toUpperCase()}
                </Avatar>
                <Box ml={1.5} sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle1" fontWeight={700} lineHeight={1.3}>
                    {user?.name || 'Campus member'}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4, mt: 0.3 }}>
                    <ScheduleIcon sx={{ fontSize: 13, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {timeAgo(post.createdAt)}
                    </Typography>
                  </Box>
                </Box>
                <Chip
                  label={isLost ? 'Lost' : 'Found'}
                  size="small"
                  color={isLost ? 'error' : 'success'}
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
            </Box>

            {post.imageUrls && post.imageUrls.length > 0 && (
              <ImageCarousel images={post.imageUrls} height={320} />
            )}

            <Box sx={{ p: { xs: 2.5, sm: 3 } }}>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body2" color="text.secondary" mb={2}>
                Found this item or know where it is? Contact the owner:
              </Typography>
              <Button
                fullWidth
                variant="contained"
                color="error"
                startIcon={<EmailIcon />}
                onClick={() =>
                  window.open(
                    `https://mail.google.com/mail/?view=cm&fs=1&to=${user?.email || ''}`,
                    '_blank'
                  )
                }
                disabled={!user?.email}
              >
                Email {user?.name || 'owner'}
              </Button>
            </Box>
          </Card>
        )}
      </Container>
    </Box>
  );
};

export default SharedPost;
