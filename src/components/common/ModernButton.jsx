import React from 'react';

const ModernButton = ({ children, className = '', ...props }) => (
  <button
    className={`bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white px-6 py-2 rounded-xl font-semibold shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-indigo-400/50 ${className}`}
    {...props}
  >
    {children}
  </button>
);

export default ModernButton; 