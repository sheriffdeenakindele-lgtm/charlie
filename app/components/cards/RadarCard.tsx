export default function RadarCard() {
  return (
    <div className="w-full h-48 bg-[#151725]/50 rounded-lg overflow-hidden border border-white/5 relative group cursor-pointer mt-auto hidden xl:block">
      <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 opacity-40 group-hover:opacity-60 transition-all duration-500 relative">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff10_1px,transparent_1px),linear-gradient(to_bottom,#ffffff10_1px,transparent_1px)] bg-[size:20px_20px]"></div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#fbbf24]">map</span>
          <span className="font-bold text-sm">View Radar</span>
        </div>
      </div>
    </div>
  );
}
