import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MiniServiceContainer from './MiniServiceContainer';
import {
  LocalCarWashRounded,
  AutoFixHighRounded,
  FactCheckRounded,
  FormatPaintRounded,
  HandymanRounded,
  TireRepairRounded,
  CalculateRounded,
  DirectionsCarRounded,
  AirportShuttleRounded,
  TwoWheelerRounded,
  TimeToLeaveRounded,
  CheckCircleRounded,
  RadioButtonUncheckedRounded,
  CalendarMonthRounded,
  AccessTimeRounded,
} from '@mui/icons-material';

const serviceItems = [
  {
    title: 'Signature Foam Car Wash',
    icon: <LocalCarWashRounded sx={{ fontSize: 30 }} />,
    price: 'From Rs. 1,500',
    duration: '45 mins',
    description:
      'Touchless snow-foam pre-wash, two-bucket microfiber hand wash, deep interior vacuuming, and rim decontamination for a showroom finish.',
    highlights: ['pH-Neutral Snow Foam', 'Underbody Flush', 'Microfiber Dry'],
  },
  {
    title: '24-Point Diagnostic Check-Up',
    icon: <FactCheckRounded sx={{ fontSize: 30 }} />,
    price: 'From Rs. 2,500',
    duration: '60 mins',
    description:
      'Computerized OBD-II engine fault scan, battery & alternator load test, brake pad thickness check, fluid inspection, and suspension audit.',
    highlights: ['OBD-II Computer Scan', 'Battery Health Test', 'Brake & Fluid Audit'],
  },
  {
    title: 'Full Mechanical Car Service',
    icon: <HandymanRounded sx={{ fontSize: 30 }} />,
    price: 'From Rs. 8,500',
    duration: '2.5 hrs',
    description:
      'Synthetic engine oil & filter change, air/cabin filter replacement, spark plug inspection, coolant top-up, and brake caliper servicing.',
    highlights: ['Synthetic Oil & Filter', 'Cabin & Air Filter', 'Service Book Stamp'],
  },
  {
    title: '3D Laser Wheel Alignment',
    icon: <TireRepairRounded sx={{ fontSize: 30 }} />,
    price: 'From Rs. 3,800',
    duration: '50 mins',
    description:
      'Precision 4-wheel laser alignment, digital wheel balancing, nitrogen tire inflation, and tire tread wear optimization for smoother handling.',
    highlights: ['Camber/Caster/Toe', 'Digital Balancing', 'Nitrogen Fill'],
  },
  {
    title: 'Paint Correction & Ceramic',
    icon: <FormatPaintRounded sx={{ fontSize: 30 }} />,
    price: 'From Rs. 14,500',
    duration: '4 hrs',
    description:
      'Multi-stage machine polishing to remove swirl marks and oxidation, sealed with hydrophobic 9H ceramic coating or booth paint touch-up.',
    highlights: ['Swirl Removal', '9H Ceramic Shield', 'UV & Rain Repellent'],
  },
  {
    title: 'Custom Upgrades & Detailing',
    icon: <AutoFixHighRounded sx={{ fontSize: 30 }} />,
    price: 'From Rs. 5,000',
    duration: '90 mins',
    description:
      'Interior steam sanitization, leather conditioning, headlight restoration, ambient trim upgrades, and acoustic/performance tuning.',
    highlights: ['Headlight Restore', 'Steam Sanitization', 'Leather Care'],
  },
];

const vehicleTypes = [
  { id: 'Car', label: 'Sedan / Hatch', multiplier: 1.0, icon: <DirectionsCarRounded /> },
  { id: 'SUV', label: 'SUV / 4x4', multiplier: 1.25, icon: <TimeToLeaveRounded /> },
  { id: 'Van', label: 'Van / MPV', multiplier: 1.35, icon: <AirportShuttleRounded /> },
  { id: 'Bike', label: 'Motorcycle', multiplier: 0.6, icon: <TwoWheelerRounded /> },
];

const basePackages = [
  { id: 'Basic Wash', name: 'Express Eco Wash', basePrice: 1500, baseMins: 40 },
  { id: 'Premium Wash', name: 'Premium Wax & Interior Spa', basePrice: 3500, baseMins: 75 },
  { id: 'Detailing', name: 'Full 24-Point Service & Detailing', basePrice: 8500, baseMins: 150 },
];

const addonOptions = [
  { id: 'engine', name: 'Engine Bay Degrease & Dress', price: 1800, mins: 25 },
  { id: 'ac', name: 'AC Vent Antibacterial Fogging', price: 1500, mins: 20 },
  { id: 'headlight', name: 'UV Headlight Restoration', price: 2200, mins: 30 },
  { id: 'alignment', name: '3D Wheel Alignment Check', price: 3200, mins: 35 },
  { id: 'undercarriage', name: 'Undercarriage Anti-Rust Wash', price: 1200, mins: 15 },
  { id: 'obd', name: 'OBD-II Computer Diagnostics', price: 2000, mins: 20 },
];

