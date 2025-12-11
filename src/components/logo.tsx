"use client"

import React from 'react';

interface LogoIconProps {
  width?: number;
  height?: number;
  color?: string;
}

const LogoIcon = ({ width = 24, height = 24, color = 'currentColor' }: LogoIconProps) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Background/Container for the icon, similar to the generated image's rounded square */}
    <rect width="100" height="100" rx="20" fill="url(#paint0_linear_logo)" />

    {/* Brain Outline (Simplified) */}
    <path
      d="M 50 15 C 30 15, 20 35, 20 50 C 20 65, 30 85, 50 85 C 70 85, 80 65, 80 50 C 80 35, 70 15, 50 15 Z"
      stroke="white"
      strokeWidth="5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Brain Fissures (Simplified) */}
    <path
      d="M 50 15 V 85 M 50 50 H 80 M 50 50 H 20"
      stroke="white"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    {/* Trading Element: Rising Line Chart (Simplified) */}
    <polyline
      points="30 70, 50 50, 70 60, 90 40"
      stroke="#32CD32" /* Lime Green for 'up' trend */
      strokeWidth="5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <defs>
      {/* Gradient definition matching the generated image's colors (Blue to Green/Gold) */}
      <linearGradient id="paint0_linear_logo" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
        <stop stopColor="#0077B6" /> {/* Deep Blue */}
        <stop offset="1" stopColor="#FFD700" /> {/* Gold/Yellow */}
      </linearGradient>
    </defs>
  </svg>
);

interface LogoProps {
  iconSize?: number;
  fontSize?: string;
  className?: string;
  showText?: boolean;
}

const Logo = ({ iconSize = 32, fontSize = '1.5rem', className = '', showText = true }: LogoProps) => {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <LogoIcon width={iconSize} height={iconSize} />
      {showText && (
        <span style={{ fontSize: fontSize, fontWeight: 'bold', color: '#FFFFFF' }}>
          Brain AiPro Trader
        </span>
      )}
    </div>
  );
};

export default Logo;
export { LogoIcon };
