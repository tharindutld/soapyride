import React from 'react';
import { EngineeringRounded } from '@mui/icons-material';

const ServiceContainer = () => {
  return (
    <section className="pro-section" style={{ paddingBottom: '1rem' }}>
      <div className="section-header-center">
        <div className="section-eyebrow">
          <EngineeringRounded sx={{ fontSize: 16 }} />
          <span>Certified Automotive Care</span>
        </div>
        <h2 className="section-main-title">Comprehensive Car Service & Detailing Solutions</h2>
        <p className="section-main-desc">
          Our state-of-the-art facility combines touchless foam washing, restorative paint correction,
          computerized diagnostics, and preventive mechanical maintenance under one roof.
        </p>
      </div>
    </section>
  );
};

export default ServiceContainer;
