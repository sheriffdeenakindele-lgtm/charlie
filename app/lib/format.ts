// Temperature formatting
export function formatTemperature(temp: number, unit: 'C' | 'F' = 'C'): string {
  if (unit === 'F') {
    return `${Math.round((temp * 9) / 5 + 32)}°F`;
  }
  return `${Math.round(temp)}°C`;
}

// Date formatting
export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function formatDay(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
  });
}

// Wind speed formatting
export function formatWindSpeed(speed: number, unit: 'kmh' | 'mph' = 'kmh'): string {
  if (unit === 'mph') {
    return `${Math.round(speed * 0.621371)} mph`;
  }
  return `${Math.round(speed * 3.6)} km/h`;
}

// Humidity formatting
export function formatHumidity(humidity: number): string {
  return `${humidity}%`;
}

// Pressure formatting
export function formatPressure(pressure: number): string {
  return `${pressure} hPa`;
}

// Visibility formatting
export function formatVisibility(visibility: number): string {
  const km = visibility / 1000;
  return `${km.toFixed(1)} km`;
}
