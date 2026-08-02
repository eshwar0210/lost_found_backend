import React, { useState } from 'react';
import {
  Box,
  Container,
  Avatar,
  Button,
  Typography,
  Snackbar,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Select,
  MenuItem,
  TextField,
  Card,
  IconButton,
  CircularProgress,
  useTheme,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import HotelIcon from '@mui/icons-material/Hotel';
import LockIcon from '@mui/icons-material/Lock';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getAuth, EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
import Header from './Header';
import Footer from './footer';

const EditProfile = () => {
  const theme = useTheme();
  const [selectedImage, setSelectedImage] = useState(null);
  const [preview, setPreview] = useState(localStorage.getItem('profile'));
  const [uploading, setUploading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedHostel, setSelectedHostel] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingHostel, setSavingHostel] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const navigate = useNavigate();

  const hostels = ['Kalam', 'C.V. Raman', 'Aryabatta', 'Asima'];

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleCancel = () => {
    setSelectedImage(null);
    setPreview(localStorage.getItem('profile'));
  };

  const handleUpload = async () => {
    if (!selectedImage) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('profilePhoto', selectedImage);
    formData.append('currentProfilePhotoUrl', localStorage.getItem('profile'));
    const uid = localStorage.getItem('uid');

    try {
      const response = await axios.put(
        `${process.env.REACT_APP_BASE_URL}/auth/user/${uid}/profile-picture`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      if (response.status === 200) {
        localStorage.setItem('profile', response.data.newProfilePhotoUrl);
        setSnackbarMessage('Profile picture updated successfully!');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        setSelectedImage(null);
        setTimeout(() => window.location.reload(), 600);
      }
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      setSnackbarMessage('Failed to upload profile picture.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setUploading(false);
    }
  };

  const handleHostelUpdate = async () => {
    if (!selectedHostel) return;
    setSavingHostel(true);
    const uid = localStorage.getItem('uid');

    try {
      const response = await axios.put(`${process.env.REACT_APP_BASE_URL}/auth/user/${uid}/hostel`, {
        hostel: selectedHostel,
      });

      if (response.status === 200) {
        setSnackbarMessage('Hostel information updated successfully!');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        setSelectedHostel('');
      }
    } catch (error) {
      console.error('Error updating hostel information:', error);
      setSnackbarMessage('Failed to update hostel information.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setSavingHostel(false);
    }
  };

  const handlePasswordChange = async () => {
    setChangingPassword(true);
    const auth = getAuth();

    try {
      const user = auth.currentUser;
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      if (newPassword === confirmPassword) {
        await updatePassword(user, newPassword);
        setSnackbarMessage('Password changed successfully!');
        setSnackbarSeverity('success');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setSnackbarMessage('New passwords do not match!');
        setSnackbarSeverity('error');
      }
    } catch (error) {
      if (error.code === 'auth/wrong-password') {
        setSnackbarMessage('Invalid current password. Please try again.');
      } else {
        setSnackbarMessage(`${error.message}. Please try again.`);
      }
      setSnackbarSeverity('error');
    } finally {
      setChangingPassword(false);
      setSnackbarOpen(true);
    }
  };

  const confirmRemovePhoto = async () => {
    setDialogOpen(false);
    const uid = localStorage.getItem('uid');
    const currentProfilePhotoUrl = localStorage.getItem('profile');

    try {
      const response = await axios.delete(`${process.env.REACT_APP_BASE_URL}/auth/user/${uid}/profile-picture`, {
        data: { currentProfilePhotoUrl },
      });
      if (response.status === 200) {
        localStorage.removeItem('profile');
        setSnackbarMessage('Profile picture removed successfully!');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        setTimeout(() => window.location.reload(), 600);
      }
    } catch (error) {
      console.error('Error removing profile picture:', error);
      setSnackbarMessage('Failed to remove profile picture.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const sectionTitle = (icon, title) => (
    <Box display="flex" alignItems="center" gap={1} mb={2}>
      {icon}
      <Typography variant="h6" fontWeight={800}>
        {title}
      </Typography>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <Container maxWidth="sm" sx={{ flexGrow: 1, width: '100%' }}>
        <Card sx={{ p: { xs: 3, sm: 4 }, mb: 3 }}>
          {sectionTitle(<PhotoCameraIcon color="primary" />, 'Update Profile Picture')}

          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Box sx={{ position: 'relative', mb: 2 }}>
              <Avatar
                alt="Profile Picture"
                src={preview || undefined}
                sx={{ width: 140, height: 140, fontSize: 48 }}
              />
              {localStorage.getItem('profile') && (
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
                  onClick={() => setDialogOpen(true)}
                >
                  <DeleteIcon sx={{ fontSize: 16 }} />
                </IconButton>
              )}
            </Box>

            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Button variant="outlined" component="label">
                Choose Image
                <input type="file" accept="image/*" hidden onChange={handleImageChange} />
              </Button>
              {selectedImage && (
                <>
                  <Button variant="text" color="inherit" onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button variant="contained" color="primary" onClick={handleUpload} disabled={uploading}>
                    {uploading ? <CircularProgress size={18} color="inherit" /> : 'Upload'}
                  </Button>
                </>
              )}
            </Box>
          </Box>
        </Card>

        <Card sx={{ p: { xs: 3, sm: 4 }, mb: 3 }}>
          {sectionTitle(<HotelIcon color="primary" />, 'Update Hostel Information')}
          <Select
            value={selectedHostel}
            onChange={(e) => setSelectedHostel(e.target.value)}
            displayEmpty
            fullWidth
            sx={{ mb: 2 }}
          >
            <MenuItem value="" disabled>
              Select your hostel
            </MenuItem>
            {hostels.map((hostel) => (
              <MenuItem key={hostel} value={hostel}>
                {hostel}
              </MenuItem>
            ))}
          </Select>
          <Button
            variant="contained"
            color="primary"
            onClick={handleHostelUpdate}
            disabled={!selectedHostel || savingHostel}
            fullWidth
          >
            {savingHostel ? <CircularProgress size={18} color="inherit" /> : 'Update Hostel'}
          </Button>
        </Card>

        <Card sx={{ p: { xs: 3, sm: 4 } }}>
          {sectionTitle(<LockIcon color="primary" />, 'Change Password')}
          <TextField
            type="password"
            label="Current Password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            type="password"
            label="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            type="password"
            label="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            fullWidth
            sx={{ mb: 3 }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handlePasswordChange}
            fullWidth
            disabled={changingPassword}
          >
            {changingPassword ? <CircularProgress size={18} color="inherit" /> : 'Change Password'}
          </Button>
        </Card>
      </Container>

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

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Remove Profile Photo</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to remove your profile photo?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button onClick={confirmRemovePhoto} variant="contained" color="error">
            Remove
          </Button>
        </DialogActions>
      </Dialog>

      <Footer />
    </Box>
  );
};

export default EditProfile;
