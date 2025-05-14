import React from 'react';

const SectionHeader = ({ title, subtitle, className = '' }) => (
  <div className={`mb-6 ${className}`}>
    <h2 className="text-3xl font-extrabold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
      {title}
    </h2>
    {subtitle && <p className="text-gray-400 text-lg">{subtitle}</p>}
  </div>
);

export default SectionHeader; 