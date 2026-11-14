import type { Review } from "./types";

export type CriterionKey = "noise" | "wifi" | "outlets" | "crowd";

type RatingColumn =
  | "noise_rating"
  | "wifi_rating"
  | "outlet_rating"
  | "crowd_rating";

export type Criterion = {
  key: CriterionKey;
  column: RatingColumn;
  label: string;
  filterLabel: string;
  lowLabel: string;
  highLabel: string;
};

// Every rating is stored on a 1 to 5 scale where 5 is the best outcome
// for studying: 5 means very quiet, very reliable WiFi, plenty of
// outlets and plenty of free seats.
export const CRITERIA: Criterion[] = [
  {
    key: "noise",
    column: "noise_rating",
    label: "Quietness",
    filterLabel: "Quiet",
    lowLabel: "Loud",
    highLabel: "Silent",
  },
  {
    key: "wifi",
    column: "wifi_rating",
    label: "WiFi",
    filterLabel: "Good WiFi",
    lowLabel: "Unreliable",
    highLabel: "Fast",
  },
  {
    key: "outlets",
    column: "outlet_rating",
    label: "Outlets",
    filterLabel: "Lots of outlets",
    lowLabel: "Hard to find",
    highLabel: "Everywhere",
  },
  {
    key: "crowd",
    column: "crowd_rating",
    label: "Seating",
    filterLabel: "Not crowded",
    lowLabel: "Packed",
    highLabel: "Plenty free",
  },
];

export const CRITERION_KEYS = CRITERIA.map((c) => c.key);

// A filter only matches spots whose average for that criterion is at least this.
export const FILTER_THRESHOLD = 4;

export type RatingSummary = {
  count: number;
  averages: Record<CriterionKey, number> | null;
  overall: number | null;
};

export function summarizeReviews(
  reviews: Pick<Review, RatingColumn>[]
): RatingSummary {
  const count = reviews.length;

  if (count === 0) {
    return { count, averages: null, overall: null };
  }

  const averages = {} as Record<CriterionKey, number>;

  for (const criterion of CRITERIA) {
    const total = reviews.reduce(
      (sum, review) => sum + review[criterion.column],
      0
    );
    averages[criterion.key] = total / count;
  }

  const overall =
    CRITERIA.reduce((sum, c) => sum + averages[c.key], 0) / CRITERIA.length;

  return { count, averages, overall };
}

export type Importance = 0 | 1 | 2 | 3;

export const IMPORTANCE_LABELS: Record<Importance, string> = {
  0: "Ignore",
  1: "Low",
  2: "Medium",
  3: "High",
};

export type Priorities = Record<CriterionKey, Importance>;

export const DEFAULT_PRIORITIES: Priorities = {
  noise: 2,
  wifi: 2,
  outlets: 2,
  crowd: 2,
};

/**
 * Weighted match score from 0 to 100.
 *
 * Each criterion average (1 to 5) is mapped onto 0 to 1, then combined as a
 * weighted mean using the importance the user picked. Returns null when the
 * spot has no reviews or every criterion is set to "Ignore".
 */
export function matchScore(
  summary: RatingSummary,
  priorities: Priorities
): number | null {
  if (!summary.averages) return null;

  let weighted = 0;
  let totalWeight = 0;

  for (const criterion of CRITERIA) {
    const weight = priorities[criterion.key];
    if (weight === 0) continue;

    const normalized = (summary.averages[criterion.key] - 1) / 4;
    weighted += normalized * weight;
    totalWeight += weight;
  }

  if (totalWeight === 0) return null;

  return Math.round((weighted / totalWeight) * 100);
}

export function formatRating(value: number) {
  return value.toFixed(1);
}
