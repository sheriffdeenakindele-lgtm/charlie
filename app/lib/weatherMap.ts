type WeatherCondition = 'clear' | 'clouds' | 'rain' | 'storm' | 'snow' | 'fog';

interface WeatherConfig {
  background: WeatherCondition;
  gradient: string[];
}

// Map weather API conditions to background components
export const weatherMap: Record<string, WeatherConfig> = {
  Clear: {
    background: 'clear',
    gradient: ['from-blue-400', 'via-blue-500', 'to-blue-600'],
  },
  Clouds: {
    background: 'clouds',
    gradient: ['from-gray-400', 'via-gray-500', 'to-gray-600'],
  },
  Rain: {
    background: 'rain',
    gradient: ['from-gray-600', 'via-gray-700', 'to-gray-800'],
  },
  Drizzle: {
    background: 'rain',
    gradient: ['from-gray-600', 'via-gray-700', 'to-gray-800'],
  },
  Thunderstorm: {
    background: 'storm',
    gradient: ['from-gray-800', 'via-gray-900', 'to-black'],
  },
  Snow: {
    background: 'snow',
    gradient: ['from-slate-300', 'via-slate-400', 'to-slate-500'],
  },
  Mist: {
    background: 'fog',
    gradient: ['from-gray-300', 'via-gray-400', 'to-gray-500'],
  },
  Fog: {
    background: 'fog',
    gradient: ['from-gray-300', 'via-gray-400', 'to-gray-500'],
  },
  Haze: {
    background: 'fog',
    gradient: ['from-gray-300', 'via-gray-400', 'to-gray-500'],
  },
};

export function getWeatherBackground(condition: string): WeatherCondition {
  return weatherMap[condition]?.background || 'clear';
}
