export function SkeletonCard() {
  return (
    <div className="animate-pulse bg-white/5 border border-white/10 rounded-2xl p-6 w-full h-32">
      <div className="h-4 bg-white/10 rounded w-1/3 mb-4"></div>
      <div className="h-8 bg-white/10 rounded w-1/2 mb-2"></div>
      <div className="h-4 bg-white/10 rounded w-1/4"></div>
    </div>
  );
}

export function SkeletonTable() {
  return (
    <div className="animate-pulse space-y-4 w-full">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex gap-4">
          <div className="h-4 bg-white/10 rounded w-1/4"></div>
          <div className="h-4 bg-white/10 rounded w-1/4"></div>
          <div className="h-4 bg-white/10 rounded w-1/4"></div>
          <div className="h-4 bg-white/10 rounded w-1/4"></div>
        </div>
      ))}
    </div>
  );
}