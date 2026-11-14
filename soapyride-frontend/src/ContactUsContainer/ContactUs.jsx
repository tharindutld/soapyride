import React, { useState } from 'react';
import {
  Container,
  Grid,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  InputAdornment,
} from '@mui/material';
import {
  LocationOnRounded,
  PhoneInTalkRounded,
  EmailRounded,
  AccessTimeRounded,
  SendRounded,
  PersonRounded,
  SupportAgentRounded,
  CarCrashRounded,
  CheckCircleRounded,
} from '@mui/icons-material';
import axios from 'axios';
import { toast } from 'react-toastify';

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [formStatus, setFormStatus] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const errs = {};
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      errs.name = 'Please enter your name';
    }
    if (!formData.email.trim() || !EMAIL_REGEX.test(formData.email.trim())) {
      errs.email = 'Please enter a valid email address';
    }
    if (!formData.message.trim() || formData.message.trim().length < 10) {
      errs.message = 'Message must be at least 10 characters';
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormStatus('');
    setError('');

    if (!validate()) return;

    const token = localStorage.getItem('jwtToken');
    if (token) {
      axios.defaults.headers.common['Authorization'] = 'Bearer ' + token;
    }

    setSubmitting(true);
    try {
      await axios.post('http://localhost:5000/post-messages-jwt', {
        name: formData.name.trim(),
        email: formData.email.trim(),
        message: formData.message.trim(),
      });

      setFormStatus('Your inquiry has been received! Our service advisor will contact you shortly.');
      toast.success('Message sent successfully!');
      setFormData({ name: '', email: '', message: '' });
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        'Could not reach the message server. Please ensure the backend is running or call our hotline.';
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="pro-section">
      <Container maxWidth="lg">
        <div className="section-header-center">
          <div className="section-eyebrow">
            <SupportAgentRounded sx={{ fontSize: 16 }} />
            <span>24/7 Service Advisor & Roadside Support</span>
          </div>
          <Typography variant="h3" className="section-main-title">
            Contact Our Service Center
          </Typography>
          <Typography variant="body1" className="section-main-desc">
            Have a question about periodic maintenance, ceramic coating quotes, or fleet accounts?
            Reach out to our team directly.
          </Typography>
        </div>

        <Grid container spacing={4} alignItems="stretch">
          {/* Left Column: Direct Service Center Info */}
          <Grid item xs={12} md={5}>
            <div className="contact-info-panel">
              <div>
                <Typography variant="h5" sx={{ fontWeight: 800, mb: 1, color: '#fff' }}>
                  Colombo Flagship Service Hub
                </Typography>
                <Typography variant="body2" sx={{ color: '#94a3b8', mb: 3.5 }}>
                  Equipped with 6 express wash & detailing bays, 3D alignment rack, and customer lounge with high-speed Wi-Fi.
                </Typography>

                <div className="contact-info-item">
                  <div className="contact-icon-badge">
                    <LocationOnRounded />
                  </div>
                  <div>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#f8fafc' }}>
                      Service Center Address
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#cbd5e1' }}>
                      No. 247, Main Street, Colombo 03, Sri Lanka
                    </Typography>
                  </div>
                </div>

                <div className="contact-info-item">
                  <div className="contact-icon-badge">
                    <PhoneInTalkRounded />
                  </div>
                  <div>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#f8fafc' }}>
                      Direct Service Desk
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#cbd5e1' }}>
                      +94 11 234 5678 / +94 77 123 4567
                    </Typography>
                  </div>
                </div>

                <div className="contact-info-item">
                  <div className="contact-icon-badge">
                    <EmailRounded />
                  </div>
                  <div>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#f8fafc' }}>
                      Email & Fleet Inquiries
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#cbd5e1' }}>
                      info@soapyride.com • service@soapyride.com
                    </Typography>
                  </div>
                </div>

                <div className="contact-info-item">
                  <div className="contact-icon-badge">
                    <AccessTimeRounded />
                  </div>
                  <div>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#f8fafc' }}>
                      Operating Hours
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#cbd5e1' }}>
                      Mon – Sat: 7:30 AM – 7:00 PM
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#cbd5e1' }}>
                      Sunday & Holidays: 8:30 AM – 5:00 PM
                    </Typography>
                  </div>
                </div>
              </div>

              {/* Emergency Roadside Box */}
              <Box
                sx={{
                  mt: 3,
                  p: 2,
                  borderRadius: '14px',
                  background: 'rgba(239, 68, 68, 0.14)',
                  border: '1px solid rgba(239, 68, 68, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                }}
              >
                <CarCrashRounded sx={{ color: '#fca5a5', fontSize: 32 }} />
                <div>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#fecaca' }}>
                    24/7 Emergency Breakdown & Jump-Start
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#fca5a5' }}>
                    Hotline: 1990 / +94 77 999 0000
                  </Typography>
                </div>
              </Box>
            </div>
          </Grid>

          {/* Right Column: Contact Form */}
          <Grid item xs={12} md={7}>
            <div className="booking-card-pro" style={{ height: '100%' }}>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', mb: 0.5 }}>
                Send Us a Message
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b', mb: 2.5 }}>
                Fill out the form below and our service advisor will respond within 30 minutes during business hours.
              </Typography>

              {formStatus && (
                <Alert
                  icon={<CheckCircleRounded fontSize="inherit" />}
                  severity="success"
                  sx={{ mb: 2, borderRadius: '10px' }}
                >
                  {formStatus}
                </Alert>
              )}

              {error && (
                <Alert severity="error" sx={{ mb: 2, borderRadius: '10px' }}>
                  {error}
                </Alert>
              )}

              <form onSubmit={handleSubmit} noValidate>
                <TextField
                  label="Your Full Name"
                  variant="outlined"
                  fullWidth
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  error={!!fieldErrors.name}
                  helperText={fieldErrors.name}
                  margin="normal"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      backgroundColor: '#f8fafc',
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start" sx={{ color: '#64748b' }}>
                        <PersonRounded fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  label="Your Email Address"
                  variant="outlined"
                  fullWidth
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={!!fieldErrors.email}
                  helperText={fieldErrors.email}
                  margin="normal"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      backgroundColor: '#f8fafc',
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start" sx={{ color: '#64748b' }}>
                        <EmailRounded fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  label="How can our service team help you?"
                  variant="outlined"
                  fullWidth
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  error={!!fieldErrors.message}
                  helperText={fieldErrors.message}
                  margin="normal"
                  multiline
                  rows={5}
                  placeholder="Describe your vehicle model, required service, or custom quote inquiry..."
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      backgroundColor: '#f8fafc',
                    },
                  }}
                />

                <Button
                  type="submit"
                  variant="contained"
                  disabled={submitting}
                  startIcon={<SendRounded />}
                  sx={{
                    mt: 2,
                    py: 1.35,
                    px: 4,
                    borderRadius: '12px',
                    fontWeight: 700,
                    textTransform: 'none',
                    fontSize: '0.98rem',
                    background: 'linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%)',
                    boxShadow: '0 8px 20px rgba(2, 132, 199, 0.35)',
                  }}
                >
                  {submitting ? 'Sending Inquiry...' : 'Submit Inquiry'}
                </Button>
              </form>
            </div>
          </Grid>
        </Grid>
      </Container>
    </section>
  );
};

export default ContactUs;
