import React, { useState } from 'react';
import {
  TextField,
  Button,
  Typography,
  Box,
  MenuItem,
  Link,
  Snackbar,
  Alert,
  InputAdornment,
  IconButton,
  Avatar,
  CircularProgress,
  useTheme,
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import PersonIcon from '@mui/icons-material/Person';
import AddAPhotoIcon from '@mui/icons-material/AddAPhoto';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useNavigate } from 'react-router-dom';
import { getAuth, sendEmailVerification, signInWithEmailAndPassword } from 'firebase/auth';
import BASE_URL from '../config';
import { app } from '../firebase';
import AuthLayout from './AuthLayout';

const Register = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [hostel, setHostel] = useState('');
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [profilePhotoName, setProfilePhotoName] = useState('');
  const [preview, setPreview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const hostels = ['Kalam', 'C.V. Raman', 'Aryabatta', 'Asima'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSnackbarOpen(false);

    if (password !== confirmPassword) {
      setSnackbarMessage('Passwords do not match');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    setSubmitting(true);

    try {
      const userData = {
        email,
        name,
        password,
        hostelName: hostel,
      };

      const formData = new FormData();
      formData.append('userData', JSON.stringify(userData));
      if (profilePhoto) {
        formData.append('profilePhoto', profilePhoto);
      }

      const response = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        const auth = getAuth(app);
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        await sendEmailVerification(user);

        setSnackbarMessage('Registration successful! A verification email has been sent.');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        setTimeout(() => navigate('/login'), 2000);
      } else {
        throw new Error(data.error || 'Registration failed');
      }
    } catch (err) {
      setSnackbarMessage(err.message);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePhoto(file);
      setProfilePhotoName(file.name);
      setPreview(URL.createObjectURL(file));
    }
  };

  return (
    <AuthLayout
      title="Join the community"
      subtitle="Create an account to start posting lost or found items."
    >
      <Box component="form" onSubmit={handleSubmit}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 1 }}>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: 'none' }}
            id="profile-photo-upload"
          />
          <label htmlFor="profile-photo-upload" style={{ cursor: 'pointer', position: 'relative' }}>
            <Avatar
              src={preview || undefined}
              sx={{
                width: 84,
                height: 84,
                bgcolor: 'primary.light',
                fontSize: 32,
                border: `2px dashed ${theme.palette.divider}`,
              }}
            >
              <AddAPhotoIcon />
            </Avatar>
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: 26,
                height: 26,
                borderRadius: '50%',
                bgcolor: 'primary.main',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AddAPhotoIcon sx={{ fontSize: 14 }} />
            </Box>
          </label>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
            {profilePhotoName || 'Add a profile photo (optional)'}
          </Typography>
          {profilePhoto && (
            <Button
              size="small"
              startIcon={<CloseIcon fontSize="small" />}
              onClick={() => {
                setProfilePhoto(null);
                setProfilePhotoName('');
                setPreview('');
              }}
              sx={{ mt: 0.5 }}
            >
              Remove
            </Button>
          )}
        </Box>

        <TextField
          label="Email"
          type="email"
          fullWidth
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <EmailIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
        <TextField
          label="Name"
          type="text"
          fullWidth
          margin="normal"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <PersonIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
        <TextField
          select
          label="Hostel"
          fullWidth
          margin="normal"
          value={hostel}
          onChange={(e) => setHostel(e.target.value)}
          required
        >
          {hostels.map((hostelName) => (
            <MenuItem key={hostelName} value={hostelName}>
              {hostelName}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="Password"
          type={showPassword ? 'text' : 'password'}
          fullWidth
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LockIcon fontSize="small" />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword((prev) => !prev)} edge="end" aria-label="Toggle password visibility">
                  {showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <TextField
          label="Confirm Password"
          type={showPassword ? 'text' : 'password'}
          fullWidth
          margin="normal"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LockIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />

        <Button
          type="submit"
          variant="contained"
          size="large"
          fullWidth
          sx={{ mt: 3 }}
          disabled={submitting}
        >
          {submitting ? <CircularProgress size={22} color="inherit" /> : 'Create Account'}
        </Button>

        <Typography variant="body2" align="center" sx={{ mt: 2 }}>
          Already have an account?{' '}
          <Link href="/login" fontWeight={600}>
            Sign in
          </Link>
        </Typography>
      </Box>

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
    </AuthLayout>
  );
};

export default Register;
