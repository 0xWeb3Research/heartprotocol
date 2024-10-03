import React from 'react';

interface ButtonProps {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  variant?: 'outline' | 'solid';
  className?: string;
}

const Button: React.FC<ButtonProps> = ({ onClick, disabled, children, variant = 'solid', className }) => {
  const baseClasses = 'px-4 py-2 rounded';
  const variantClasses = variant === 'outline' ? 'border border-gray-500 text-gray-500' : 'bg-blue-500 text-white';
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses} ${disabledClasses} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;