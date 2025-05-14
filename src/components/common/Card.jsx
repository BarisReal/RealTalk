import React from 'react';

const Card = ({ children, className = '' }) => (
  <div className={`glass rounded-2xl shadow-xl border border-indigo-500/30 bg-gradient-to-br from-indigo-900/60 to-purple-900/60 backdrop-blur-md ${className}`}>
    {children}
  </div>
);

export default Card; 