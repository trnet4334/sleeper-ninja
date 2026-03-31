import { useCategories } from "@/hooks/useCategories";

function parseCategoryInput(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function CategoryManager() {
  const { hitterCats, pitcherCats, setCategories, relatedStats } = useCategories();

  return (
    <div className="space-y-4">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-on-surface-variant/50">Hitter Categories</p>
        <textarea
          defaultValue={hitterCats.join(", ")}
          onBlur={(event) =>
            setCategories({
              hitter: parseCategoryInput(event.target.value),
              pitcher: pitcherCats
            })
          }
          className="mt-2 min-h-24 w-full rounded-xl border border-white/10 bg-surface-container-low px-3 py-2 text-sm text-on-surface"
        />
      </div>
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-on-surface-variant/50">Pitcher Categories</p>
        <textarea
          defaultValue={pitcherCats.join(", ")}
          onBlur={(event) =>
            setCategories({
              hitter: hitterCats,
              pitcher: parseCategoryInput(event.target.value)
            })
          }
          className="mt-2 min-h-24 w-full rounded-xl border border-white/10 bg-surface-container-low px-3 py-2 text-sm text-on-surface"
        />
      </div>
      <div className="rounded-xl bg-surface-container-low p-3">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-on-surface-variant/50">Mapping Preview</p>
        <div className="mt-3 space-y-2 text-xs text-on-surface-variant">
          {[...hitterCats.slice(0, 3), ...pitcherCats.slice(0, 2)].map((category) => (
            <p key={category}>
              <span className="font-semibold text-on-surface">{category}</span>: {relatedStats(category).join(", ")}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
