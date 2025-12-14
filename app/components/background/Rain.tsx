export default function Rain() {
  return (
    <div className="absolute inset-0 bg-gradient-to-br from-gray-600 via-gray-700 to-gray-800">
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-0.5 h-8 bg-blue-200/40"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animation: 'fall 1s linear infinite',
            }}
          />
        ))}
      </div>
    </div>
  );
}
