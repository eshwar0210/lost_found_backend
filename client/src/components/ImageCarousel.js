import React, { useState } from 'react';
import { Box, IconButton, MobileStepper } from '@mui/material';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import { useTheme } from '@mui/material/styles';

const ImageCarousel = ({ images = [], height = 260 }) => {
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  const maxSteps = images.length;

  const handleNext = () => setActiveStep((prev) => (prev + 1) % maxSteps);
  const handleBack = () => setActiveStep((prev) => (prev - 1 + maxSteps) % maxSteps);

  if (!images || images.length === 0) return null;

  return (
    <Box sx={{ position: 'relative', borderRadius: 2, overflow: 'hidden' }}>
      <img
        src={images[activeStep]}
        alt={`Post image ${activeStep + 1}`}
        style={{
          width: '100%',
          height,
          objectFit: 'contain',
          backgroundColor: theme.palette.mode === 'light' ? '#f1f5f9' : '#0f172a',
          display: 'block',
        }}
        loading="lazy"
      />

      {maxSteps > 1 && (
        <>
          <IconButton
            onClick={handleBack}
            size="small"
            sx={{
              position: 'absolute',
              top: '50%',
              left: 8,
              transform: 'translateY(-50%)',
              bgcolor: 'rgba(15, 23, 42, 0.55)',
              color: '#fff',
              '&:hover': { bgcolor: 'rgba(15, 23, 42, 0.75)' },
            }}
          >
            <KeyboardArrowLeft />
          </IconButton>
          <IconButton
            onClick={handleNext}
            size="small"
            sx={{
              position: 'absolute',
              top: '50%',
              right: 8,
              transform: 'translateY(-50%)',
              bgcolor: 'rgba(15, 23, 42, 0.55)',
              color: '#fff',
              '&:hover': { bgcolor: 'rgba(15, 23, 42, 0.75)' },
            }}
          >
            <KeyboardArrowRight />
          </IconButton>
          <MobileStepper
            variant="dots"
            steps={maxSteps}
            position="static"
            activeStep={activeStep}
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              bgcolor: 'rgba(15, 23, 42, 0.4)',
              justifyContent: 'center',
              '& .MuiMobileStepper-dot': { bgcolor: 'rgba(255,255,255,0.4)' },
              '& .MuiMobileStepper-dotActive': { bgcolor: '#fff' },
            }}
          />
        </>
      )}
    </Box>
  );
};

export default ImageCarousel;
