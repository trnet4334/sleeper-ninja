import { useMemo, useState } from "react";
import { NewsCard } from "@/components/ui/NewsCard";
import { NewsFilterChips } from "@/components/ui/NewsFilterChips";
import { PageHeader } from "@/components/ui/PageHeader";
import { useProspectsNews } from "@/hooks/useNews";

const FILTER_OPTIONS = [
  { label: "Recalled", value: "recalled" },
  { label: "Promoted", value: "promoted" },
  { label: "Optioned", value: "optioned" },
  { label: "Debut",    value: "debut" },
];

function SkeletonCard() {
  return (
    <div className="rounded-shell border border-white/5 bg-surface-container-lowest px-5 py-4 space-y-2 animate-pulse">
      <div className="flex items-start gap-2">
        <div className="h-4 w-16 rounded bg-white/10" />
        <div className="h-4 w-32 rounded bg-white/10" />
      </div>
      <div className="space-y-1.5">
        <div className="h-3 w-full rounded bg-white/5" />
        <div className="h-3 w-4/5 rounded bg-white/5" />
        <div className="h-3 w-3/5 rounded bg-white/5" />
      </div>
      <div className="flex justify-between pt-0.5">
        <div className="h-2.5 w-16 rounded bg-white/5" />
        <div className="h-2.5 w-12 rounded bg-white/5" />
      </div>
    </div>
  );
}

export function ProspectsNewsPage() {
  const [selected, setSelected] = useState<string[]>([]);
  const { data, loading, error } = useProspectsNews(7);

  const items = useMemo(() => {
    const all = data?.items ?? [];
    if (selected.length === 0) return all;
    return all.filter((item) => selected.includes(item.category));
  }, [data?.items, selected]);

  return (
    <section className="space-y-6">
      <PageHeader
        title="Prospects News"
        subtitle="Call-ups, promotions, and debut coverage relevant to your fantasy roster."
        tags={["Live Feed", "V1"]}
      />

      <NewsFilterChips
        options={FILTER_OPTIONS}
        selected={selected}
        onChange={setSelected}
      />

      <div className="space-y-3">
        {loading && (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        )}

        {error && !loading && (
          <div className="rounded-shell border border-white/5 bg-surface-container-lowest px-6 py-5 text-center">
            <p className="text-sm text-on-surface-variant">
              ⚠ Unable to load news. Data may be up to 24 hours old.
            </p>
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="rounded-shell border border-white/5 bg-surface-container-lowest px-6 py-12 text-center">
            <p className="text-sm font-medium text-on-surface-variant">
              No prospect news in the last 7 days.
            </p>
            <p className="mt-1 text-xs text-on-surface-variant/60">
              Check back after roster moves are announced.
            </p>
          </div>
        )}

        {!loading &&
          items.map((item) => <NewsCard key={item.id} item={item} />)}
      </div>

      <div aria-live="polite" aria-atomic="true">
        {loading && (
          <p className="text-sm text-on-surface-variant sr-only">Loading prospect news...</p>
        )}
      </div>
    </section>
  );
}
