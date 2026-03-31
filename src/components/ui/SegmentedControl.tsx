export function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
  "aria-label": ariaLabel
}: {
  value: T;
  options: readonly T[];
  onChange: (value: T) => void;
  "aria-label"?: string;
}) {
  return (
    <div role="group" aria-label={ariaLabel} className="flex w-fit rounded-lg bg-surface-container-lowest p-1">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          aria-pressed={value === option}
          onClick={() => onChange(option)}
          className={`rounded-md px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] ${
            value === option ? "bg-primary text-background" : "text-on-surface-variant hover:text-on-surface"
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
