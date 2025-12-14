export default function Storm() {
  return (
    <div className="absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-900 to-black">
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-0.5 h-12 bg-blue-300/60"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 1.5}s`,
              animation: 'fall 0.7s linear infinite',
            }}
          />
        ))}
        <div className="absolute inset-0 bg-yellow-200/10 animate-flash" />
      </div>
    </div>
  );
}
