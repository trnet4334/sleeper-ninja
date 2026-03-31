export function PageHeader({
  title,
  subtitle,
  tags
}: {
  title: string;
  subtitle: string;
  tags: string[];
}) {
  return (
    <div className="flex flex-col gap-5 border-b border-white/10 pb-4 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface">{title}</h1>
        <p className="mt-1 text-sm text-on-surface-variant">{subtitle}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-surface-container-high px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
