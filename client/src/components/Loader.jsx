import React from 'react';
import { Sparkles } from 'lucide-react';

const Loader = ({ text = 'Curating 925 Sterling Silver Pieces...' }) => {
  return (
    <div className="shv-luxury-loader-wrap" role="status" aria-live="polite">
      <div className="shv-luxury-loader-ring-outer">
        <div className="shv-loader-ring-spin" />
        <div className="shv-loader-gem-pulse">
          <Sparkles size={16} />
        </div>
      </div>
      <div className="shv-loader-brand-title">SHVÈRAA</div>
      <p className="shv-loader-subtext">{text}</p>
      <div className="shv-loader-bar">
        <div className="shv-loader-bar-fill" />
      </div>
    </div>
  );
};

export default Loader;
