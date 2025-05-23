import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MY_NAME, BIRTHDAY_DATE_TEXT } from '../config';

// Reusable LuminousText component
const LuminousText: React.FC<{
  text: string;
  className?: string;
  as?: 'h1' | 'h2' | 'p' | 'span';
}> = ({ text, className = '', as = 'p' }) => {
  const Component = as;
  const baseStyle =
    'filter drop-shadow-[0_0_2px_rgba(255,255,255,0.7)] drop-shadow-[0_0_6px_rgba(239,68,68,0.6)] drop-shadow-[0_0_12px_rgba(239,68,68,0.4)] drop-shadow-[0_0_8px_rgba(59,130,246,0.3)]'; // White base, red primary, blue secondary glow
  return <Component className={`${baseStyle} ${className}`}>{text}</Component>;
};

// Party light dot component
const PartyLight: React.FC<{ color: string; size: string; position: string; delay: string }> = ({
  color,
  size,
  position,
  delay,
}) => (
  <div
    className={`absolute ${size} ${color} rounded-full opacity-50 animate-pulse ${position}`} // Increased opacity
    style={{ animationDelay: delay, animationDuration: '2.5s' }} // Slightly faster pulse
  />
);

const LoadingButton: React.FC<{
  onClick: () => void;
  loadingProgress: number;
  isLoaded: boolean;
}> = ({ onClick, loadingProgress, isLoaded }) => {
  return (
    <button
      onClick={onClick}
      disabled={!isLoaded}
      aria-live="polite"
      aria-busy={!isLoaded}
      className={`
        mt-12 px-10 py-4 text-xl font-bold rounded-full shadow-lg
        transition-all duration-300 ease-in-out transform hover:scale-105
        focus:outline-none focus:ring-4 focus:ring-opacity-50
        ${
          isLoaded
            ? 'bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white focus:ring-red-400'
            : 'bg-slate-600 text-slate-400 cursor-not-allowed'
        }
      `}
    >
      {isLoaded ? '¡Entrar a la Fiesta!' : `Cargando... ${loadingProgress}%`}
    </button>
  );
};

const LandingContent: React.FC<{ enterFunction?: () => void }> = ({ enterFunction }) => {
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const guestEmail = localStorage.getItem('guestEmail');
    if (guestEmail) {
      navigate(`/inv/${guestEmail}`);
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsLoaded(true);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    return () => clearInterval(interval);
  }, []);

  const handleEnter = () => {
    if (isLoaded) {
      enterFunction ? enterFunction() : navigate('/invitation');
    }
  };

  const lightColors = [
    'bg-red-500',
    'bg-blue-500',
    'bg-red-600',
    'bg-blue-600',
    'bg-rose-500',
    'bg-sky-500',
  ];

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-transparent text-slate-100 p-6 relative overflow-hidden">
      {' '}
      {/* bg-transparent to let body/stage-lights show */}
      {/* Animated Party Lights Background */}
      {Array.from({ length: 20 }).map((_, i) => {
        // Increased number of lights
        const sizeW = Math.floor(Math.random() * 8) + 8; // e.g. w-8 to w-15
        const sizeH = Math.floor(Math.random() * 8) + 8; // e.g. h-8 to h-15
        const top = `${Math.random() * 100}%`;
        const left = `${Math.random() * 100}%`;
        const delay = `${Math.random() * 2.5}s`;
        return (
          <PartyLight
            key={i}
            color={lightColors[i % lightColors.length]}
            size={`w-${sizeW} h-${sizeH}`}
            position={`top-[${top}] left-[${left}] transform -translate-x-1/2 -translate-y-1/2`}
            delay={delay}
          />
        );
      })}
      <div className="z-10 text-center backdrop-blur-sm bg-slate-900/60 p-8 rounded-xl shadow-2xl">
        {' '}
        {/* Darker, more defined card */}
        <LuminousText
          text={`¡Bienvenido a la Celebración!`}
          as="h1"
          className="text-4xl sm:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-red-500 to-rose-500 mb-4"
        />
        <LuminousText
          text={`Estás invitado al cumpleaños de`}
          as="p"
          className="text-xl sm:text-2xl text-blue-300 mb-2"
        />
        <LuminousText
          text={MY_NAME}
          as="h2"
          className="text-5xl sm:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-rose-500 to-red-600 mb-4"
        />
        <LuminousText
          text={`El ${BIRTHDAY_DATE_TEXT}`}
          as="p"
          className="text-xl sm:text-2xl text-blue-300 mb-8"
        />
        <LoadingButton
          onClick={handleEnter}
          loadingProgress={loadingProgress}
          isLoaded={isLoaded}
        />
      </div>
      <p className="z-10 absolute bottom-4 text-xs text-slate-500">
        Se recomienda usar navegadores modernos para una mejor experiencia.
      </p>
    </div>
  );
};

export default LandingContent;
