export default function CatalogLoading() {
  return (
    <div className="min-w-0 pb-6 animate-pulse">
      <div className="hidden h-10 w-48 rounded-lg bg-gray-200 lg:block" />
      <div className="mt-6 flex gap-2 overflow-hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-8 w-24 shrink-0 rounded-full bg-gray-200" />
        ))}
      </div>
      <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-[180px] rounded-xl bg-gray-200" />
        ))}
      </div>
    </div>
  );
}
