import React from "react";

const IconButton = ({
  onClick,
  disabled = false,
  className = "",
  children,
  title = "",
  ...props
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={`inline-flex items-center justify-center transition-colors rounded ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
    {...props}
  >
    {children}
  </button>
);

export default IconButton;