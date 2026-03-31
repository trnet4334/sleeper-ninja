const BADGE: Record<"WIN" | "LOSS" | "TOSS", string> = {
  WIN: "bg-emerald-500/15 text-emerald-300",
  LOSS: "bg-rose-500/15 text-rose-300",
  TOSS: "bg-primary/10 text-primary"
};

export function CategoryRow({
  category,
  myValue,
  opponentValue,
  result
}: {
  category: string;
  myValue: string | number;
  opponentValue: string | number;
  result: "WIN" | "LOSS" | "TOSS";
}) {
  return (
    <div className="flex items-center gap-4 border-b border-white/5 py-3 last:border-0">
      <span className="w-16 text-[10px] font-bold uppercase tracking-[0.22em] text-on-surface-variant">
        {category}
      </span>
      <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ${BADGE[result]}`}>
        {result}
      </span>
      <span className="ml-auto flex gap-6 text-sm tabular-nums">
        <span className="text-on-surface">{String(myValue)}</span>
        <span className="text-on-surface-variant">{String(opponentValue)}</span>
      </span>
    </div>
  );
}
