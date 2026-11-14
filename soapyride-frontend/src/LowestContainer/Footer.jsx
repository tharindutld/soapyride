import React from 'react';
import { Box, Typography, Grid, IconButton, Fab, Container } from '@mui/material';
import {
  Facebook,
  Instagram,
  Twitter,
  YouTube,
  KeyboardArrowUp,
  LocationOnRounded,
  PhoneInTalkRounded,
  EmailRounded,
  LocalCarWashRounded,
  ChevronRightRounded,
  AccessTimeRounded,
} from '@mui/icons-material';
import { Link, useLocation } from 'react-router-dom';

const Footer = () => {
  const location = useLocation();

  if (location.pathname === '/admin' || location.pathname.startsWith('/admin/dashboard')) {
    return null;
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: '#0b192c',
        color: '#f8fafc',
        pt: 7,
        pb: 5,
        mt: 'auto',
        borderTop: '1px solid rgba(56, 189, 248, 0.16)',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4} justifyContent="space-between">
          {/* Brand Column */}
          <Grid item xs={12} sm={6} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                }}
              >
                <LocalCarWashRounded fontSize="small" />
              </Box>
              <Box>
                <Typography
                  variant="h5"
                  sx={{
                    fontFamily: "'Outfit', 'Segoe UI', sans-serif",
                    fontWeight: 800,
                    letterSpacing: '-0.5px',
                    lineHeight: 1,
                    display: 'inline-flex',
                  }}
                >
                  <Box component="span" sx={{ color: '#38bdf8' }}>
                    Soapy
                  </Box>
                  <Box component="span" sx={{ color: '#ffffff' }}>
                    Ride
                  </Box>
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    display: 'block',
                    letterSpacing: '0.2em',
                    color: '#94a3b8',
                    fontWeight: 700,
                    fontSize: '0.62rem',
                  }}
                >
                  AUTO SERVICE & DETAILING
                </Typography>
              </Box>
            </Box>

            <Typography variant="body2" sx={{ color: '#94a3b8', lineHeight: 1.7, mb: 2 }}>
              Colombo&apos;s premier car service center for touchless snow-foam washing, 9H ceramic
              protection, computerized OBD-II diagnostics, and 3D laser wheel alignment.
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#cbd5e1', fontSize: '0.84rem' }}>
              <AccessTimeRounded sx={{ fontSize: 17, color: '#38bdf8' }} />
              <span>Open Daily: 7:30 AM – 7:00 PM</span>
            </Box>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography
              variant="subtitle1"
              sx={{ color: '#ffffff', fontWeight: 700, mb: 1.75 }}
            >
              Service Navigation
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.1 }}>
              <Link to="/" className="link-custom">
                <ChevronRightRounded fontSize="small" sx={{ color: '#38bdf8' }} />
                <span>Home & Bay Status</span>
              </Link>
              <Link to="/service" className="link-custom">
                <ChevronRightRounded fontSize="small" sx={{ color: '#38bdf8' }} />
                <span>Services & Packages</span>
              </Link>
              <Link to="/bookingform" className="link-custom">
                <ChevronRightRounded fontSize="small" sx={{ color: '#38bdf8' }} />
                <span>Book Service Bay</span>
              </Link>
              <Link to="/about" className="link-custom">
                <ChevronRightRounded fontSize="small" sx={{ color: '#38bdf8' }} />
                <span>About Our Center</span>
              </Link>
              <Link to="/contact" className="link-custom">
                <ChevronRightRounded fontSize="small" sx={{ color: '#38bdf8' }} />
                <span>Contact & Roadside Help</span>
              </Link>
              <Link to="/admin/login" className="link-custom">
                <ChevronRightRounded fontSize="small" sx={{ color: '#38bdf8' }} />
                <span>Admin & Shop Owner Login</span>
              </Link>
            </Box>
          </Grid>

          {/* Contact + Social */}
          <Grid item xs={12} sm={12} md={4}>
            <Typography
              variant="subtitle1"
              sx={{ color: '#ffffff', fontWeight: 700, mb: 1.75 }}
            >
              Service Desk & Location
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, color: '#cbd5e1' }}>
                <LocationOnRounded sx={{ fontSize: 19, color: '#38bdf8' }} />
                <Typography variant="body2">No. 247, Main Street, Colombo 03</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, color: '#cbd5e1' }}>
                <PhoneInTalkRounded sx={{ fontSize: 19, color: '#38bdf8' }} />
                <Typography variant="body2">+94 11 234 5678 • Emergency: 1990</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, color: '#cbd5e1' }}>
                <EmailRounded sx={{ fontSize: 19, color: '#38bdf8' }} />
                <Typography variant="body2">info@soapyride.com</Typography>
              </Box>
            </Box>

            <Box sx={{ mt: 2.5, display: 'flex', gap: 1 }}>
              {[
                { icon: <Facebook fontSize="small" />, label: 'Facebook' },
                { icon: <Instagram fontSize="small" />, label: 'Instagram' },
                { icon: <Twitter fontSize="small" />, label: 'Twitter' },
                { icon: <YouTube fontSize="small" />, label: 'YouTube' },
              ].map((social) => (
                <IconButton
                  key={social.label}
                  href="#"
                  aria-label={social.label}
                  size="small"
                  sx={{
                    color: '#cbd5e1',
                    bgcolor: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    '&:hover': {
                      bgcolor: '#0284c7',
                      color: '#fff',
                    },
                  }}
                >
                  {social.icon}
                </IconButton>
              ))}
            </Box>
          </Grid>
        </Grid>

        {/* Footer Bottom */}
        <Box
          sx={{
            textAlign: 'center',
            mt: 5,
            pt: 3,
            borderTop: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <Typography variant="caption" sx={{ color: '#64748b' }}>
            &copy; {new Date().getFullYear()} SoapyRide Auto Service & Detailing Center. All rights
            reserved.
          </Typography>
        </Box>
      </Container>

      {/* Scroll to Top */}
      <Fab
        onClick={scrollToTop}
        size="small"
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          bgcolor: '#0284c7',
          color: 'white',
          boxShadow: '0 8px 20px rgba(2, 132, 199, 0.45)',
          '&:hover': {
            bgcolor: '#0369a1',
          },
        }}
        aria-label="scroll to top"
      >
        <KeyboardArrowUp />
      </Fab>
    </Box>
  );
};

export default Footer;
