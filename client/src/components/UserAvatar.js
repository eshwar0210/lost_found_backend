import React from 'react';
import { Avatar } from '@mui/material';

// Shows the user's photo when they have one, otherwise the first letter of
// their first name. The initial is always passed as children so a broken or
// slow image URL also degrades to a letter rather than an empty circle.
const UserAvatar = ({ src, name, alt, sx, ...rest }) => {
  const firstName = (name || '').trim().split(/\s+/)[0] || '';
  const initial = firstName.charAt(0).toUpperCase() || 'U';

  return (
    <Avatar
      src={src || undefined}
      alt={alt || name || ''}
      sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', fontWeight: 600, ...sx }}
      {...rest}
    >
      {initial}
    </Avatar>
  );
};

export default UserAvatar;
