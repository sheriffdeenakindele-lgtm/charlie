'use client';

import { ReactNode } from 'react';
import Clear from './Clear';
import Clouds from './Clouds';
import Rain from './Rain';
import Storm from './Storm';
import Snow from './Snow';
import Fog from './Fog';

interface WeatherBackgroundProps {
  condition: 'clear' | 'clouds' | 'rain' | 'storm' | 'snow' | 'fog';
  children: ReactNode;
}

export default function WeatherBackground({ condition, children }: WeatherBackgroundProps) {
  const backgrounds = {
    clear: <Clear />,
    clouds: <Clouds />,
    rain: <Rain />,
    storm: <Storm />,
    snow: <Snow />,
    fog: <Fog />,
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {backgrounds[condition]}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
