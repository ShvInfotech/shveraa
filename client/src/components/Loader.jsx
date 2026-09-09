import React from 'react';

const Loader = ({ text = 'Loading Jewellery Collection...' }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '260px',
      gap: '16px',
    }}>
      <div className="spinner"></div>
      <p style={{ fontSize: '0.88rem', color: '#6B6560', letterSpacing: '0.04em' }}>{text}</p>
    </div>
  );
};

export default Loader;
