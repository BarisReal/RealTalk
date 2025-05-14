import React from 'react';

const AnimatedInput = ({ className = '', ...props }) => (
  <input
    className={`bg-gray-800 text-white px-4 py-3 rounded-xl border border-gray-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 placeholder-gray-400 transition-all duration-300 ${className}`}
    {...props}
  />
);

export default AnimatedInput; 