interface DailyData {
  day: string;
  high: number;
  low?: number;
  condition: string;
  icon: 'sunny' | 'cloudy' | 'rainy' | 'partly-cloudy' | 'snowy' | 'windy';
}

interface WeeklyForecastProps {
  days: DailyData[];
}

export default function WeeklyForecast({ days }: WeeklyForecastProps) {
  const getWeatherIcon = (icon: string) => {
    switch (icon) {
      case 'sunny':
        return (
          <svg className="w-16 h-16 text-[#fbbf24]" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
          </svg>
        );
      case 'cloudy':
        return (
          <svg className="w-16 h-16 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M5.5 16a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 16h-8z" />
          </svg>
        );
      case 'rainy':
        return (
          <svg className="w-16 h-16 text-[#00d4ff]" fill="currentColor" viewBox="0 0 20 20">
            <path d="M5.5 16a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 16h-8z" />
          </svg>
        );
      case 'partly-cloudy':
        return (
          <svg className="w-16 h-16 text-[#00d4ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">7-Day Forecast</h2>
        <p className="text-gray-400 text-sm">Upcoming weather conditions.</p>
      </div>
      
      <div className="relative overflow-hidden">
        <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scroll-smooth scrollbar-thin scrollbar-thumb-[#1a2f35] scrollbar-track-transparent hover:scrollbar-thumb-[#00d4ff]/50">
          {days.map((day, index) => (
            <div
              key={index}
              className="snap-start flex-shrink-0 bg-[#0d1b1e] rounded-2xl p-6 border border-[#1a2f35] hover:border-[#00d4ff]/50 transition-all duration-300 text-center min-w-[180px] hover:scale-105 hover:shadow-2xl hover:shadow-[#00d4ff]/20 hover:-translate-y-2 cursor-pointer group animate-fade-in-scale"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <h3 className="text-white font-semibold mb-4 transition-colors group-hover:text-[#00d4ff]">{day.day}</h3>
              <div className="mb-4 flex justify-center transition-transform group-hover:scale-110 group-hover:rotate-3">
                {getWeatherIcon(day.icon)}
              </div>
              <div className="mb-2">
                <div className="text-3xl font-bold text-white transition-all group-hover:text-[#00d4ff] group-hover:scale-110">{day.high}°C</div>
                {day.low !== undefined && (
                  <div className="text-lg text-gray-400 transition-colors group-hover:text-[#00d4ff]/70">{day.low}°C</div>
                )}
              </div>
              <p className="text-gray-400 text-sm transition-colors group-hover:text-white">{day.condition}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
