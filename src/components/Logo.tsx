import React from 'react';
import { Link } from 'react-router-dom';

interface LogoProps {
  className?: string;
  variant?: 'full' | 'icon-only' | 'horizontal' | 'white';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  linkTo?: string;
}

export const AgarlyIcon: React.FC<{ size?: number; className?: string; colorScheme?: 'default' | 'white' | 'gold' }> = ({
  size = 40,
  className = '',
  colorScheme = 'default',
}) => {
  const outerBg = colorScheme === 'white' ? '#FFFFFF' : '#2B3143';
  const roofColor = colorScheme === 'gold' ? '#FFFFFF' : '#FCB431';
  const chimneyOrAccent = colorScheme === 'white' ? '#2B3143' : '#FFFFFF';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 transition-transform duration-300 hover:scale-105 ${className}`}
      aria-label="Agarly Icon"
    >
      {/* Outer Hexagon with smooth rounded corners */}
      <path
        d="M50 6 L88 28 C92 30.5 94.5 35 94.5 40 L94.5 60 C94.5 65 92 69.5 88 72 L50 94 C46.5 96 42.5 96 39 94 L12 72 C8 69.5 5.5 65 5.5 60 L5.5 40 C5.5 35 8 30.5 12 28 L50 6 Z"
        fill={outerBg}
      />
      
      {/* Inner House with Upward Roof Peak */}
      <path
        d="M50 25 L76 46 C77.5 47.2 76.5 49.5 74.5 49.5 L67.5 49.5 L67.5 73 C67.5 75 66 76.5 64 76.5 L36 76.5 C34 76.5 32.5 75 32.5 73 L32.5 49.5 L25.5 49.5 C23.5 49.5 22.5 47.2 24 46 L50 25 Z"
        fill={roofColor}
      />

      {/* Modern Center Keyhole / Door Archway in Contrast */}
      <path
        d="M44 76.5 L44 57 C44 53.7 46.7 51 50 51 C53.3 51 56 53.7 56 57 L56 76.5 Z"
        fill={chimneyOrAccent}
        opacity={colorScheme === 'white' ? 0.9 : 0.95}
      />
    </svg>
  );
};

export const Logo: React.FC<LogoProps> = ({
  className = '',
  variant = 'full',
  size = 'md',
  showTagline = false,
  linkTo = '/',
}) => {
  const iconSizes = {
    sm: 32,
    md: 40,
    lg: 48,
    xl: 60,
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl',
  };

  const englishSizes = {
    sm: 'text-[10px]',
    md: 'text-xs',
    lg: 'text-sm',
    xl: 'text-base',
  };

  const content = (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      <AgarlyIcon
        size={iconSizes[size]}
        colorScheme={variant === 'white' ? 'white' : 'default'}
      />
      
      {variant !== 'icon-only' && (
        <div className="flex flex-col leading-none">
          <div className="flex items-baseline gap-1.5">
            <span
              className={`font-black tracking-tight ${textSizes[size]} ${
                variant === 'white' ? 'text-white' : 'text-slate-900 dark:text-white'
              }`}
              style={{ fontFamily: "'Cairo', sans-serif" }}
            >
              اجرلي
            </span>
          </div>
          <span
            className={`font-bold tracking-wider -mt-0.5 ${englishSizes[size]} text-[#FCB431]`}
            style={{ fontFamily: "'Cairo', 'Plus Jakarta Sans', sans-serif" }}
          >
            Agarly
          </span>

          {showTagline && (
            <span
              className={`text-[10px] mt-1 font-medium ${
                variant === 'white' ? 'text-slate-300' : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              سكنك أسهل. مستقبلك أريح.
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (linkTo) {
    return (
      <Link to={linkTo} className="inline-flex items-center focus:outline-none group">
        {content}
      </Link>
    );
  }

  return content;
};

export default Logo;
