export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900">
      <div className="text-center">
        <div className="neon-loader">
          <div className="neon-loader-ring"></div>
        </div>
        <p className="mt-4 text-white">Loading weather information, Please wait...</p>
      </div>
    </div>
  );
}
