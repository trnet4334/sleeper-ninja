import { useMemo, useState } from "react";
import { InjuryCard } from "@/components/ui/InjuryCard";
import { NewsFilterChips } from "@/components/ui/NewsFilterChips";
import { PageHeader } from "@/components/ui/PageHeader";
import { useInjuryNews } from "@/hooks/useNews";

const FILTER_OPTIONS = [
  { label: "IL10", value: "IL10" },
  { label: "IL15", value: "IL15" },
  { label: "IL60", value: "IL60" },
  { label: "DTD",  value: "DTD" },
  { label: "RTN",  value: "RTN" },
];

function SkeletonCard() {
  return (
    <div className="rounded-shell border border-white/5 bg-surface-container-lowest px-5 py-4 space-y-2 animate-pulse">
      <div className="flex items-start gap-2">
        <div className="h-4 w-12 rounded bg-white/10" />
        <div className="h-4 w-40 rounded bg-white/10" />
      </div>
      <div className="space-y-1.5">
        <div className="h-3 w-full rounded bg-white/5" />
        <div className="h-3 w-4/5 rounded bg-white/5" />
        <div className="h-3 w-2/3 rounded bg-white/5" />
      </div>
      <div className="flex justify-between pt-0.5">
        <div className="h-2.5 w-16 rounded bg-white/5" />
        <div className="h-2.5 w-12 rounded bg-white/5" />
      </div>
    </div>
  );
}

export function InjuryUpdatePage() {
  const [selected, setSelected] = useState<string[]>([]);
  const { data, loading, error } = useInjuryNews(14);

  const items = useMemo(() => {
    const all = data?.items ?? [];
    if (selected.length === 0) return all;
    return all.filter((item) => selected.includes(item.ilStatus));
  }, [data?.items, selected]);

  return (
    <section className="space-y-6">
      <PageHeader
        title="Injury Update"
        subtitle="IL placements, return timelines, and status changes affecting fantasy rosters."
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
              No injury updates in the last 14 days.
            </p>
          </div>
        )}

        {!loading &&
          items.map((item) => <InjuryCard key={item.id} item={item} />)}
      </div>

      <div aria-live="polite" aria-atomic="true">
        {loading && (
          <p className="text-sm text-on-surface-variant sr-only">Loading injury updates...</p>
        )}
      </div>
    </section>
  );
}
