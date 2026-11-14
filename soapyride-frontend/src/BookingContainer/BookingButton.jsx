import React from 'react';
import { Button } from '@mui/material';
import { CalendarMonthRounded } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

function BookingButton({ onClick }) {
  const navigate = useNavigate();

  const handleBook = () => {
    if (onClick) onClick();
    navigate('/bookingform');
  };

  return (
    <Button
      variant="contained"
      startIcon={<CalendarMonthRounded fontSize="small" />}
      onClick={handleBook}
      sx={{
        borderRadius: '10px',
        padding: '7px 16px',
        fontWeight: 700,
        textTransform: 'none',
        background: 'linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%)',
        color: '#ffffff',
        boxShadow: '0 4px 14px rgba(2, 132, 199, 0.4)',
        '&:hover': {
          background: 'linear-gradient(135deg, #0369a1 0%, #0284c7 100%)',
          boxShadow: '0 6px 20px rgba(2, 132, 199, 0.6)',
        },
      }}
    >
      Book Service
    </Button>
  );
}

export default BookingButton;
