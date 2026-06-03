export function SkeletonCard() {
  return (
    <div className="bg-surface border border-border2 rounded-2xl p-5 space-y-4">
      <div className="flex justify-between">
        <div className="skeleton h-3 w-28" />
        <div className="skeleton h-3 w-16" />
      </div>
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 space-y-2 flex flex-col items-center">
          <div className="skeleton h-10 w-10 rounded-full" />
          <div className="skeleton h-3 w-16" />
        </div>
        <div className="skeleton h-8 w-10 rounded-lg" />
        <div className="flex-1 space-y-2 flex flex-col items-center">
          <div className="skeleton h-10 w-10 rounded-full" />
          <div className="skeleton h-3 w-16" />
        </div>
      </div>
      <div className="skeleton h-6 w-20 mx-auto rounded" />
      <div className="space-y-2">
        <div className="skeleton h-2 w-full rounded" />
        <div className="skeleton h-2 w-full rounded" />
        <div className="skeleton h-2 w-full rounded" />
      </div>
    </div>
  );
}

export function SkeletonTeamCard() {
  return (
    <div className="bg-surface border border-border2 rounded-2xl p-5 space-y-4">
      <div className="flex items-center gap-4">
        <div className="skeleton h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <div className="skeleton h-4 w-24" />
          <div className="skeleton h-3 w-16" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="skeleton h-14 rounded-xl" />
        ))}
      </div>
      <div className="skeleton h-3 w-32" />
      <div className="flex gap-2">
        {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-6 w-6 rounded-md" />)}
      </div>
    </div>
  );
}
