interface WeatherMetricCardProps {
  title: string;
  value: string | number;
  icon: 'wind' | 'humidity' | 'visibility';
  unit?: string;
  change?: string;
}

export default function WeatherMetricCard({
  title,
  value,
  icon,
  unit = '',
  change,
}: WeatherMetricCardProps) {
  const icons = {
    wind: (
      <svg className="w-8 h-8 text-[#00d4ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
      </svg>
    ),
    humidity: (
      <svg className="w-8 h-8 text-[#00d4ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
      </svg>
    ),
    visibility: (
      <svg className="w-8 h-8 text-[#00d4ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    ),
  };

  return (
    <div className="bg-[#0d1b1e] rounded-2xl p-6 border border-[#1a2f35] hover:border-[#00d4ff]/50 transition-all duration-300 hover:shadow-lg hover:shadow-[#00d4ff]/10 hover:-translate-y-1 hover:scale-105 cursor-pointer group animate-fade-in-scale">
      <div className="flex items-start justify-between mb-4">
        <span className="text-gray-400 text-sm font-medium uppercase tracking-wider transition-colors group-hover:text-[#00d4ff]">{title}</span>
        <div className="transition-transform group-hover:scale-110 group-hover:rotate-12">
          {icons[icon]}
        </div>
      </div>
      <div>
        <div className="text-3xl font-bold text-white mb-1 transition-all group-hover:text-[#00d4ff] group-hover:scale-105">
          {value}
          <span className="text-xl ml-1">{unit}</span>
        </div>
        {change && (
          <div className="flex items-center gap-1 text-sm">
            <span className={change.includes('+') ? 'text-[#4ade80]' : 'text-[#00d4ff]'}>
              {change}
            </span>
          </div>
        )}
        {title === 'HUMIDITY' && (
          <p className="text-gray-500 text-sm">Stable</p>
        )}
      </div>
    </div>
  );
}
