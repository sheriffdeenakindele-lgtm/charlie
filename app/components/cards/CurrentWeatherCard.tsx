interface CurrentWeatherCardProps {
  temperature: number;
  condition: string;
  high: number;
  low: number;
}

export default function CurrentWeatherCard({
  temperature,
  condition,
  high,
  low,
}: CurrentWeatherCardProps) {
  return (
    <div className="relative bg-gradient-to-br from-[#3b82f6]/20 to-[#1e3a8a]/20 rounded-lg p-8 flex flex-col md:flex-row items-center md:items-start justify-between min-h-[240px] border border-white/5 overflow-hidden">
      <div className="absolute -right-10 -top-10 opacity-10">
        <span className="material-symbols-outlined text-[20rem]">sunny</span>
      </div>
      <div className="flex flex-col items-center md:items-start z-10">
        <div className="flex items-center gap-2 mb-2 bg-white/10 px-3 py-1 rounded-full w-fit">
          <span className="w-2 h-2 rounded-full bg-[#fbbf24] animate-ping"></span>
          <span className="text-xs font-bold uppercase tracking-wider text-white/90">Live Forecast</span>
        </div>
        <h1 className="text-[6rem] md:text-[8rem] font-bold leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-200">
          {temperature}°
        </h1>
        <p className="text-2xl md:text-3xl font-medium text-white mt-2 flex items-center gap-2">
          <span className="material-symbols-outlined text-[#fbbf24]">sunny</span>
          {condition}
        </p>
        <p className="text-white/60 mt-1">H: {high}°  L: {low}°</p>
      </div>
      <div className="mt-6 md:mt-0 md:absolute md:right-8 md:top-1/2 md:-translate-y-1/2 opacity-100 drop-shadow-[0_0_35px_rgba(251,191,36,0.4)]">
        <span className="material-symbols-outlined text-[10rem] md:text-[14rem] text-[#fbbf24] font-thin" style={{fontVariationSettings: "'FILL' 1, 'wght' 200"}}>
          sunny
        </span>
      </div>
    </div>
  );
}
