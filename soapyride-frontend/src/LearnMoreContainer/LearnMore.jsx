import React from 'react';
import { Container, Typography, Box, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  VerifiedRounded,
  CalendarMonthRounded,
  ArrowBackRounded,
  CheckCircleRounded,
  WorkspacePremiumRounded,
  WaterDropRounded,
  BuildCircleRounded,
} from '@mui/icons-material';

const LearnMore = () => {
  const navigate = useNavigate();

  const pillars = [
    {
      icon: <WaterDropRounded sx={{ fontSize: 28, color: '#0284c7' }} />,
      title: 'Deionized Water & Microfiber Protocol',
      text: 'Spot-free rinse water and color-coded microfiber towels ensure zero cross-contamination or clear-coat swirl marks.',
    },
    {
      icon: <BuildCircleRounded sx={{ fontSize: 28, color: '#0284c7' }} />,
      title: 'Preventive Maintenance Intervals',
      text: 'Recommended every 5,000 km: synthetic oil service, brake pad thickness audit, tire rotation, and OBD-II fault scan.',
    },
    {
      icon: <WorkspacePremiumRounded sx={{ fontSize: 28, color: '#0284c7' }} />,
      title: 'SoapyRide Loyalty Club',
      text: 'Earn points on every wash and periodic service—unlock every 6th express foam wash free plus priority bay booking.',
    },
  ];

  return (
    <section className="pro-section">
      <Container maxWidth="md">
        <div className="booking-card-pro">
          <div className="section-eyebrow">
            <VerifiedRounded sx={{ fontSize: 16 }} />
            <span>The SoapyRide Standard</span>
          </div>

          <Typography variant="h3" sx={{ fontWeight: 800, color: '#0f172a', mb: 2, fontSize: '2.2rem' }}>
            Learn More About{' '}
            <span className="brand-wordmark">
              <span className="brand-soapy">Soapy</span>
              <span className="brand-ride">Ride</span>
            </span>
          </Typography>

          <Typography variant="body1" sx={{ color: '#475569', mb: 3, lineHeight: 1.75 }}>
            SoapyRide is your complete destination for automotive detailing and preventive mechanical
            care. Unlike traditional roadside washes that use harsh detergents and abrasive sponges,
            our bays use calibrated pressure systems, pH-balanced snow foam, and certified diagnostic
            equipment to protect your investment.
          </Typography>

          <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
            {pillars.map((p) => (
              <Grid item xs={12} md={4} key={p.title}>
                <Box
                  sx={{
                    p: 2.25,
                    borderRadius: '14px',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    height: '100%',
                  }}
                >
                  <Box sx={{ mb: 1 }}>{p.icon}</Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f172a', mb: 0.5 }}>
                    {p.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748b', lineHeight: 1.6 }}>
                    {p.text}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>

          <Box
            sx={{
              p: 2.25,
              borderRadius: '14px',
              background: '#f0f9ff',
              border: '1px solid #bae6fd',
              mb: 3.5,
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0369a1', mb: 1 }}>
              Every Visit Includes Complimentary Checks:
            </Typography>
            <Grid container spacing={1}>
              {[
                'Digital Tire Pressure & Tread Check',
                'Windshield Washer Fluid Top-Up',
                'Battery Terminal Voltage Check',
                'Underbody Mud & Salt Flush',
              ].map((item) => (
                <Grid item xs={12} sm={6} key={item}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#0f172a', fontSize: '0.9rem', fontWeight: 600 }}>
                    <CheckCircleRounded sx={{ fontSize: 18, color: '#0284c7' }} />
                    <span>{item}</span>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
            <button
              type="button"
              onClick={() => navigate('/bookingform')}
              className="btn-primary-pro"
            >
              <CalendarMonthRounded fontSize="small" />
              <span>Book Your First Service</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/')}
              className="btn-outline-pro"
              style={{
                color: '#0f172a',
                borderColor: '#cbd5e1',
                background: '#f8fafc',
              }}
            >
              <ArrowBackRounded fontSize="small" />
              <span>Return to Home</span>
            </button>
          </Box>
        </div>
      </Container>
    </section>
  );
};

export default LearnMore;
