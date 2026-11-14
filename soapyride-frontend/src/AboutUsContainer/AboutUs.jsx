import React from 'react';
import { Container, Typography, Grid, Box } from '@mui/material';
import {
  SpaRounded,
  VerifiedRounded,
  EngineeringRounded,
  SpeedRounded,
  SecurityRounded,
  EmojiEventsRounded,
} from '@mui/icons-material';

const features = [
  {
    icon: <SpaRounded sx={{ fontSize: 30 }} />,
    title: 'Eco-Safe & pH-Neutral Chemistry',
    description:
      'We use biodegradable snow foams, water-reclamation filtration, and VOC-free interior cleaners that protect both your clear coat and the environment.',
  },
  {
    icon: <EngineeringRounded sx={{ fontSize: 30 }} />,
    title: 'ASE-Certified Technicians',
    description:
      'Our diagnostic specialists and master detailers undergo continuous training on modern hybrid, EV, and combustion vehicle systems.',
  },
  {
    icon: <SpeedRounded sx={{ fontSize: 30 }} />,
    title: 'Computerized OBD-II & 3D Alignment',
    description:
      'Equipped with laser wheel alignment rigs, digital dynamic balancers, and dealer-grade diagnostic scanners for pinpoint accuracy.',
  },
  {
    icon: <SecurityRounded sx={{ fontSize: 30 }} />,
    title: 'Transparent Digital Inspection Reports',
    description:
      'Every service includes a 24-point health check with clear upfront pricing—no hidden fees or unauthorized part replacements.',
  },
  {
    icon: <VerifiedRounded sx={{ fontSize: 30 }} />,
    title: 'Genuine OEM Filters & Synthetic Oils',
    description:
      'We stock only manufacturer-approved synthetic lubricants and genuine oil, cabin, and air filters to preserve your vehicle warranty.',
  },
  {
    icon: <EmojiEventsRounded sx={{ fontSize: 30 }} />,
    title: '100% Workmanship Guarantee',
    description:
      'From 9H ceramic coatings to brake overhauls, every job is backed by our service center quality guarantee.',
  },
];

const AboutUs = () => {
  return (
    <section className="pro-section">
      <Container maxWidth="lg">
        <div className="section-header-center">
          <div className="section-eyebrow">
            <VerifiedRounded sx={{ fontSize: 16 }} />
            <span>About Our Service Center</span>
          </div>
          <Typography variant="h3" className="section-main-title">
            About{' '}
            <span className="brand-wordmark">
              <span className="brand-soapy">Soapy</span>
              <span className="brand-ride">Ride</span>
            </span>
          </Typography>
          <Typography variant="body1" className="section-main-desc">
            At SoapyRide Auto Care & Detailing Center, we go far beyond basic car washing. With
            precision diagnostics, certified mechanical maintenance, and restorative detailing, we
            keep your vehicle performing and looking like the day it left the showroom.
          </Typography>
        </div>

        <Grid container spacing={3.5}>
          {features.map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item.title}>
              <div className="about-pro-card">
                <Box
                  sx={{
                    width: 54,
                    height: 54,
                    borderRadius: '14px',
                    background: 'rgba(2, 132, 199, 0.12)',
                    color: '#0284c7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2,
                  }}
                >
                  {item.icon}
                </Box>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, color: '#0f172a', mb: 1, fontSize: '1.15rem' }}
                >
                  {item.title}
                </Typography>
                <Typography variant="body2" sx={{ color: '#475569', lineHeight: 1.65 }}>
                  {item.description}
                </Typography>
              </div>
            </Grid>
          ))}
        </Grid>
      </Container>
    </section>
  );
};

export default AboutUs;
