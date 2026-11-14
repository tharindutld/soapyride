import React, { useState } from 'react';
import { TextField, IconButton, InputAdornment } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

const InputField = ({
  label,
  type = 'text',
  name,
  value,
  onChange,
  onBlur,
  error,
  helperText,
  startIcon,
  placeholder,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';

  return (
    <TextField
      label={label}
      type={isPassword ? (showPassword ? 'text' : 'password') : type}
      name={name}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      error={error}
      helperText={helperText}
      placeholder={placeholder}
      fullWidth
      margin="dense"
      variant="outlined"
      sx={{
        mb: 1.5,
        '& .MuiOutlinedInput-root': {
          borderRadius: '12px',
          backgroundColor: '#f8fafc',
        },
      }}
      InputProps={{
        startAdornment: startIcon ? (
          <InputAdornment position="start" sx={{ color: error ? '#ef4444' : '#64748b' }}>
            {startIcon}
          </InputAdornment>
        ) : undefined,
        endAdornment: isPassword ? (
          <InputAdornment position="end">
            <IconButton
              onClick={() => setShowPassword(!showPassword)}
              edge="end"
              aria-label="toggle password visibility"
            >
              {showPassword ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          </InputAdornment>
        ) : undefined,
      }}
    />
  );
};

export default InputField;
