import React, { useState } from 'react';
import {
  Typography,
  Button,
  Box,
  FormControlLabel,
  Checkbox,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  PersonRounded,
  EmailRounded,
  PhoneAndroidRounded,
  LockRounded,
  CheckCircleRounded,
  RadioButtonUncheckedRounded,
  HowToRegRounded,
  VerifiedUserRounded,
} from '@mui/icons-material';
import InputField from './InputField';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import useAuth from '../hooks/useAuth';

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
const PHONE_REGEX = /^[0-9]{10}$/;
const NAME_REGEX = /^[a-zA-Z\s.'-]{3,60}$/;

const RegistrationPage = () => {
  const navigate = useNavigate();
  const { refreshAuth } = useAuth();

  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agree: false,
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const validateField = (name, value, currentForm = formData) => {
    switch (name) {
      case 'fullname':
        if (!value || !value.trim()) return 'Full name is required';
        if (value.trim().length < 3) return 'Full name must be at least 3 characters';
        if (!NAME_REGEX.test(value.trim()))
          return 'Full name can only contain letters and spaces';
        return '';
      case 'email':
        if (!value || !value.trim()) return 'Email address is required';
        if (!EMAIL_REGEX.test(value.trim()))
          return 'Please enter a valid email address (e.g. name@example.com)';
        return '';
      case 'phone':
        if (!value || !value.trim()) return 'Phone number is required';
        if (!PHONE_REGEX.test(value.trim()))
          return 'Phone number must be exactly 10 digits (e.g. 0771234567)';
        return '';
      case 'password':
        if (!value) return 'Password is required';
        if (value.length < 8) return 'Password must be at least 8 characters long';
        if (!/[A-Z]/.test(value) || !/[a-z]/.test(value))
          return 'Include both uppercase and lowercase letters';
        if (!/[0-9]/.test(value)) return 'Include at least one number';
        return '';
      case 'confirmPassword':
        if (!value) return 'Please confirm your password';
        if (value !== currentForm.password) return 'Passwords do not match';
        return '';
      case 'agree':
        if (!value) return 'You must accept the Service Center Terms & Conditions';
        return '';
      default:
        return '';
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const nextVal = type === 'checkbox' ? checked : value;
    const updatedForm = { ...formData, [name]: nextVal };
    setFormData(updatedForm);

    if (touched[name]) {
      const fieldError = validateField(name, nextVal, updatedForm);
      setErrors((prev) => ({
        ...prev,
        [name]: fieldError,
        general: '',
        ...(name === 'password' && touched.confirmPassword
          ? {
              confirmPassword: validateField(
                'confirmPassword',
                updatedForm.confirmPassword,
                updatedForm
              ),
            }
          : {}),
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name, val, formData),
    }));
  };

  const validateAll = () => {
    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      const msg = validateField(key, formData[key], formData);
      if (msg) newErrors[key] = msg;
    });
    setErrors(newErrors);
    setTouched({
      fullname: true,
      email: true,
      phone: true,
      password: true,
      confirmPassword: true,
      agree: true,
    });
    return Object.keys(newErrors).length === 0;
  };

  // Password strength calculation
  const pwd = formData.password;
  const pwdChecks = {
    length: pwd.length >= 8,
    caseMix: /[a-z]/.test(pwd) && /[A-Z]/.test(pwd),
    number: /[0-9]/.test(pwd),
    match: pwd.length > 0 && pwd === formData.confirmPassword,
  };
  const strengthScore = Object.values(pwdChecks).filter(Boolean).length;
  const strengthColors = ['#e2e8f0', '#ef4444', '#f59e0b', '#0ea5e9', '#10b981'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateAll()) {
      toast.error('Please fix the highlighted validation errors.');
      return;
    }

    setSubmitting(true);
    const cleanFullname = formData.fullname.trim();
    const cleanEmail = formData.email.trim().toLowerCase();
    const cleanPhone = formData.phone.trim();

    const saveLocalCustomerAccount = () => {
      const existingList = JSON.parse(localStorage.getItem('sr_registered_customers') || '[]');
      const filtered = existingList.filter((c) => c.email.toLowerCase() !== cleanEmail);
      filtered.push({
        _id: `cust-${Date.now()}`,
        fullname: cleanFullname,
        name: cleanFullname,
        email: cleanEmail,
        phone: cleanPhone,
        password: formData.password,
        role: 'user'
      });
      localStorage.setItem('sr_registered_customers', JSON.stringify(filtered));
    };

    try {
      try {
        await axios.post(
          'http://localhost:5000/register',
          {
            ...formData,
            fullname: cleanFullname,
            email: cleanEmail,
            phone: cleanPhone,
          },
          { timeout: 3500 }
        );
      } catch {
        // Save to local customer store even if backend is offline or email existed in old DB
      }

      saveLocalCustomerAccount();
      localStorage.setItem(
        'sr_last_registered_customer',
        JSON.stringify({
          fullname: cleanFullname,
          email: cleanEmail,
          phone: cleanPhone,
        })
      );

      // Clear any previous active customer session so the new user signs in cleanly
      localStorage.removeItem('jwtToken');
      localStorage.removeItem('userName');
      localStorage.setItem('userRole', 'user');
      if (refreshAuth) refreshAuth();

      toast.success(`Account created for ${cleanFullname}! Redirecting to Sign In...`, {
        position: 'top-center',
        autoClose: 2000,
      });

      setErrors({});
      setFormData({
        fullname: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        agree: false,
      });

      setTimeout(() => {
        navigate('/signin', {
          state: { registeredEmail: cleanEmail, registeredName: cleanFullname },
        });
      }, 1000);
    } catch (err) {
      const serverMsg =
        err.response?.data?.message ||
        'Unable to complete registration. Please check your details.';
      setErrors((prev) => ({ ...prev, general: serverMsg }));
      toast.error(serverMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card-pro">
        <Box sx={{ textAlign: 'center', mb: 2.5 }}>
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
            <VerifiedUserRounded sx={{ fontSize: 28 }} />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a' }}>
            Create Your{' '}
            <span className="brand-wordmark">
              <span className="brand-soapy">Soapy</span>
              <span className="brand-ride">Ride</span>
            </span>{' '}
            Account
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
            Register to book service bays, track vehicle maintenance & unlock member discounts.
          </Typography>
        </Box>

        {errors.general && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: '10px' }}>
            {errors.general}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <InputField
            name="fullname"
            label="Full Name"
            placeholder="e.g. Kasun Perera"
            value={formData.fullname}
            onChange={handleChange}
            onBlur={handleBlur}
            error={!!errors.fullname}
            helperText={errors.fullname}
            startIcon={<PersonRounded fontSize="small" />}
          />

          <InputField
            name="email"
            label="Email Address"
            type="email"
            placeholder="name@example.com"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            error={!!errors.email}
            helperText={errors.email}
            startIcon={<EmailRounded fontSize="small" />}
          />

          <InputField
            name="phone"
            label="Mobile Number (10 Digits)"
            type="tel"
            placeholder="0771234567"
            value={formData.phone}
            onChange={handleChange}
            onBlur={handleBlur}
            error={!!errors.phone}
            helperText={errors.phone}
            startIcon={<PhoneAndroidRounded fontSize="small" />}
          />

          <InputField
            name="password"
            label="Password"
            type="password"
            placeholder="Minimum 8 characters"
            value={formData.password}
            onChange={handleChange}
            onBlur={handleBlur}
            error={!!errors.password}
            helperText={errors.password}
            startIcon={<LockRounded fontSize="small" />}
          />

          {/* Interactive Password Strength & Validation Checklist */}
          <div className="password-strength-meter">
            <div className="strength-bars">
              {[1, 2, 3, 4].map((idx) => (
                <div
                  key={idx}
                  className="strength-bar-segment"
                  style={{
                    backgroundColor:
                      strengthScore >= idx ? strengthColors[strengthScore] : '#e2e8f0',
                  }}
                />
              ))}
            </div>
            <div className="password-rules-grid">
              <div className={`pwd-rule-item ${pwdChecks.length ? 'met' : ''}`}>
                {pwdChecks.length ? (
                  <CheckCircleRounded sx={{ fontSize: 15, color: '#10b981' }} />
                ) : (
                  <RadioButtonUncheckedRounded sx={{ fontSize: 15 }} />
                )}
                <span>8+ characters</span>
              </div>
              <div className={`pwd-rule-item ${pwdChecks.caseMix ? 'met' : ''}`}>
                {pwdChecks.caseMix ? (
                  <CheckCircleRounded sx={{ fontSize: 15, color: '#10b981' }} />
                ) : (
                  <RadioButtonUncheckedRounded sx={{ fontSize: 15 }} />
                )}
                <span>Upper & lower case</span>
              </div>
              <div className={`pwd-rule-item ${pwdChecks.number ? 'met' : ''}`}>
                {pwdChecks.number ? (
                  <CheckCircleRounded sx={{ fontSize: 15, color: '#10b981' }} />
                ) : (
                  <RadioButtonUncheckedRounded sx={{ fontSize: 15 }} />
                )}
                <span>At least 1 number</span>
              </div>
              <div className={`pwd-rule-item ${pwdChecks.match ? 'met' : ''}`}>
                {pwdChecks.match ? (
                  <CheckCircleRounded sx={{ fontSize: 15, color: '#10b981' }} />
                ) : (
                  <RadioButtonUncheckedRounded sx={{ fontSize: 15 }} />
                )}
                <span>Passwords match</span>
              </div>
            </div>
          </div>

          <InputField
            name="confirmPassword"
            label="Confirm Password"
            type="password"
            placeholder="Re-enter your password"
            value={formData.confirmPassword}
            onChange={handleChange}
            onBlur={handleBlur}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword}
            startIcon={<LockRounded fontSize="small" />}
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={formData.agree}
                onChange={handleChange}
                onBlur={handleBlur}
                name="agree"
                sx={{ color: '#0284c7', '&.Mui-checked': { color: '#0284c7' } }}
              />
            }
            label={
              <Typography variant="body2" sx={{ color: '#334155' }}>
                I agree to the Service Center Terms & Privacy Policy
              </Typography>
            }
          />
          {errors.agree && (
            <Typography variant="caption" color="error" sx={{ display: 'block', mt: -0.5, mb: 1 }}>
              {errors.agree}
            </Typography>
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={submitting}
            startIcon={
              submitting ? <CircularProgress size={18} color="inherit" /> : <HowToRegRounded />
            }
            sx={{
              mt: 1.5,
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
            {submitting ? 'Creating Account...' : 'Create Member Account'}
          </Button>

          <Typography
            variant="body2"
            align="center"
            sx={{ mt: 2.5, color: '#64748b' }}
          >
            Already have a SoapyRide account?{' '}
            <Link
              to="/signin"
              style={{ color: '#0284c7', fontWeight: 700, textDecoration: 'none' }}
            >
              Sign In
            </Link>
          </Typography>
        </Box>
      </div>
    </div>
  );
};

export default RegistrationPage;
