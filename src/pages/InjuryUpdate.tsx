import { PageHeader } from "@/components/ui/PageHeader";

export function InjuryUpdatePage() {
  return (
    <section className="space-y-6">
      <PageHeader
        title="Injury Update"
        subtitle="IL placements, return timelines, and status changes affecting fantasy rosters."
        tags={["Coming Soon"]}
      />
      <div className="rounded-shell border border-white/5 bg-surface-container-lowest px-6 py-12 text-center">
        <p className="text-sm font-medium text-on-surface-variant">
          Injury tracking feed coming soon.
        </p>
      </div>
    </section>
  );
}
