import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AccessTimeRounded,
  ArrowForwardRounded,
  CheckCircleOutlineRounded,
} from '@mui/icons-material';

const MiniServiceContainer = ({
  icon,
  title,
  description,
  price,
  duration,
  highlights = [],
}) => {
  const navigate = useNavigate();

  return (
    <div className="pro-service-card">
      <div>
        <div className="service-card-top">
          <div className="service-react-icon-box">{icon}</div>
          <div className="service-meta-chips">
            {price && <span className="meta-chip-price">{price}</span>}
            {duration && (
              <span className="meta-chip-time">
                <AccessTimeRounded sx={{ fontSize: 14 }} />
                {duration}
              </span>
            )}
          </div>
        </div>

        <h5>{title}</h5>
        <p>{description}</p>

        {highlights.length > 0 && (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '6px',
              marginBottom: '1.25rem',
            }}
          >
            {highlights.map((item) => (
              <span
                key={item}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  color: '#0f172a',
                  background: '#f1f5f9',
                  padding: '4px 10px',
                  borderRadius: '999px',
                }}
              >
                <CheckCircleOutlineRounded sx={{ fontSize: 14, color: '#0284c7' }} />
                {item}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="service-card-footer">
        <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
          Warranty Protected
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
          <span>Schedule Bay</span>
          <ArrowForwardRounded sx={{ fontSize: 16 }} />
        </button>
      </div>
    </div>
  );
};

export default MiniServiceContainer;
