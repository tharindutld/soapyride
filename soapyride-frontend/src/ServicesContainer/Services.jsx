import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LocalCarWashRounded,
  FactCheckRounded,
  HandymanRounded,
  AutoFixHighRounded,
  FormatPaintRounded,
  TireRepairRounded,
  CheckCircleRounded,
  CalendarMonthRounded,
  AccessTimeRounded,
  VerifiedRounded,
  BatteryChargingFullRounded,
  OilBarrelRounded,
  SpeedRounded,
  AcUnitRounded,
  SecurityRounded,
} from '@mui/icons-material';

const services = [
  {
    title: 'Touchless Foam & Interior Wash',
    icon: <LocalCarWashRounded sx={{ fontSize: 30 }} />,
    price: 'Rs. 1,500+',
    duration: '45 mins',
    description:
      'High-pressure snow foam pre-wash, microfiber hand wash, deep interior vacuum, and tire dressing.',
  },
  {
    title: 'Computerized OBD-II Diagnostics',
    icon: <FactCheckRounded sx={{ fontSize: 30 }} />,
    price: 'Rs. 2,500+',
    duration: '45 mins',
    description:
      'Full ECU fault code scan, live sensor data analysis, battery load test, and emissions readiness check.',
  },
  {
    title: 'Periodic Lube & Mechanical Service',
    icon: <HandymanRounded sx={{ fontSize: 30 }} />,
    price: 'Rs. 8,500+',
    duration: '2.5 hrs',
    description:
      'Full synthetic oil & filter change, brake pad service, coolant flush, air/cabin filter & belt check.',
  },
  {
    title: '3D Wheel Alignment & Balancing',
    icon: <TireRepairRounded sx={{ fontSize: 30 }} />,
    price: 'Rs. 3,800+',
    duration: '50 mins',
    description:
      'Laser-guided 4-wheel camber, caster, and toe calibration with digital dynamic wheel balancing.',
  },
  {
    title: 'Paint Correction & 9H Ceramic',
    icon: <FormatPaintRounded sx={{ fontSize: 30 }} />,
    price: 'Rs. 14,500+',
    duration: '4 hrs',
    description:
      'Multi-stage machine compounding to eliminate swirl marks followed by hydrophobic 9H ceramic coating.',
  },
  {
    title: 'Interior Spa & Custom Upgrades',
    icon: <AutoFixHighRounded sx={{ fontSize: 30 }} />,
    price: 'Rs. 5,000+',
    duration: '90 mins',
    description:
      'Hot-water fabric extraction, leather nourishment, antibacterial AC fogging, and headlight restoration.',
  },
];

const packages = [
  {
    title: 'Express Eco Wash',
    code: 'Basic Wash',
    price: 'Rs. 1,800',
    rawPrice: 1800,
    duration: '40 Mins',
    featured: false,
    features: [
      'pH-Neutral Snow Foam Exterior Wash',
      'High-Pressure Undercarriage Rinse',
      'Wheel & Brake Dust Decontamination',
      'Interior Vacuum & Mat Cleaning',
      'Microfiber Hand Dry & Tire Shine',
    ],
  },
  {
    title: 'Signature Detailing & Wax Spa',
    code: 'Premium Wash',
    price: 'Rs. 4,500',
    rawPrice: 4500,
    duration: '90 Mins',
    featured: true,
    features: [
      'Everything in Express Eco Wash',
      'Carnauba / Polymer Paint Sealant Wax',
      'Deep Dashboard, Console & Trim Conditioning',
      'Antibacterial AC Vent Steam Sanitization',
      'Engine Bay Surface Wipe & Dressing',
      'Complimentary 24-Point Safety Check',
    ],
  },
  {
    title: 'Full Mechanical & Detailing Care',
    code: 'Detailing',
    price: 'Rs. 11,500',
    rawPrice: 11500,
    duration: '3 Hours',
    featured: false,
    features: [
      'Full Synthetic Oil & Oil Filter Replacement',
      'Computerized OBD-II Engine Diagnostics',
      'Brake Pad, Rotor & Fluid Inspection',
      'Complete Interior Seat Shampoo / Leather Care',
      'Single-Stage Exterior Machine Gloss Polish',
      'Digital Service Health Report & Stamp',
    ],
  },
];

const inspectionCategories = [
  {
    title: 'Engine & Fluids',
    icon: <OilBarrelRounded sx={{ color: '#0284c7' }} />,
    items: [
      'Engine oil level & viscosity',
      'Coolant strength & radiator cap',
      'Brake & power steering fluid',
      'Drive belts & hoses tension',
    ],
  },
  {
    title: 'Brakes & Suspension',
    icon: <SecurityRounded sx={{ color: '#0284c7' }} />,
    items: [
      'Front & rear brake pad thickness',
      'Brake disc / rotor scoring check',
      'Shock absorbers & struts rebound',
      'Ball joints, tie rods & bushings',
    ],
  },
  {
    title: 'Battery & Electrical',
    icon: <BatteryChargingFullRounded sx={{ color: '#0284c7' }} />,
    items: [
      'Battery CCA load & voltage test',
      'Alternator charging output',
      'OBD-II ECU fault memory scan',
      'Headlights, brake lights & wipers',
    ],
  },
  {
    title: 'Tires & Climate Control',
    icon: <AcUnitRounded sx={{ color: '#0284c7' }} />,
    items: [
      'Tire tread depth & uneven wear',
      'Precision pressure & spare check',
      'Cabin HEPA filter condition',
      'AC compressor & vent temperature',
    ],
  },
];

