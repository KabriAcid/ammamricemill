import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hover = false,
  onClick,
}) => {
  const Component = onClick ? motion.div : 'div';
  
  return (
    <Component
      className={`
        bg-white rounded-xl shadow-card
        ${hover ? 'hover:shadow-card-hover transition-shadow duration-300' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      onClick={onClick}
      {...(onClick && {
        whileHover: { y: -2 },
        whileTap: { scale: 0.98 },
      })}
    >
      {children}
    </Component>
  );
};