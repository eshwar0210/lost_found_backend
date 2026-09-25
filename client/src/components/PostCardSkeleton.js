import React from 'react';
import { Box, Card, Skeleton, Divider, useMediaQuery } from '@mui/material';

// Mirrors the layout of Postcomponent so the feed keeps its shape while
// loading and nothing shifts when the real posts arrive.
const PostCardSkeleton = () => {
  const isSmallScreen = useMediaQuery('(max-width:600px)');

  return (
    <Card sx={{ mb: 3, p: { xs: 2, sm: 3 } }}>
      <Box display="flex" alignItems="center" mb={2}>
        <Skeleton variant="circular" animation="wave" width={50} height={50} />
        <Box ml={1.5} sx={{ flexGrow: 1, minWidth: 0 }}>
          <Skeleton variant="text" animation="wave" width={150} height={32} />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4, mt: 0.3 }}>
            <Skeleton variant="circular" animation="wave" width={13} height={13} />
            <Skeleton variant="text" animation="wave" width={60} height={20} />
          </Box>
        </Box>
        <Skeleton variant="rounded" animation="wave" width={64} height={26} />
      </Box>

      <Box display="flex" alignItems="center" gap={0.5} mb={1}>
        <Skeleton variant="circular" animation="wave" width={18} height={18} />
        <Skeleton variant="text" animation="wave" width={180} height={20} />
      </Box>

      <Box mb={2}>
        <Skeleton variant="text" animation="wave" />
        <Skeleton variant="text" animation="wave" width="92%" />
        <Skeleton variant="text" animation="wave" width="68%" />
      </Box>

      <Skeleton
        variant="rounded"
        animation="wave"
        sx={{ height: isSmallScreen ? 220 : 300, mb: 2 }}
      />

      <Divider sx={{ my: 2 }} />

      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        {[0, 1, 2, 3].map((i) => (
          <Skeleton
            key={i}
            variant="rounded"
            animation="wave"
            height={36}
            sx={{ flex: 1, minWidth: { xs: '100%', sm: 0 } }}
          />
        ))}
      </Box>
    </Card>
  );
};

export default PostCardSkeleton;
