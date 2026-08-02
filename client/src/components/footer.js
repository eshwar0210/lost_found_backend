import React from 'react';
import { Box, Typography, IconButton, useTheme } from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import FavoriteIcon from '@mui/icons-material/Favorite';

const Footer = () => {
  const theme = useTheme();
  return (
    <Box
      component="footer"
      sx={{
        mt: 6,
        py: 3,
        borderTop: `1px solid ${theme.palette.divider}`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 1,
        px: 2,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Typography variant="body2" color="text.secondary">
          Made with
        </Typography>
        <FavoriteIcon sx={{ fontSize: 14, color: '#e11d48' }} />
        <Typography variant="body2" color="text.secondary">
          for the campus community
        </Typography>
      </Box>
      <Typography variant="body2" color="text.secondary">
        {'© '}
        {new Date().getFullYear()} Lost &amp; Found. All rights reserved.
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Typography variant="body2" color="text.secondary">
          Contact Admin:
        </Typography>
        <IconButton
          size="small"
          aria-label="Contact Admin"
          onClick={() => window.open('https://mail.google.com/mail/?view=cm&fs=1&to=eshwarrachakonda02@gmail.com', '_blank', 'noopener,noreferrer')}
        >
          <EmailIcon fontSize="small" />
        </IconButton>
      </Box>
    </Box>
  );
};

export default Footer;
