import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { ADMIN_EMAIL, mailtoLink } from '../config';
import { DISCLAIMER_SHORT } from '../constants';

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
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ maxWidth: 520, textAlign: 'center', opacity: 0.85 }}
      >
        {DISCLAIMER_SHORT}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Contact Admin:
        </Typography>
        <Typography
          component="a"
          href={mailtoLink(ADMIN_EMAIL, 'Lost & Found - Support Request')}
          variant="body2"
          sx={{ color: 'primary.main', textDecoration: 'none', fontWeight: 600, '&:hover': { textDecoration: 'underline' } }}
        >
          {ADMIN_EMAIL}
        </Typography>
      </Box>
    </Box>
  );
};

export default Footer;
