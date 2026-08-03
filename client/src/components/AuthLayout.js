import React from 'react';
import { Box, Container, Paper, Typography, Grid, useTheme } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import EmojiObjectsIcon from '@mui/icons-material/EmojiObjects';

const features = [
  {
    icon: <EmojiObjectsIcon />,
    title: 'Report instantly',
    description: 'Log a lost or found item in under a minute.',
  },
  {
    icon: <VerifiedUserIcon />,
    title: 'Trusted community',
    description: 'Verified campus members only.',
  },
  {
    icon: <SearchIcon />,
    title: 'Reunite fast',
    description: 'Contact owners via email or in-app messages.',
  },
];

const AuthLayout = ({ title, subtitle, children }) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: { xs: 2, sm: 4 },
      }}
    >
      <Container maxWidth="lg" disableGutters>
        <Paper
          elevation={0}
          sx={{
            overflow: 'hidden',
            borderRadius: 4,
            border: `1px solid ${theme.palette.divider}`,
            bgcolor: 'background.paper',
          }}
        >
          <Grid container>
            <Grid
              item
              xs={12}
              md={6}
              sx={{
                display: { xs: 'none', md: 'flex' },
                flexDirection: 'column',
                justifyContent: 'space-between',
                p: 6,
                color: '#fff',
                background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #0ea5e9 100%)',
              }}
            >
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'rgba(255,255,255,0.18)',
                    }}
                  >
                    <SearchIcon />
                  </Box>
                  <Typography variant="h6" fontWeight={800}>
                    Lost &amp; Found
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight={800} sx={{ mt: 6, lineHeight: 1.2 }}>
                  Never lose something
                  <br />
                  on campus again.
                </Typography>
                <Typography variant="body1" sx={{ mt: 2, opacity: 0.85 }}>
                  A simple way for the community to report and reclaim lost items.
                </Typography>
              </Box>

              <Box>
                {features.map((feature) => (
                  <Box key={feature.title} sx={{ display: 'flex', gap: 2, mb: 2.5 }}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        flexShrink: 0,
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: 'rgba(255,255,255,0.18)',
                      }}
                    >
                      {feature.icon}
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" fontWeight={700}>
                        {feature.title}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.85 }}>
                        {feature.description}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Grid>

            <Grid item xs={12} md={6} sx={{ p: { xs: 3, sm: 6 } }}>
              <Box sx={{ maxWidth: 420, mx: 'auto' }}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    mb: 2,
                    borderRadius: '12px',
                    display: { xs: 'flex', md: 'none' },
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    background: 'linear-gradient(135deg, #4f46e5 0%, #0ea5e9 100%)',
                  }}
                >
                  <SearchIcon />
                </Box>
                <Typography variant="h4" component="h1" fontWeight={800}>
                  {title}
                </Typography>
                {subtitle && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 3 }}>
                    {subtitle}
                  </Typography>
                )}
                {children}
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
};

export default AuthLayout;
