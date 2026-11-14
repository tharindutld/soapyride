import React, { useState, useEffect, useCallback } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  CalendarMonthRounded,
  PersonRounded,
  PhoneAndroidRounded,
  DirectionsCarRounded,
  AccessTimeRounded,
  BuildCircleRounded,
  CheckCircleRounded,
  ErrorOutlineRounded,
  ConfirmationNumberRounded,
  NotesRounded,
  DeleteOutlineRounded,
  SpeedRounded,
  LoginRounded,
} from '@mui/icons-material';

const PACKAGE_PRICES = {
  'Basic Wash': 1800,
  'Premium Wash': 4500,
  Detailing: 11500,
  'Signature Foam Car Wash': 1800,
  '24-Point Diagnostic Check-Up': 2500,
  'Full Mechanical Car Service': 8500,
  '3D Laser Wheel Alignment': 3800,
  'Paint Correction & Ceramic': 14500,
  'Custom Upgrades & Detailing': 5000,
};

const STAGES = ['Confirmed', 'Checked In', 'In Service Bay', 'Quality Check', 'Ready for Pickup'];

const BookingForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const prefill = location.state || {};

  const [error, setError] = useState('');
  const [formStatus, setFormStatus] = useState('');
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];

  const fetchBookings = useCallback(async () => {
    const token = localStorage.getItem('jwtToken');
    const localSaved = JSON.parse(localStorage.getItem('soapyride_bookings') || '[]');
    if (!token) {
      setBookings(localSaved);
      return;
    }
    setLoadingBookings(true);
    try {
      const res = await axios.get('http://localhost:5000/bookings-jwt', {
        headers: { Authorization: 'Bearer ' + token },
      });
      const serverList = res.data?.data?.bookings || [];
      setBookings(serverList.length ? serverList : localSaved);
    } catch {
      setBookings(localSaved);
    } finally {
      setLoadingBookings(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const initialValues = {
    name: localStorage.getItem('userName') || '',
    phone: '',
    vehicleNumber: '',
    date: todayStr,
    time: '09:30',
    vehicleType: prefill.vehicleType || 'Car',
    washPackage: prefill.washPackage || 'Premium Wash',
    notes: prefill.notes || '',
  };

  const validationSchema = Yup.object({
    name: Yup.string()
      .trim()
      .min(3, 'Name must be at least 3 characters')
      .required('Customer name is required'),
    phone: Yup.string()
      .matches(/^[0-9]{10}$/, 'Phone number must be exactly 10 digits (e.g. 0771234567)')
      .required('Phone number is required'),
    vehicleNumber: Yup.string()
      .trim()
      .matches(
        /^[A-Za-z0-9\s-]{4,12}$/,
        'Enter a valid vehicle plate (e.g. CAB-1234 or WP CAA-4567)'
      )
      .required('Vehicle registration plate is required'),
    date: Yup.date()
      .min(todayStr, 'Appointment date cannot be in the past')
      .required('Appointment date is required'),
    time: Yup.string().required('Preferred bay time is required'),
    vehicleType: Yup.string().required('Please select a vehicle type'),
    washPackage: Yup.string().required('Please select a service package'),
    notes: Yup.string().max(250, 'Notes cannot exceed 250 characters'),
  });

  const handleCancelBooking = async (id) => {
    const token = localStorage.getItem('jwtToken');
    const updatedLocal = bookings.filter((b) => (b._id || b.id) !== id);
    localStorage.setItem('soapyride_bookings', JSON.stringify(updatedLocal));
    setBookings(updatedLocal);

    if (token) {
      try {
        await axios.delete(`http://localhost:5000/bookings-jwt/${id}`, {
          headers: { Authorization: 'Bearer ' + token },
        });
      } catch {
        // Already removed from UI/local fallback
      }
    }
    toast.info('Service appointment cancelled.');
  };

  const onSubmit = async (values, { resetForm, setSubmitting }) => {
    const token = localStorage.getItem('jwtToken');
    setError('');
    setFormStatus('');

    if (!token) {
      const msg = 'Please sign in to your SoapyRide account to confirm a service bay booking.';
      setError(msg);
      toast.warning(msg);
      setSubmitting(false);
      return;
    }

    const estimatedPrice =
      prefill.estimatedPrice || PACKAGE_PRICES[values.washPackage] || 3500;

    const payload = {
      ...values,
      vehicleNumber: values.vehicleNumber.toUpperCase(),
      estimatedPrice,
    };

    try {
      const response = await axios.post(
        'http://localhost:5000/bookings-jwt',
        payload,
        {
          headers: {
            Authorization: 'Bearer ' + token,
          },
        }
      );

      const saved = response.data?.data?.booking || {
        ...payload,
        _id: Date.now().toString(),
        status: 'Confirmed',
      };

      const existing = JSON.parse(localStorage.getItem('soapyride_bookings') || '[]');
      localStorage.setItem('soapyride_bookings', JSON.stringify([saved, ...existing]));

      setFormStatus('Service bay appointment confirmed! Your bay slot is reserved.');
      toast.success('Appointment booked successfully!');
      resetForm();
      fetchBookings();
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        'Could not reach the booking server. Ensure the backend is running on port 5000.';
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="booking-hub-section">
      <div className="section-header-center" style={{ marginBottom: '2.5rem' }}>
        <div className="section-eyebrow">
          <CalendarMonthRounded sx={{ fontSize: 16 }} />
          <span>Online Service Bay Reservation</span>
        </div>
        <h1 className="section-main-title">Schedule Your Car Service & Track Status</h1>
        <p className="section-main-desc">
          Book a dedicated service bay in under 60 seconds and monitor your vehicle&apos;s live
          progress from check-in to final quality inspection.
        </p>
      </div>

      <div className="booking-hub-grid">
        {/* Left Column: Booking Form */}
        <div className="booking-card-pro">
          <h3
            style={{
              fontSize: '1.35rem',
              fontWeight: 800,
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <BuildCircleRounded sx={{ color: '#0284c7' }} />
            <span>Reserve Service Appointment</span>
          </h3>

          {formStatus && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: '#ecfdf5',
                border: '1px solid #10b981',
                color: '#065f46',
                padding: '0.85rem 1rem',
                borderRadius: '10px',
                marginBottom: '1.25rem',
                fontWeight: 600,
                fontSize: '0.9rem',
              }}
            >
              <CheckCircleRounded sx={{ color: '#10b981' }} />
              <span>{formStatus}</span>
            </div>
          )}

          {error && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '8px',
                background: '#fef2f2',
                border: '1px solid #ef4444',
                color: '#991b1b',
                padding: '0.85rem 1rem',
                borderRadius: '10px',
                marginBottom: '1.25rem',
                fontWeight: 600,
                fontSize: '0.9rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ErrorOutlineRounded sx={{ color: '#ef4444' }} />
                <span>{error}</span>
              </div>
              {!localStorage.getItem('jwtToken') && (
                <button
                  type="button"
                  onClick={() => navigate('/signin')}
                  style={{
                    background: '#ef4444',
                    color: '#fff',
                    padding: '5px 12px',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    flexShrink: 0,
                  }}
                >
                  <LoginRounded sx={{ fontSize: 15 }} />
                  <span>Sign In</span>
                </button>
              )}
            </div>
          )}

          <Formik
            initialValues={initialValues}
            enableReinitialize
            validationSchema={validationSchema}
            onSubmit={onSubmit}
          >
            {({ values, errors, touched, isSubmitting }) => {
              const currentEstimate =
                prefill.estimatedPrice || PACKAGE_PRICES[values.washPackage] || 3500;

              return (
                <Form noValidate>
                  <div className="form-grid-2col">
                    <div className="pro-field-group">
                      <label htmlFor="name">
                        <PersonRounded sx={{ fontSize: 17, color: '#0284c7' }} />
                        <span>Customer Full Name</span>
                      </label>
                      <Field
                        id="name"
                        type="text"
                        name="name"
                        placeholder="e.g. Kasun Perera"
                        className={`pro-input ${errors.name && touched.name ? 'input-error' : ''}`}
                      />
                      <ErrorMessage name="name" component="div" className="pro-error-text" />
                    </div>

                    <div className="pro-field-group">
                      <label htmlFor="phone">
                        <PhoneAndroidRounded sx={{ fontSize: 17, color: '#0284c7' }} />
                        <span>Mobile Number (10 Digits)</span>
                      </label>
                      <Field
                        id="phone"
                        type="tel"
                        name="phone"
                        placeholder="0771234567"
                        className={`pro-input ${errors.phone && touched.phone ? 'input-error' : ''}`}
                      />
                      <ErrorMessage name="phone" component="div" className="pro-error-text" />
                    </div>
                  </div>

                  <div className="form-grid-2col">
                    <div className="pro-field-group">
                      <label htmlFor="vehicleNumber">
                        <ConfirmationNumberRounded sx={{ fontSize: 17, color: '#0284c7' }} />
                        <span>Vehicle Registration Plate</span>
                      </label>
                      <Field
                        id="vehicleNumber"
                        type="text"
                        name="vehicleNumber"
                        placeholder="e.g. WP CAB-4582"
                        className={`pro-input ${
                          errors.vehicleNumber && touched.vehicleNumber ? 'input-error' : ''
                        }`}
                      />
                      <ErrorMessage
                        name="vehicleNumber"
                        component="div"
                        className="pro-error-text"
                      />
                    </div>

                    <div className="pro-field-group">
                      <label htmlFor="vehicleType">
                        <DirectionsCarRounded sx={{ fontSize: 17, color: '#0284c7' }} />
                        <span>Vehicle Category</span>
                      </label>
                      <Field
                        id="vehicleType"
                        as="select"
                        name="vehicleType"
                        className={`pro-input ${
                          errors.vehicleType && touched.vehicleType ? 'input-error' : ''
                        }`}
                      >
                        <option value="">Select Category</option>
                        <option value="Car">Sedan / Hatchback</option>
                        <option value="SUV">SUV / 4x4 / Crossover</option>
                        <option value="Van">Van / MPV / Commercial</option>
                        <option value="Bike">Motorcycle / Scooter</option>
                      </Field>
                      <ErrorMessage
                        name="vehicleType"
                        component="div"
                        className="pro-error-text"
                      />
                    </div>
                  </div>

                  <div className="pro-field-group">
                    <label htmlFor="washPackage">
                      <BuildCircleRounded sx={{ fontSize: 17, color: '#0284c7' }} />
                      <span>Service / Detailing Package</span>
                    </label>
                    <Field
                      id="washPackage"
                      as="select"
                      name="washPackage"
                      className={`pro-input ${
                        errors.washPackage && touched.washPackage ? 'input-error' : ''
                      }`}
                    >
                      <option value="Basic Wash">Express Eco Wash (Rs. 1,800)</option>
                      <option value="Premium Wash">
                        Signature Detailing & Wax Spa (Rs. 4,500)
                      </option>
                      <option value="Detailing">
                        Full Mechanical & 24-Point Service (Rs. 11,500)
                      </option>
                      <option value="24-Point Diagnostic Check-Up">
                        24-Point OBD-II Diagnostic Inspection (Rs. 2,500)
                      </option>
                      <option value="3D Laser Wheel Alignment">
                        3D Laser Wheel Alignment & Balancing (Rs. 3,800)
                      </option>
                      <option value="Paint Correction & Ceramic">
                        Paint Correction & 9H Ceramic Coating (Rs. 14,500)
                      </option>
                    </Field>
                    <ErrorMessage name="washPackage" component="div" className="pro-error-text" />
                  </div>

                  <div className="form-grid-2col">
                    <div className="pro-field-group">
                      <label htmlFor="date">
                        <CalendarMonthRounded sx={{ fontSize: 17, color: '#0284c7' }} />
                        <span>Preferred Date</span>
                      </label>
                      <Field
                        id="date"
                        type="date"
                        name="date"
                        min={todayStr}
                        className={`pro-input ${errors.date && touched.date ? 'input-error' : ''}`}
                      />
                      <ErrorMessage name="date" component="div" className="pro-error-text" />
                    </div>

                    <div className="pro-field-group">
                      <label htmlFor="time">
                        <AccessTimeRounded sx={{ fontSize: 17, color: '#0284c7' }} />
                        <span>Preferred Bay Time Slot</span>
                      </label>
                      <Field
                        id="time"
                        type="time"
                        name="time"
                        className={`pro-input ${errors.time && touched.time ? 'input-error' : ''}`}
                      />
                      <ErrorMessage name="time" component="div" className="pro-error-text" />
                    </div>
                  </div>

                  <div className="pro-field-group">
                    <label htmlFor="notes">
                      <NotesRounded sx={{ fontSize: 17, color: '#0284c7' }} />
                      <span>Special Instructions / Mechanical Notes (Optional)</span>
                    </label>
                    <Field
                      id="notes"
                      as="textarea"
                      rows={2}
                      name="notes"
                      placeholder="e.g. Check front brake noise, synthetic oil 5W-30, or specific interior stain..."
                      className="pro-input"
                    />
                    <ErrorMessage name="notes" component="div" className="pro-error-text" />
                  </div>

                  {/* Live Estimate Summary Strip */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: '#f0f9ff',
                      border: '1px solid #bae6fd',
                      padding: '0.9rem 1.15rem',
                      borderRadius: '12px',
                      marginBottom: '1.25rem',
                    }}
                  >
                    <div>
                      <span
                        style={{
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          color: '#0369a1',
                          textTransform: 'uppercase',
                        }}
                      >
                        Estimated Service Total
                      </span>
                      <div style={{ fontSize: '0.85rem', color: '#475569' }}>
                        Includes 24-Point Safety Check & Bay Reservation
                      </div>
                    </div>
                    <strong style={{ fontSize: '1.35rem', color: '#0f172a', fontWeight: 800 }}>
                      Rs. {currentEstimate.toLocaleString()}
                    </strong>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary-pro"
                    style={{ width: '100%', padding: '0.95rem' }}
                  >
                    <CalendarMonthRounded fontSize="small" />
                    <span>
                      {isSubmitting ? 'Confirming Bay Slot...' : 'Confirm Service Appointment'}
                    </span>
                  </button>
                </Form>
              );
            }}
          </Formik>
        </div>

        {/* Right Column: Live Service Progress & Bookings Tracker */}
        <div className="booking-card-pro" style={{ background: '#0b192c', color: '#ffffff' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.25rem',
              paddingBottom: '0.85rem',
              borderBottom: '1px solid rgba(255,255,255,0.12)',
            }}
          >
            <h3
              style={{
                fontSize: '1.2rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <SpeedRounded sx={{ color: '#38bdf8' }} />
              <span>My Appointments & Bay Tracker</span>
            </h3>
            <span
              style={{
                fontSize: '0.75rem',
                background: 'rgba(56, 189, 248, 0.16)',
                color: '#38bdf8',
                padding: '4px 10px',
                borderRadius: '999px',
                fontWeight: 700,
              }}
            >
              {bookings.length} Active
            </span>
          </div>

          {loadingBookings ? (
            <p style={{ color: '#94a3b8', fontSize: '0.92rem' }}>Loading your appointments...</p>
          ) : bookings.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '2.5rem 1rem',
                background: 'rgba(255,255,255,0.04)',
                borderRadius: '14px',
                border: '1px dashed rgba(255,255,255,0.15)',
              }}
            >
              <DirectionsCarRounded sx={{ fontSize: 42, color: '#38bdf8', mb: 1 }} />
              <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                No Active Service Bookings Yet
              </h4>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                Once you reserve a service bay on the left, your live 5-stage vehicle service
                tracker will appear here.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {bookings.slice(0, 4).map((item) => {
                const id = item._id || item.id;
                const currentStatus = item.status || 'Confirmed';
                const activeIdx = Math.max(0, STAGES.indexOf(currentStatus));

                return (
                  <div
                    key={id}
                    style={{
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: '14px',
                      padding: '1.1rem',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '0.5rem',
                      }}
                    >
                      <div>
                        <strong style={{ fontSize: '0.98rem', color: '#f8fafc' }}>
                          {item.washPackage || 'Full Service'}
                        </strong>
                        <div style={{ fontSize: '0.8rem', color: '#38bdf8', fontWeight: 600 }}>
                          {item.vehicleType} {item.vehicleNumber ? `• ${item.vehicleNumber}` : ''}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCancelBooking(id)}
                        title="Cancel Appointment"
                        style={{
                          color: '#fca5a5',
                          padding: '4px',
                          borderRadius: '6px',
                        }}
                      >
                        <DeleteOutlineRounded fontSize="small" />
                      </button>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        gap: '12px',
                        fontSize: '0.8rem',
                        color: '#cbd5e1',
                      }}
                    >
                      <span>
                        Date:{' '}
                        {item.date ? new Date(item.date).toLocaleDateString() : 'Scheduled'}
                      </span>
                      <span>Time: {item.time}</span>
                    </div>

                    {/* 5-Stage Service Bay Tracker */}
                    <div className="tracker-stage-steps">
                      {STAGES.map((stage, idx) => (
                        <div
                          key={stage}
                          className={`tracker-step-dot ${idx <= activeIdx ? 'done' : ''}`}
                        >
                          <CheckCircleRounded
                            sx={{
                              fontSize: 15,
                              color: idx <= activeIdx ? '#38bdf8' : '#475569',
                              mb: 0.3,
                            }}
                          />
                          <span>{stage}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default BookingForm;
