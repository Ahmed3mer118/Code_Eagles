/**
 * Skeleton placeholder for the content area. Keeping the surrounding layout
 * (sidebar, header) mounted while only this area swaps avoids the full-page flash.
 */
export default function ContentLoader({ cards = 4, rows = 3 }) {
  return (
    <div className="space-y-5" role="status" aria-busy="true">
      <div className="ce-skeleton h-24 rounded-[var(--ce-radius)]" />
      {cards > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: cards }).map((_, index) => (
            <div key={index} className="ce-skeleton h-28 rounded-[var(--ce-radius)]" />
          ))}
        </div>
      )}
      {rows > 0 && (
        <div className="ce-card space-y-3 p-5">
          {Array.from({ length: rows }).map((_, index) => (
            <div key={index} className="ce-skeleton h-12 rounded-xl" />
          ))}
        </div>
      )}
    </div>
  );
}
