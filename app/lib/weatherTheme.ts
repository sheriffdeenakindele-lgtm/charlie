// lib/weatherTheme.ts
export type WeatherTheme =
  | "clear"
  | "cloudy"
  | "rain"
  | "storm"
  | "snow"
  | "fog";

export function getWeatherTheme(code: number): WeatherTheme {
  if (code === 0) return "clear";
  if ([1, 2, 3].includes(code)) return "cloudy";
  if (code >= 51 && code <= 67) return "rain";
  if (code >= 71 && code <= 77) return "snow";
  if (code >= 95) return "storm";
  if ([45, 48].includes(code)) return "fog";
  return "clear";
}
