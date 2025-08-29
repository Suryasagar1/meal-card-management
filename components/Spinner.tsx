
import React from 'react';

const Spinner: React.FC<{ className?: string }> = ({ className = 'w-8 h-8' }) => {
  return (
    <div
      className={`animate-spin rounded-full border-4 border-t-blue-500 border-gray-200 ${className}`}
      role="status"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default Spinner;
