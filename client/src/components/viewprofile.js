import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Avatar,
  CircularProgress,
  Card,
  Chip,
  Divider,
  Button,
  useTheme,
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import ApartmentIcon from '@mui/icons-material/Apartment';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import Header from './Header';
import Footer from './footer';
import PostComponent from './Postcomponent';
import BASE_URL from '../config';

const ViewProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const [userDetails, setUserDetails] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await fetch(`${BASE_URL}/auth/user/${userId}`);
        const data = await response.json();
        setUserDetails(data);

        const postsResponse = await fetch(`${BASE_URL}/post/user/${userId}`);
        const postsData = await postsResponse.json();
        setPosts([...postsData].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      } catch (error) {
        console.error('Error fetching user details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [userId]);

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header />
        <Box display="flex" justifyContent="center" alignItems="center" flexGrow={1}>
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  if (!userDetails) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header />
        <Box display="flex" justifyContent="center" alignItems="center" flexGrow={1}>
          <Typography>No user found.</Typography>
        </Box>
      </Box>
    );
  }

  const infoRows = [
    { icon: <EmailIcon />, label: 'Email', value: userDetails.email },
    { icon: <ApartmentIcon />, label: 'Hostel', value: userDetails.hostelName },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <Container maxWidth="md" sx={{ flexGrow: 1, width: '100%' }}>
        <Card sx={{ p: { xs: 3, sm: 4 }, mb: 4, textAlign: 'center' }}>
          <Avatar
            alt={userDetails.name}
            src={userDetails.profilePhotoUrl}
            sx={{ width: 110, height: 110, margin: '0 auto 16px', fontSize: 40 }}
          />
          <Typography variant="h5" fontWeight={800}>
            {userDetails.name}
          </Typography>
          <Chip
            label={`${posts.length} post${posts.length === 1 ? '' : 's'}`}
            size="small"
            sx={{ mt: 1, mb: 2, bgcolor: 'primary.main', color: '#fff' }}
          />
          {userId !== localStorage.getItem('uid') && (
            <Box>
              <Button
                variant="contained"
                color="primary"
                startIcon={<ChatBubbleIcon />}
                onClick={() => navigate(`/chat?with=${userId}`)}
                sx={{ borderRadius: 24, px: 3 }}
              >
                Message
              </Button>
            </Box>
          )}
          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, maxWidth: 420, mx: 'auto' }}>
            {infoRows.map((row) => (
              <Box key={row.label} display="flex" alignItems="center" justifyContent="space-between" gap={2}>
                <Box display="flex" alignItems="center" gap={1} color="text.secondary">
                  {row.icon}
                  <Typography variant="body2">{row.label}</Typography>
                </Box>
                <Typography variant="body2" fontWeight={600}>
                  {row.value || '—'}
                </Typography>
              </Box>
            ))}
          </Box>
        </Card>

        <Typography variant="h6" fontWeight={800} mb={2}>
          Posts by {userDetails.name}
        </Typography>
        {posts.length === 0 ? (
          <Box textAlign="center" py={4} color="text.secondary">
            <Typography variant="body1">No posts yet.</Typography>
          </Box>
        ) : (
          posts.map((post) => <PostComponent key={post._id} post={post} />)
        )}
      </Container>
      <Footer />
    </Box>
  );
};

export default ViewProfile;
