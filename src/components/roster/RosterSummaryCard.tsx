export function RosterSummaryCard({
  label,
  value,
  accent = false
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/5 bg-surface-container-low p-5">
      <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-on-surface-variant">{label}</p>
      <p className={`font-headline text-3xl font-extrabold ${accent ? "text-primary" : "text-on-surface"}`}>
        {value}
      </p>
    </div>
  );
}
