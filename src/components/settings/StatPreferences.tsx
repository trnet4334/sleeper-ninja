import { useMemo } from "react";
import { useCategories } from "@/hooks/useCategories";
import { useStatPrefs } from "@/hooks/useStatPrefs";

export function StatPreferencesPanel() {
  const { hitterCats, pitcherCats, relatedStats } = useCategories();
  const { statPrefs, daysBack, setStatPrefs } = useStatPrefs();

  const suggestions = useMemo(
    () =>
      Array.from(new Set([...hitterCats, ...pitcherCats].flatMap((category) => relatedStats(category)))).slice(0, 10),
    [hitterCats, pitcherCats, relatedStats]
  );

  return (
    <div className="space-y-4">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-on-surface-variant/50">Suggested Advanced Stats</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {suggestions.map((item) => {
            const selected = statPrefs.includes(item);
            return (
              <button
                key={item}
                type="button"
                onClick={() =>
                  setStatPrefs({
                    advanced: selected ? statPrefs.filter((stat) => stat !== item) : [...statPrefs, item],
                    daysBack
                  })
                }
                className={`rounded-full px-3 py-1 text-xs uppercase tracking-[0.16em] ${
                  selected ? "bg-primary text-background" : "bg-surface-container-low text-on-surface-variant"
                }`}
              >
                {item}
              </button>
            );
          })}
        </div>
      </div>

      <label className="block">
        <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-on-surface-variant/50">Days Back</span>
        <select
          value={daysBack}
          onChange={(event) =>
            setStatPrefs({
              advanced: statPrefs,
              daysBack: Number(event.target.value)
            })
          }
          className="mt-2 w-full rounded-xl border border-white/10 bg-surface-container-low px-3 py-2 text-sm text-on-surface"
        >
          {[7, 14, 30].map((option) => (
            <option key={option} value={option}>
              {option} days
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
