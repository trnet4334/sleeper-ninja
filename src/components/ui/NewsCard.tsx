type ProspectCategory = "recalled" | "promoted" | "optioned" | "debut" | "other";

export interface NewsCardItem {
  id: string;
  source: string;
  playerName: string;
  team: string;
  category: ProspectCategory;
  title: string;
  summary: string;
  publishedAt: string;
  link?: string;
}

const CATEGORY_STYLES: Record<ProspectCategory, { label: string; className: string }> = {
  recalled: { label: "Recalled", className: "bg-primary/10 text-primary" },
  debut:    { label: "Debut",    className: "bg-primary/10 text-primary" },
  promoted: { label: "Promoted", className: "bg-tertiary/10 text-tertiary" },
  optioned: { label: "Optioned", className: "bg-surface-container-high text-on-surface-variant" },
  other:    { label: "News",     className: "bg-surface-container-high text-on-surface-variant" },
};

function relativeTime(isoString: string): string {
  const ms = Date.now() - new Date(isoString).getTime();
  const hours = Math.floor(ms / 3_600_000);
  if (hours < 1) return "< 1h ago";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

interface NewsCardProps {
  item: NewsCardItem;
}

export function NewsCard({ item }: NewsCardProps) {
  const style = CATEGORY_STYLES[item.category] ?? CATEGORY_STYLES.other;

  return (
    <div className="rounded-shell border border-white/5 bg-surface-container-lowest px-5 py-4 space-y-2">
      <div className="flex items-start gap-2">
        <span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${style.className}`}>
          {style.label}
        </span>
        <span className="font-semibold text-sm text-on-surface leading-snug">
          {item.playerName}
          {item.team && (
            <span className="ml-1.5 font-normal text-on-surface-variant">· {item.team}</span>
          )}
        </span>
      </div>
      <p className="text-[12px] leading-relaxed text-on-surface-variant line-clamp-3">
        {item.summary || item.title}
      </p>
      <div className="flex items-center justify-between pt-0.5">
        <span className="text-[10px] text-on-surface-variant/60 capitalize">{item.source}</span>
        <span className="text-[10px] text-on-surface-variant/60">{relativeTime(item.publishedAt)}</span>
      </div>
    </div>
  );
}
