import { cx } from "@/lib/utils";

export function MetricCard({
  label,
  value,
  note,
  tone = "primary"
}: {
  label: string;
  value: string;
  note: string;
  tone?: "primary" | "tertiary" | "error" | "neutral";
}) {
  return (
    <div
      className={cx(
        "rounded-2xl border border-white/5 border-t-2 bg-surface-container-low p-5 transition-colors hover:bg-surface-container-high",
        {
          "border-t-primary": tone === "primary",
          "border-t-tertiary": tone === "tertiary",
          "border-t-error": tone === "error",
          "border-t-on-surface/30": tone === "neutral"
        }
      )}
    >
      <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-on-surface-variant">{label}</p>
      <p
        className={cx("font-headline text-3xl font-extrabold", {
          "text-primary": tone === "primary",
          "text-tertiary": tone === "tertiary",
          "text-error": tone === "error",
          "text-on-surface": tone === "neutral"
        })}
      >
        {value}
      </p>
      <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-on-surface-variant">{note}</p>
    </div>
  );
}
