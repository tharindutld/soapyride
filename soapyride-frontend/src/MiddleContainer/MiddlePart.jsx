import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarMonthRounded,
  BuildCircleRounded,
  SpeedRounded,
  LocalCarWashRounded,
  AutoFixHighRounded,
  HandymanRounded,
  TireRepairRounded,
  VerifiedRounded,
  ArrowForwardRounded,
} from '@mui/icons-material';

const serviceBays = [
  {
    name: 'Express Foam & Wash Bay 01',
    detail: 'Avg. wait: ~10 mins • High-pressure touchless',
    status: 'Available Now',
    type: 'open',
    icon: <LocalCarWashRounded sx={{ color: '#38bdf8' }} />,
  },
  {
    name: 'Ceramic & Interior Detailing Studio',
    detail: '9H Paint Protection & Steam Sanitization',
    status: '2 Slots Today',
    type: 'open',
    icon: <AutoFixHighRounded sx={{ color: '#38bdf8' }} />,
  },
  {
    name: 'Mechanical & OBD-II Diagnostics Bay',
    detail: 'Lube service, brake pads & 24-point check',
    status: 'In Progress (15m)',
    type: 'busy',
    icon: <HandymanRounded sx={{ color: '#fcd34d' }} />,
  },
  {
    name: '3D Laser Wheel Alignment & Balancing',
    detail: 'Precision camber, caster & toe calibration',
    status: 'Available Now',
    type: 'open',
    icon: <TireRepairRounded sx={{ color: '#38bdf8' }} />,
  },
];

const MiddlePart = () => {
  const navigate = useNavigate();

  return (
    <section className="hero-section">
      <div className="hero-inner">
        <div>
          <div className="hero-status-pill">
            <span className="status-dot-pulse" />
            <span>Service Center Open • Express Bays Ready</span>
          </div>

          <h1 className="hero-title">
            Precision Auto Care,{' '}
            <span className="hero-title-accent">Detailing & Diagnostics</span>
          </h1>

          <p className="hero-subtitle">
            From pH-neutral foam washes and 9H ceramic coatings to computerized OBD-II engine
            diagnostics, oil changes, and 3D wheel alignment—experience certified care engineered
            for your vehicle.
          </p>

          <div className="hero-cta-row">
            <button
              type="button"
              onClick={() => navigate('/bookingform')}
              className="btn-primary-pro"
            >
              <CalendarMonthRounded fontSize="small" />
              <span>Book Service Appointment</span>
              <ArrowForwardRounded fontSize="small" />
            </button>

            <button
              type="button"
              onClick={() => navigate('/service')}
              className="btn-outline-pro"
            >
              <BuildCircleRounded fontSize="small" />
              <span>Explore Packages & Pricing</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/learnmore')}
              className="btn-outline-pro"
            >
              <VerifiedRounded fontSize="small" />
              <span>Why SoapyRide</span>
            </button>
          </div>

          <div className="hero-metrics-grid">
            <div className="hero-metric-item">
              <strong>15,400+</strong>
              <span>Vehicles Serviced</span>
            </div>
            <div className="hero-metric-item">
              <strong>24-Point</strong>
              <span>Safety Inspection</span>
            </div>
            <div className="hero-metric-item">
              <strong>4.9 / 5.0</strong>
              <span>Client Satisfaction</span>
            </div>
            <div className="hero-metric-item">
              <strong>100%</strong>
              <span>Eco-Safe Chemistry</span>
            </div>
          </div>
        </div>

        {/* Live Service Bay Monitor */}
        <div className="hero-bay-card">
          <div className="hero-bay-header">
            <h4>
              <SpeedRounded sx={{ color: '#38bdf8' }} />
              <span>Live Service Bay Status</span>
            </h4>
            <span
              style={{
                fontSize: '0.75rem',
                color: '#94a3b8',
                fontWeight: 600,
              }}
            >
              Colombo Main Hub
            </span>
          </div>

          <div className="bay-list">
            {serviceBays.map((bay) => (
              <div className="bay-row" key={bay.name}>
                <div className="bay-info">
                  {bay.icon}
                  <div>
                    <strong>{bay.name}</strong>
                    <small>{bay.detail}</small>
                  </div>
                </div>
                <span className={`bay-badge ${bay.type}`}>{bay.status}</span>
              </div>
            ))}
          </div>

          <div
            style={{
              marginTop: '1.25rem',
              paddingTop: '1rem',
              borderTop: '1px solid rgba(255,255,255,0.1)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '0.84rem',
              color: '#cbd5e1',
            }}
          >
            <span>Need priority bay reservation?</span>
            <button
              type="button"
              onClick={() => navigate('/bookingform')}
              style={{
                color: '#38bdf8',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <span>Reserve Slot</span>
              <ArrowForwardRounded sx={{ fontSize: 16 }} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MiddlePart;
