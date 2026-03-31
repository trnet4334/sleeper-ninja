export function StatChip({
  label,
  tone = "neutral"
}: {
  label: string;
  tone?: "neutral" | "primary" | "positive" | "negative";
}) {
  const className =
    tone === "primary"
      ? "bg-primary/10 text-primary"
      : tone === "positive"
        ? "bg-emerald-500/15 text-emerald-300"
        : tone === "negative"
          ? "bg-rose-500/15 text-rose-300"
          : "bg-surface-container-high text-on-surface-variant";

  return <span className={`rounded-full px-3 py-1 text-xs uppercase tracking-[0.16em] ${className}`}>{label}</span>;
}
