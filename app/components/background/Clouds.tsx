export default function Clouds() {
  return (
    <div className="absolute inset-0 bg-gradient-to-br from-gray-400 via-gray-500 to-gray-600">
      <div className="absolute top-10 left-20 w-40 h-20 bg-white/30 rounded-full blur-xl animate-float" />
      <div className="absolute top-32 right-32 w-56 h-24 bg-white/20 rounded-full blur-xl animate-float-delayed" />
      <div className="absolute bottom-20 left-1/3 w-48 h-20 bg-white/25 rounded-full blur-xl animate-float" />
    </div>
  );
}
