import React from 'react';
import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Typography,
  useTheme,
} from '@mui/material';
import GavelIcon from '@mui/icons-material/Gavel';
import HandshakeIcon from '@mui/icons-material/Handshake';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ReportIcon from '@mui/icons-material/Report';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { DISCLAIMER_POINTS } from '../constants';

const rules = [
  {
    icon: <HandshakeIcon fontSize="small" />,
    color: 'success',
    text: 'Respect other users and their belongings.',
  },
  {
    icon: <VisibilityIcon fontSize="small" />,
    color: 'info',
    text: 'Only post items that you have actually found or lost.',
  },
  {
    icon: <ReportIcon fontSize="small" />,
    color: 'warning',
    text: 'Report any inappropriate content to the admin.',
  },
  {
    icon: <CheckCircleIcon fontSize="small" />,
    color: 'primary',
    text: 'Use the contact options responsibly and cross-check before exchanging items.',
  },
];

const RulesDialog = ({ open, onClose }) => {
  const theme = useTheme();

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
          }}
        >
          <GavelIcon />
        </Box>
        <Box>
          <Typography variant="h6" component="div" fontWeight={800}>
            Rules &amp; Regulations
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Keep our campus community safe and honest
          </Typography>
        </Box>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ pt: 3 }}>
        {rules.map((rule) => (
          <Box
            key={rule.text}
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 1.5,
              mb: 1.5,
              p: 1.5,
              borderRadius: 2,
              backgroundColor:
                theme.palette.mode === 'light' ? 'rgba(15, 23, 42, 0.03)' : 'rgba(226, 232, 240, 0.05)',
            }}
          >
            <Avatar sx={{ width: 32, height: 32, bgcolor: `${rule.color}.main`, color: '#fff' }}>
              {rule.icon}
            </Avatar>
            <Typography variant="body2" sx={{ pt: 0.5 }}>
              {rule.text}
            </Typography>
          </Box>
        ))}
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
          By using this app, you agree to abide by these rules.
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1.5 }}>
          Disclaimer
        </Typography>
        {DISCLAIMER_POINTS.map((point) => (
          <Box key={point.title} sx={{ mb: 1.5 }}>
            <Typography variant="body2" fontWeight={700}>
              {point.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {point.text}
            </Typography>
          </Box>
        ))}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RulesDialog;
