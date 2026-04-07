interface NewsFilterChipsProps {
  options: { label: string; value: string }[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

export function NewsFilterChips({ options, selected, onChange }: NewsFilterChipsProps) {
  const toggle = (value: string) => {
    if (value === "all") {
      onChange([]);
      return;
    }
    const next = selected.includes(value)
      ? selected.filter((v) => v !== value)
      : [...selected, value];
    onChange(next);
  };

  const allActive = selected.length === 0;

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
      <button
        type="button"
        onClick={() => toggle("all")}
        className={`shrink-0 rounded-md border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] transition-colors ${
          allActive
            ? "border-primary/30 bg-primary/10 text-primary"
            : "border-white/10 bg-surface-container-low text-on-surface-variant hover:text-on-surface"
        }`}
      >
        All
      </button>
      {options.map(({ label, value }) => {
        const active = selected.includes(value);
        return (
          <button
            key={value}
            type="button"
            onClick={() => toggle(value)}
            className={`shrink-0 rounded-md border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] transition-colors ${
              active
                ? "border-primary/30 bg-primary/10 text-primary"
                : "border-white/10 bg-surface-container-low text-on-surface-variant hover:text-on-surface"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
