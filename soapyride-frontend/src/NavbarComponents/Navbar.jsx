import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LocalCarWashRounded,
  HomeRounded,
  BuildCircleRounded,
  VerifiedUserRounded,
  SupportAgentRounded,
  AccountCircleRounded,
  LogoutRounded,
  MenuRounded,
  CloseRounded,
} from '@mui/icons-material';
import LoginButton from './LoginButton';
import BookingButton from '../BookingContainer/BookingButton';
import useAuth from '../hooks/useAuth';

const Navbar = () => {
  const { isLoggedIn, userName, refreshAuth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  React.useEffect(() => {
    if (refreshAuth) refreshAuth();
  }, [location.pathname, refreshAuth]);

  // Hide customer navbar inside the Admin ERP workspace
  if (location.pathname === '/admin' || location.pathname.startsWith('/admin/dashboard')) {
    return null;
  }

  const handleLogout = () => {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    localStorage.removeItem('adminUser');
    if (refreshAuth) refreshAuth();
    setMobileOpen(false);
    navigate('/');
  };

  const navItems = [
    { label: 'Home', path: '/', icon: <HomeRounded fontSize="small" /> },
    { label: 'Services & Packages', path: '/service', icon: <BuildCircleRounded fontSize="small" /> },
    { label: 'About Center', path: '/about', icon: <VerifiedUserRounded fontSize="small" /> },
    { label: 'Contact & Support', path: '/contact', icon: <SupportAgentRounded fontSize="small" /> },
  ];

  return (
    <header className="pro-navbar">
      <div className="pro-navbar-inner">
        <Link to="/" className="logo-brand-wrap" onClick={() => setMobileOpen(false)}>
          <div className="logo-emblem" aria-hidden="true">
            <LocalCarWashRounded sx={{ fontSize: 26 }} />
          </div>
          <div className="logo">
            <span className="logo-word-row">
              <span className="logo-soapy">Soapy</span>
              <span className="logo-ride">Ride</span>
            </span>
            <span className="logo-badge">AUTO SERVICE & DETAILING</span>
          </div>
        </Link>

        <button
          type="button"
          className="mobile-menu-btn"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle navigation menu"
        >
          {mobileOpen ? <CloseRounded /> : <MenuRounded />}
        </button>

        <div className={`nav-collapse-wrap ${mobileOpen ? 'open' : ''}`} style={{ display: mobileOpen ? 'flex' : undefined }}>
          <div className="nav-links-group">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`nav-link-item ${isActive ? 'active' : ''}`}
                  onClick={() => setMobileOpen(false)}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        <div className={`nav-actions-group ${mobileOpen ? 'open' : ''}`}>
          <BookingButton onClick={() => setMobileOpen(false)} />

          {isLoggedIn ? (
            <>
              <span className="welcome-msg">
                <AccountCircleRounded fontSize="small" sx={{ color: '#38bdf8' }} />
                {userName && !userName.toLowerCase().includes('tharindu')
                  ? userName
                  : JSON.parse(localStorage.getItem('sr_last_registered_customer') || 'null')?.fullname ||
                    'Member'}
              </span>
              <button type="button" className="logout-button" onClick={handleLogout}>
                <LogoutRounded fontSize="small" />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <LoginButton onClick={() => setMobileOpen(false)} />
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
