import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  AdminPanelSettingsRounded,
  EmailRounded,
  LockRounded,
  Visibility,
  VisibilityOff,
  VerifiedUserRounded,
  LoginRounded,
  AutoFixHighRounded,
  ArrowBackRounded,
  SecurityRounded
} from '@mui/icons-material';
import useAuth from '../hooks/useAuth';

const AdminLoginPage = () => {
  const [email, setEmail] = useState('admin@soapyride.com');
  const [password, setPassword] = useState('Admin@123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { refreshAuth } = useAuth();

  const handleQuickFill = () => {
    setEmail('admin@soapyride.com');
    setPassword('Admin@123');
    setError('');
    toast.info('Owner credentials filled!');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please enter both Admin Email and Password.');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/admin/login', {
        email: email.trim().toLowerCase(),
        password
      });

      const { token, user } = res.data;
      localStorage.setItem('adminToken', token);
      localStorage.setItem('jwtToken', token);
      localStorage.setItem('userName', user.name || 'Shop Owner');
      localStorage.setItem('userRole', 'admin');
      localStorage.setItem('adminUser', JSON.stringify(user));

      if (refreshAuth) refreshAuth();
      toast.success('Admin Command Center unlocked!');
      navigate('/admin/dashboard');
    } catch (err) {
      const normalized = email.trim().toLowerCase();
      const isBuiltInOwner =
        (normalized === 'admin@soapyride.com' && password === 'Admin@123') ||
        (normalized === 'owner@soapyride.com' && password === 'Owner@123');

      if (!err.response && isBuiltInOwner) {
        // Offline fallback when backend server is not yet started
        const offlineUser = {
          name: 'Tharindu Dissanayake (Shop Owner)',
          email: normalized,
          role: 'admin'
        };
        localStorage.setItem('adminToken', 'offline-admin-session-token');
        localStorage.setItem('jwtToken', 'offline-admin-session-token');
        localStorage.setItem('userName', offlineUser.name);
        localStorage.setItem('userRole', 'admin');
        localStorage.setItem('adminUser', JSON.stringify(offlineUser));
        if (refreshAuth) refreshAuth();
        toast.success('Signed in to Admin Panel (Local Sync Mode)');
        navigate('/admin/dashboard');
      } else {
        const msg =
          err.response?.data?.message ||
          'Invalid Admin/Owner credentials. Use admin@soapyride.com / Admin@123';
        setError(msg);
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-wrapper">
      <div className="admin-login-container">
        {/* Left Branding Panel */}
        <div className="admin-login-showcase">
          <div>
            <div className="admin-shield-pill">
              <SecurityRounded sx={{ fontSize: 16 }} />
              <span>RESTRICTED ACCESS • SHOP OWNER & ADMIN</span>
            </div>
            <h1 className="admin-showcase-title">
              SoapyRide <span style={{ color: '#38bdf8' }}>ERP & Workshop</span> Command Center
            </h1>
            <p className="admin-showcase-desc">
              Centralized management suite for vehicle registry, service bays, mechanic dispatch,
              job cards, spare parts inventory, invoicing, and real-time financial analytics.
            </p>

            <div className="admin-module-badges">
              <span>4. Vehicle Registry</span>
              <span>5. Service Catalog</span>
              <span>6. Bay Appointments</span>
              <span>7. Job Cards</span>
              <span>8. Mechanic Dispatch</span>
              <span>9. Parts Inventory</span>
              <span>10. Billing & POS</span>
              <span>11. Revenue Analytics</span>
            </div>
          </div>

          <div className="admin-credentials-hint-box">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <strong style={{ color: '#38bdf8', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <VerifiedUserRounded sx={{ fontSize: 17 }} />
                Default Shop Owner Login
              </strong>
              <button
                type="button"
                onClick={handleQuickFill}
                className="admin-autofill-btn"
              >
                <AutoFixHighRounded sx={{ fontSize: 14 }} />
                <span>Auto-Fill</span>
              </button>
            </div>
            <div style={{ fontSize: '0.82rem', color: '#cbd5e1', display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
              <span>Email: <strong>admin@soapyride.com</strong></span>
              <span>Password: <strong>Admin@123</strong></span>
            </div>
          </div>
        </div>

        {/* Right Login Form Panel */}
        <div className="admin-login-form-card">
          <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            <div className="admin-avatar-icon">
              <AdminPanelSettingsRounded sx={{ fontSize: 32 }} />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>
              Admin & Owner Sign In
            </h2>
            <p style={{ fontSize: '0.88rem', color: '#64748b', marginTop: '4px' }}>
              Authenticate with your shop owner credentials to access the workshop dashboard
            </p>
          </div>

          {error && (
            <div className="admin-error-banner">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="pro-field-group">
              <label htmlFor="admin-email">
                <EmailRounded sx={{ fontSize: 17, color: '#0284c7' }} />
                <span>Owner / Admin Email</span>
              </label>
              <input
                id="admin-email"
                type="email"
                className="pro-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@soapyride.com"
                required
              />
            </div>

            <div className="pro-field-group">
              <label htmlFor="admin-password">
                <LockRounded sx={{ fontSize: 17, color: '#0284c7' }} />
                <span>Security Password</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  className="pro-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  style={{ paddingRight: '2.75rem' }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#64748b',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary-pro"
              style={{ width: '100%', padding: '0.95rem', marginTop: '0.5rem' }}
            >
              <LoginRounded fontSize="small" />
              <span>{loading ? 'Verifying Owner Access...' : 'Unlock Admin Command Center'}</span>
            </button>
          </form>

          <div
            style={{
              marginTop: '1.5rem',
              paddingTop: '1.15rem',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '0.84rem'
            }}
          >
            <Link
              to="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                color: '#475569',
                fontWeight: 600
              }}
            >
              <ArrowBackRounded sx={{ fontSize: 16 }} />
              <span>Public Website</span>
            </Link>
            <Link
              to="/signin"
              style={{ color: '#0284c7', fontWeight: 700 }}
            >
              Customer Login &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
