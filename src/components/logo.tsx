'use client';

import React, { FC, SVGProps } from 'react';

// Interface for the SVG icon component props
interface LogoIconProps extends SVGProps<SVGSVGElement> {
  width?: number;
  height?: number;
}

const LogoIcon: FC<LogoIconProps> = ({ width = 24, height = 24, ...rest }) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...rest}
  >
    {/* Background with Blue-to-Green/Gold Gradient */}
    <rect width="100" height="100" rx="20" fill="url(#paint0_linear_v1)" />

    {/* Brain Outline (Simplified) */}
    <path
      d="M 50 15 C 30 15, 20 35, 20 50 C 20 65, 30 85, 50 85 C 70 85, 80 65, 80 50 C 80 35, 70 15, 50 15 Z"
      stroke="white"
      strokeWidth="5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Candlestick Chart and Rising Arrow */}
    <path
      d="M 45 75 V 65 M 45 70 H 55 M 55 75 V 65 M 65 60 V 50 M 65 55 H 75 M 75 60 V 50 M 85 45 V 35 M 85 40 H 95 M 95 45 V 35"
      stroke="white"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M 40 70 L 60 55 L 80 40 L 95 25"
      stroke="white"
      strokeWidth="5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M 95 25 L 90 30 M 95 25 L 90 20"
      stroke="white"
      strokeWidth="5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    <defs>
      <linearGradient id="paint0_linear_v1" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
        <stop stopColor="#0077B6"/> {/* Deep Blue */}
        <stop offset="1" stopColor="#FFD700"/> {/* Gold/Yellow */}
      </linearGradient>
    </defs>
  </svg>
);

// Interface for the main Logo component props
interface LogoProps {
  iconSize?: number;
  fontSize?: string;
  className?: string;
}

const Logo: FC<LogoProps> = ({ iconSize = 32, fontSize = '1.5rem', className = '' }) => {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <LogoIcon width={iconSize} height={iconSize} />
      <span style={{ fontSize: fontSize, fontWeight: 'bold', color: 'currentColor' }}>
        Brain AiPro Trader
      </span>
    </div>
  );
};

export default Logo;
export { LogoIcon };
