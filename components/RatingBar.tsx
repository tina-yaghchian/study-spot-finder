import { formatRating } from "@/lib/ratings";

type RatingBarProps = {
  label: string;
  value: number;
  compact?: boolean;
  hint?: string;
};

export default function RatingBar({
  label,
  value,
  compact = false,
  hint,
}: RatingBarProps) {
  const percent = Math.max(0, Math.min(100, ((value - 1) / 4) * 100));

  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <span className={compact ? "text-xs text-ink-muted" : "text-sm text-ink"}>
          {label}
          {hint && <span className="ml-2 text-xs text-ink-subtle">{hint}</span>}
        </span>
        <span
          className={`tabular-nums ${
            compact ? "text-xs text-ink-muted" : "text-sm font-medium text-ink"
          }`}
        >
          {formatRating(value)}
          {!compact && <span className="text-ink-subtle"> / 5</span>}
        </span>
      </div>
      <div
        className={`mt-1 w-full overflow-hidden rounded-sm bg-line ${
          compact ? "h-1" : "h-1.5"
        }`}
        aria-hidden
      >
        <div className="h-full bg-accent" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