const Services = () => {
  const navigate = useNavigate();

  return (
    <div className="pro-section">
      {/* Header */}
      <div className="section-header-center">
        <div className="section-eyebrow">
          <VerifiedRounded sx={{ fontSize: 16 }} />
          <span>Full-Service Automotive Center</span>
        </div>
        <h1 className="section-main-title">Specialized Services & Care Packages</h1>
        <p className="section-main-desc">
          Engineered for longevity, safety, and showroom brilliance. Choose individual treatments
          or an all-inclusive care package backed by certified technicians.
        </p>
      </div>

      {/* Core Departments Grid */}
      <div className="pro-services-grid" style={{ marginBottom: '4rem' }}>
        {services.map(({ title, icon, description, price, duration }) => (
          <div className="pro-service-card" key={title}>
            <div>
              <div className="service-card-top">
                <div className="service-react-icon-box">{icon}</div>
                <div className="service-meta-chips">
                  <span className="meta-chip-price">{price}</span>
                  <span className="meta-chip-time">
                    <AccessTimeRounded sx={{ fontSize: 14 }} />
                    {duration}
                  </span>
                </div>
              </div>
              <h5>{title}</h5>
              <p>{description}</p>
            </div>
            <div className="service-card-footer">
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
                Certified Technicians
              </span>
              <button
                type="button"
                className="service-book-link"
                onClick={() =>
                  navigate('/bookingform', {
                    state: { washPackage: title },
                  })
                }
              >
                <CalendarMonthRounded sx={{ fontSize: 16 }} />
                <span>Book Now</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Tiered Packages */}
      <div className="section-header-center">
        <div className="section-eyebrow">
          <SpeedRounded sx={{ fontSize: 16 }} />
          <span>Transparent Pricing</span>
        </div>
        <h2 className="section-main-title">All-Inclusive Service Packages</h2>
        <p className="section-main-desc">
          Every package includes complimentary multi-point safety inspection and digital service logging.
        </p>
      </div>

      <div className="packages-grid-pro" style={{ marginBottom: '4.5rem' }}>
        {packages.map((pkg) => (
          <div
            key={pkg.title}
            className={`package-card-pro ${pkg.featured ? 'featured' : ''}`}
          >
            {pkg.featured && <span className="package-popular-ribbon">Most Popular</span>}
            <div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>
                {pkg.title}
              </h3>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontSize: '0.82rem',
                  color: '#64748b',
                  marginTop: '4px',
                }}
              >
                <AccessTimeRounded sx={{ fontSize: 15 }} />
                <span>Estimated Duration: {pkg.duration}</span>
              </div>

              <div className="package-price-tag">{pkg.price}</div>

              <ul className="package-feature-list">
                {pkg.features.map((feat) => (
                  <li key={feat}>
                    <CheckCircleRounded sx={{ fontSize: 18, color: '#10b981', flexShrink: 0 }} />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              type="button"
              className={pkg.featured ? 'btn-primary-pro' : 'btn-outline-pro'}
              style={
                !pkg.featured
                  ? {
                      width: '100%',
                      color: '#0284c7',
                      borderColor: '#0284c7',
                      background: 'rgba(2, 132, 199, 0.06)',
                    }
                  : { width: '100%' }
              }
              onClick={() =>
                navigate('/bookingform', {
                  state: {
                    washPackage: pkg.code,
                    estimatedPrice: pkg.rawPrice,
                  },
                })
              }
            >
              <CalendarMonthRounded fontSize="small" />
              <span>Select {pkg.title}</span>
            </button>
          </div>
        ))}
      </div>

      {/* 24-Point Vehicle Health Checklist */}
      <div className="section-header-center">
        <div className="section-eyebrow">
          <FactCheckRounded sx={{ fontSize: 16 }} />
          <span>Preventive Maintenance Standard</span>
        </div>
        <h2 className="section-main-title">24-Point Vehicle Health Checklist</h2>
        <p className="section-main-desc">
          Included with every full service and detailing appointment to catch wear early and keep your family safe on the road.
        </p>
      </div>

      <div className="inspection-grid">
        {inspectionCategories.map((cat) => (
          <div className="inspection-card" key={cat.title}>
            <h6>
              {cat.icon}
              <span>{cat.title}</span>
            </h6>
            <ul>
              {cat.items.map((item) => (
                <li key={item}>
                  <CheckCircleRounded sx={{ fontSize: 15, color: '#0284c7' }} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Services;