const MiniServiceContainerDetails = () => {
  const navigate = useNavigate();
  const [selectedVehicle, setSelectedVehicle] = useState('Car');
  const [selectedPackage, setSelectedPackage] = useState('Premium Wash');
  const [selectedAddons, setSelectedAddons] = useState(['engine', 'ac']);

  const toggleAddon = (id) => {
    setSelectedAddons((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const vehicleObj = vehicleTypes.find((v) => v.id === selectedVehicle) || vehicleTypes[0];
  const pkgObj = basePackages.find((p) => p.id === selectedPackage) || basePackages[1];
  const addonsTotal = selectedAddons.reduce((sum, id) => {
    const found = addonOptions.find((a) => a.id === id);
    return sum + (found ? found.price : 0);
  }, 0);
  const addonsMins = selectedAddons.reduce((sum, id) => {
    const found = addonOptions.find((a) => a.id === id);
    return sum + (found ? found.mins : 0);
  }, 0);

  const totalPrice = Math.round(pkgObj.basePrice * vehicleObj.multiplier + addonsTotal);
  const totalMins = pkgObj.baseMins + addonsMins;

  const handleBookEstimate = () => {
    const addonNames = selectedAddons
      .map((id) => addonOptions.find((a) => a.id === id)?.name)
      .filter(Boolean)
      .join(', ');

    navigate('/bookingform', {
      state: {
        vehicleType: selectedVehicle,
        washPackage: selectedPackage,
        estimatedPrice: totalPrice,
        notes: addonNames ? `Selected Add-ons: ${addonNames}` : '',
      },
    });
  };

  return (
    <section className="pro-section" style={{ paddingTop: '1rem' }}>
      <div className="pro-services-grid">
        {serviceItems.map((service) => (
          <MiniServiceContainer key={service.title} {...service} />
        ))}
      </div>

      {/* Interactive Service Center Cost & Duration Estimator */}
      <div className="estimator-wrapper">
        <div style={{ marginBottom: '2rem' }}>
          <div className="estimator-step-title">
            <CalculateRounded fontSize="small" />
            <span>Interactive Service Cost & Bay Time Calculator</span>
          </div>
          <h3 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.35rem' }}>
            Build Your Custom Service Plan
          </h3>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>
            Select your vehicle class, core service package, and specialized treatments for an instant transparent quote.
          </p>
        </div>

        <div className="estimator-grid">
          <div>
            <div className="estimator-step-title">1. Select Vehicle Class</div>
            <div className="vehicle-selector-row">
              {vehicleTypes.map((v) => (
                <button
                  type="button"
                  key={v.id}
                  className={`vehicle-option-btn ${selectedVehicle === v.id ? 'selected' : ''}`}
                  onClick={() => setSelectedVehicle(v.id)}
                >
                  {v.icon}
                  <span>{v.label}</span>
                </button>
              ))}
            </div>

            <div className="estimator-step-title">2. Choose Core Service Tier</div>
            <div className="vehicle-selector-row" style={{ marginBottom: '1.75rem' }}>
              {basePackages.map((pkg) => (
                <button
                  type="button"
                  key={pkg.id}
                  className={`vehicle-option-btn ${selectedPackage === pkg.id ? 'selected' : ''}`}
                  onClick={() => setSelectedPackage(pkg.id)}
                  style={{ alignItems: 'flex-start', textAlign: 'left', padding: '0.9rem 1rem' }}
                >
                  <strong style={{ fontSize: '0.9rem', color: '#fff' }}>{pkg.name}</strong>
                  <span style={{ fontSize: '0.78rem', color: '#38bdf8' }}>
                    Base: Rs. {pkg.basePrice.toLocaleString()} • {pkg.baseMins}m
                  </span>
                </button>
              ))}
            </div>

            <div className="estimator-step-title">3. Add Specialized Service Center Treatments</div>
            <div className="addons-grid">
              {addonOptions.map((addon) => {
                const active = selectedAddons.includes(addon.id);
                return (
                  <button
                    type="button"
                    key={addon.id}
                    className={`addon-toggle-card ${active ? 'active' : ''}`}
                    onClick={() => toggleAddon(addon.id)}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.86rem' }}>{addon.name}</div>
                      <div style={{ fontSize: '0.76rem', color: '#94a3b8' }}>
                        +Rs. {addon.price.toLocaleString()} • +{addon.mins}m
                      </div>
                    </div>
                    {active ? (
                      <CheckCircleRounded sx={{ color: '#10b981', fontSize: 20 }} />
                    ) : (
                      <RadioButtonUncheckedRounded sx={{ color: '#64748b', fontSize: 20 }} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Instant Quote Summary Box */}
          <div className="estimator-summary-box">
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: '#94a3b8',
              }}
            >
              Estimated Service Summary
            </span>
            <div className="summary-price-big">Rs. {totalPrice.toLocaleString()}</div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.86rem',
                color: '#bae6fd',
                marginBottom: '1.25rem',
              }}
            >
              <AccessTimeRounded sx={{ fontSize: 16 }} />
              <span>Estimated Bay Time: ~{totalMins} mins</span>
            </div>

            <div
              style={{
                borderTop: '1px solid rgba(255,255,255,0.12)',
                paddingTop: '1rem',
                marginBottom: '1.5rem',
                fontSize: '0.86rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                color: '#cbd5e1',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Vehicle Class:</span>
                <strong style={{ color: '#fff' }}>{vehicleObj.label}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Core Package:</span>
                <strong style={{ color: '#fff' }}>{pkgObj.name}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Add-on Treatments:</span>
                <strong style={{ color: '#38bdf8' }}>{selectedAddons.length} selected</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Complimentary:</span>
                <strong style={{ color: '#6ee7b7' }}>24-Point Safety Check</strong>
              </div>
            </div>

            <button
              type="button"
              onClick={handleBookEstimate}
              className="btn-primary-pro"
              style={{ width: '100%' }}
            >
              <CalendarMonthRounded fontSize="small" />
              <span>Book With This Estimate</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MiniServiceContainerDetails;
