export default function Fog() {
  return (
    <div className="absolute inset-0 bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-48 bg-white/40 blur-3xl animate-fog" />
        <div className="absolute top-1/3 left-0 w-full h-48 bg-white/30 blur-3xl animate-fog-delayed" />
        <div className="absolute bottom-0 left-0 w-full h-48 bg-white/35 blur-3xl animate-fog" />
      </div>
    </div>
  );
}
