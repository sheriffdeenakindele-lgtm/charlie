interface HourlyData {
  time: string;
  temperature: number;
  icon: string;
}

interface HourlyForecastProps {
  hours: HourlyData[];
}

export default function HourlyForecast({ hours }: HourlyForecastProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-white/80 text-sm font-bold uppercase tracking-widest pl-1">Today</h3>
        <button className="text-[#fbbf24] text-xs font-bold uppercase hover:text-white transition-colors">
          Next 24 Hours
        </button>
      </div>
      <div className="flex overflow-x-auto gap-3 pb-4 -mx-2 px-2 snap-x">
        {hours.map((hour, index) => (
          <div
            key={index}
            className={`snap-start flex-shrink-0 flex flex-col items-center justify-between rounded-full w-16 h-28 py-4 ${
              index === 0
                ? 'bg-[#fbbf24] text-black shadow-[0_0_15px_rgba(251,191,36,0.3)]'
                : 'bg-[#151725] hover:bg-[#26383c] transition-colors border border-white/5'
            }`}
          >
            <span className={`text-xs font-bold ${index === 0 ? 'text-black' : 'text-[#9db4b9]'}`}>
              {hour.time}
            </span>
            <span className={`material-symbols-outlined text-2xl ${index === 0 ? 'text-black' : 'text-white'}`}>
              {hour.icon}
            </span>
            <span className="text-lg font-bold">{Math.round(hour.temperature)}°</span>
          </div>
        ))}
      </div>
    </div>
  );
}
