export default function Snow() {
  return (
    <div className="absolute inset-0 bg-gradient-to-br from-slate-300 via-slate-400 to-slate-500">
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white rounded-full opacity-80"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animation: 'snowfall 3s linear infinite',
            }}
          />
        ))}
      </div>
    </div>
  );
}
