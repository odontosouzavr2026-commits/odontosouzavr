import React from 'react';

interface ToothIconProps {
  className?: string;
}

export const ToothIcon: React.FC<ToothIconProps> = ({ className = 'w-5 h-5' }) => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Formato anatômico e estilizado de dente/molar odontológico */}
      <path d="M17 2c-1.9 0-3.5 1-4.4 2.4-.3.4-.9.4-1.2 0C10.5 3 8.9 2 7 2 4.2 2 2 4.3 2 7.2c0 3.2 1.3 8.1 2.3 12.1.4 1.6 1.8 2.7 3.5 2.7 1.4 0 2.5-.9 3.2-2.1.4-.7 1.6-.7 2 0 .7 1.2 1.8 2.1 3.2 2.1 1.7 0 3.1-1.1 3.5-2.7 1-4 2.3-8.9 2.3-12.1C22 4.3 19.8 2 17 2z" />
    </svg>
  );
};
