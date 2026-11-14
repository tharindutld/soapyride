import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  FormControlLabel,
  Checkbox,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  EmailRounded,
  LockRounded,
  LoginRounded,
  DirectionsCarFilledRounded,
} from '@mui/icons-material';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import useAuth from '../hooks/useAuth';

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

const SignInPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { refreshAuth } = useAuth();

  const validateField = (name, value) => {
    if (name === 'email') {
      if (!value || !value.trim()) return 'Email address is required';
      if (!EMAIL_REGEX.test(value.trim())) return 'Enter a valid email address';
      return '';
    }
    if (name === 'password') {
      if (!value) return 'Password is required';
      if (value.length < 6) return 'Password must be at least 6 characters';
      return '';
    }
    return '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setServerError('');
    if (touched[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setFieldErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  const validateForm = () => {
    const errors = {
      email: validateField('email', form.email),
      password: validateField('password', form.password),
    };
    setFieldErrors(errors);
    setTouched({ email: true, password: true });
    return !errors.email && !errors.password;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please enter a valid email and password.');
      return;
    }

    setLoading(true);
    setServerError('');
    try {
      const res = await axios.post('http://localhost:5000/login', {
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });

      localStorage.setItem('jwtToken', res.data.token);
      localStorage.setItem(
        'userName',
        res.data.user.fullname || res.data.user.name || ''
      );

      refreshAuth();
      const decoded = jwtDecode(res.data.token);
      toast.success(`Welcome back, ${res.data.user.name || 'Member'}!`);

      if (decoded.role === 'admin') {
        localStorage.setItem('adminToken', res.data.token);
        localStorage.setItem('userRole', 'admin');
        refreshAuth();
        navigate('/admin/dashboard');
      } else {
        localStorage.setItem('userRole', 'user');
        refreshAuth();
        navigate('/');
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        'Sign in failed. Please check your credentials or ensure the backend server is running.';
      setServerError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card-pro">
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)',
              color: '#fff',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 1.5,
              boxShadow: '0 8px 20px rgba(2, 132, 199, 0.3)',
            }}
          >
            <DirectionsCarFilledRounded sx={{ fontSize: 28 }} />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a' }}>
            Welcome Back to{' '}
            <span className="brand-wordmark">
              <span className="brand-soapy">Soapy</span>
              <span className="brand-ride">Ride</span>
            </span>
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
            Sign in to manage your service bookings and vehicle care history.
          </Typography>
        </Box>

        {serverError && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: '10px' }}>
            {serverError}
          </Alert>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <TextField
            label="Email Address"
            name="email"
            type="email"
            placeholder="name@example.com"
            fullWidth
            margin="normal"
            value={form.email}
            onChange={handleChange}
            onBlur={handleBlur}
            error={!!fieldErrors.email}
            helperText={fieldErrors.email}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                backgroundColor: '#f8fafc',
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment
                  position="start"
                  sx={{ color: fieldErrors.email ? '#ef4444' : '#64748b' }}
                >
                  <EmailRounded fontSize="small" />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            label="Password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your password"
            fullWidth
            margin="normal"
            value={form.password}
            onChange={handleChange}
            onBlur={handleBlur}
            error={!!fieldErrors.password}
            helperText={fieldErrors.password}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                backgroundColor: '#f8fafc',
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment
                  position="start"
                  sx={{ color: fieldErrors.password ? '#ef4444' : '#64748b' }}
                >
                  <LockRounded fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    aria-label="toggle password visibility"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mt: 1,
            }}
          >
            <FormControlLabel
              control={
                <Checkbox
                  sx={{ color: '#0284c7', '&.Mui-checked': { color: '#0284c7' } }}
                />
              }
              label={
                <Typography variant="body2" sx={{ color: '#475569' }}>
                  Keep me signed in
                </Typography>
              }
            />
            <Link
              to="/contact"
              style={{ fontSize: '0.85rem', color: '#0284c7', fontWeight: 600 }}
            >
              Need help?
            </Link>
          </Box>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            startIcon={
              loading ? <CircularProgress size={18} color="inherit" /> : <LoginRounded />
            }
            sx={{
              mt: 2.5,
              py: 1.35,
              borderRadius: '12px',
              fontWeight: 700,
              textTransform: 'none',
              fontSize: '1rem',
              background: 'linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%)',
              boxShadow: '0 8px 20px rgba(2, 132, 199, 0.35)',
              '&:hover': {
                background: 'linear-gradient(135deg, #0369a1 0%, #0284c7 100%)',
              },
            }}
          >
            {loading ? 'Signing In...' : 'Sign In to Account'}
          </Button>

          <Typography
            variant="body2"
            align="center"
            sx={{ mt: 2.5, color: '#64748b' }}
          >
            New to SoapyRide?{' '}
            <Link
              to="/registration"
              style={{ color: '#0284c7', fontWeight: 700, textDecoration: 'none' }}
            >
              Create an Account
            </Link>
          </Typography>
          <Typography
            variant="body2"
            align="center"
            sx={{ mt: 1.5, pt: 1.5, borderTop: '1px solid #e2e8f0', color: '#64748b' }}
          >
            Shop Owner or Manager?{' '}
            <Link
              to="/admin/login"
              style={{ color: '#0f172a', fontWeight: 800, textDecoration: 'none' }}
            >
              Go to Separate Admin Login &rarr;
            </Link>
          </Typography>
        </form>
      </div>
    </div>
  );
};

export default SignInPage;
