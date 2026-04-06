import { PageHeader } from "@/components/ui/PageHeader";

export function ProspectsNewsPage() {
  return (
    <section className="space-y-6">
      <PageHeader
        title="Prospects News"
        subtitle="Call-ups, promotions, and debut coverage relevant to your fantasy roster."
        tags={["Coming Soon"]}
      />
      <div className="rounded-shell border border-white/5 bg-surface-container-lowest px-6 py-12 text-center">
        <p className="text-sm font-medium text-on-surface-variant">
          Prospect news feed coming soon.
        </p>
      </div>
    </section>
  );
}
