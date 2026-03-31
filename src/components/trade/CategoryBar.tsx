export function CategoryBar({
  category,
  deltaLabel,
  deltaPositive,
  description
}: {
  category: string;
  deltaLabel: string;
  deltaPositive: boolean | null;
  description: string;
}) {
  const badgeClass =
    deltaPositive === true
      ? "text-primary"
      : deltaPositive === false
        ? "text-rose-300"
        : "text-on-surface";

  return (
    <div className="space-y-2">
      <div className="flex items-end justify-between">
        <span className="text-xs font-bold uppercase tracking-wide text-on-surface">{category}</span>
        <span className={`text-xs font-bold ${badgeClass}`}>{deltaLabel}</span>
      </div>
      <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-surface-container-high">
        {/* Base fill */}
        <div className="h-full bg-surface-container-highest" style={{ width: "55%" }} />
        {/* Delta fill */}
        {deltaPositive !== null && (
          <div
            className={`h-full ${deltaPositive ? "bg-primary" : "bg-rose-400"}`}
            style={{ width: "15%" }}
          />
        )}
      </div>
      <p className="text-[10px] leading-relaxed text-on-surface-variant">{description}</p>
    </div>
  );
}
