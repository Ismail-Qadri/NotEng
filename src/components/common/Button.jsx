import React from 'react';

export const Button = ({
  children,
  icon,
  variant = 'save', 
  className = '',
  ...props
}) => {
  let baseClass =
    'flex items-center px-4 py-2 rounded-full font-semibold transition-colors duration-200';

  if (variant === 'save') {
    baseClass += ' bg-[#166a45] text-white hover:bg-[#0f5434]';
  } else if (variant === 'cancel') {
    baseClass += ' bg-white text-gray-700 border border-gray-300 hover:bg-gray-100';
  }

  return (
    <button className={`${baseClass} ${className}`} {...props}>
      {icon && <span className="me-2">{icon}</span>}
      {children}
    </button>
  );
};

export default Button;