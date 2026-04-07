type ILStatus = "IL10" | "IL15" | "IL60" | "DTD" | "RTN";

export interface InjuryCardItem {
  id: string;
  source: string;
  playerName: string;
  team: string;
  position?: string;
  ilStatus: ILStatus;
  description: string;
  returnDate?: string;
  publishedAt: string;
}

const IL_STYLES: Record<ILStatus, string> = {
  IL10: "bg-amber-400/15 text-amber-400",
  IL15: "bg-orange-400/15 text-orange-400",
  IL60: "bg-rose-400/15 text-rose-400",
  DTD:  "bg-yellow-400/15 text-yellow-500",
  RTN:  "bg-green-400/15 text-green-400",
};

function formatReturnDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function relativeTime(isoString: string): string {
  const ms = Date.now() - new Date(isoString).getTime();
  const hours = Math.floor(ms / 3_600_000);
  if (hours < 1) return "< 1h ago";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

interface InjuryCardProps {
  item: InjuryCardItem;
}

export function InjuryCard({ item }: InjuryCardProps) {
  const tagClass = IL_STYLES[item.ilStatus] ?? IL_STYLES.IL10;
  const label = item.ilStatus === "RTN" ? "RTN ✓" : item.ilStatus;

  return (
    <div className="rounded-shell border border-white/5 bg-surface-container-lowest px-5 py-4 space-y-2">
      <div className="flex items-start gap-2">
        <span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${tagClass}`}>
          {label}
        </span>
        <span className="font-semibold text-sm text-on-surface leading-snug">
          {item.playerName}
          {item.team && (
            <span className="ml-1.5 font-normal text-on-surface-variant">· {item.team}</span>
          )}
          {item.position && (
            <span className="ml-1.5 font-normal text-on-surface-variant">· {item.position}</span>
          )}
        </span>
      </div>
      <p className="text-[12px] leading-relaxed text-on-surface-variant line-clamp-3">
        {item.description}
      </p>
      {item.returnDate && (
        <p className="text-[11px] text-on-surface-variant/80">
          Return est: <span className="font-medium text-on-surface">{formatReturnDate(item.returnDate)}</span>
        </p>
      )}
      <div className="flex items-center justify-between pt-0.5">
        <span className="text-[10px] text-on-surface-variant/60 capitalize">{item.source}</span>
        <span className="text-[10px] text-on-surface-variant/60">{relativeTime(item.publishedAt)}</span>
      </div>
    </div>
  );
}
