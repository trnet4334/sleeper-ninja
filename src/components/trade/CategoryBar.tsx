export function CategoryBar({
  category,
  delta,
  deltaLabel,
  weaknessBadge,
  strengthBadge,
}: {
  category: string;
  delta: number;
  deltaLabel: string;
  weaknessBadge?: boolean;
  strengthBadge?: boolean;
}) {
  const isPositive = delta > 0.05;
  const isNegative = delta < -0.05;
  const fillPct = Math.min(100, Math.abs(delta) * 50);

  const labelClass = isPositive
    ? "text-primary"
    : isNegative
      ? "text-rose-300"
      : "text-on-surface-variant";

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold uppercase tracking-wide text-on-surface">
            {category}
          </span>
          {weaknessBadge && (
            <span className="rounded px-1 py-0.5 text-[8px] font-black uppercase bg-rose-500/15 text-rose-300">
              缺口
            </span>
          )}
          {strengthBadge && (
            <span className="rounded px-1 py-0.5 text-[8px] font-black uppercase bg-primary/10 text-primary">
              優勢
            </span>
          )}
        </div>
        <span className={`text-xs font-bold tabular-nums ${labelClass}`}>{deltaLabel}</span>
      </div>

      {/* Bidirectional bar — center at 50%, negative fills left, positive fills right */}
      <div className="relative flex h-2 overflow-hidden rounded-full bg-surface-container-high">
        {/* Left half: negative fills from center outward (flex-row-reverse) */}
        <div className="flex h-full w-1/2 flex-row-reverse">
          {isNegative && (
            <div className="h-full bg-rose-400 rounded-l-full" style={{ width: `${fillPct}%` }} />
          )}
        </div>
        {/* Center marker */}
        <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-outline-variant/40" />
        {/* Right half: positive fills from center outward */}
        <div className="flex h-full w-1/2">
          {isPositive && (
            <div className="h-full bg-primary rounded-r-full" style={{ width: `${fillPct}%` }} />
          )}
        </div>
      </div>
    </div>
  );
}
