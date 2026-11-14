import React from 'react';
import { Button } from '@mui/material';
import { LoginRounded } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

function LoginButton({ onClick }) {
  const navigate = useNavigate();

  const handleSignIn = () => {
    if (onClick) onClick();
    navigate('/signin');
  };

  return (
    <Button
      variant="outlined"
      startIcon={<LoginRounded fontSize="small" />}
      onClick={handleSignIn}
      sx={{
        borderRadius: '10px',
        padding: '6px 16px',
        fontWeight: 700,
        textTransform: 'none',
        color: '#f8fafc',
        borderColor: 'rgba(56, 189, 248, 0.45)',
        backgroundColor: 'rgba(2, 132, 199, 0.16)',
        '&:hover': {
          backgroundColor: '#0284c7',
          borderColor: '#38bdf8',
          color: '#ffffff',
        },
      }}
    >
      Sign In
    </Button>
  );
}

export default LoginButton;
