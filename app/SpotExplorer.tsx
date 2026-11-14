"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ChevronRight,
  List,
  Map as MapIcon,
  MapPin,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import SpotMap from "@/components/SpotMap";
import RatingBar from "@/components/RatingBar";
import { buttonGhost, buttonSecondary, card, input } from "@/components/ui";
import {
  CRITERIA,
  CRITERION_KEYS,
  DEFAULT_PRIORITIES,
  FILTER_THRESHOLD,
  IMPORTANCE_LABELS,
  formatRating,
  matchScore,
  type CriterionKey,
  type Importance,
  type Priorities,
  type RatingSummary,
} from "@/lib/ratings";
import type { StudySpot } from "@/lib/types";

export type SpotWithSummary = StudySpot & { summary: RatingSummary };

type SortKey = "match" | "rating" | "reviews" | "name";
type ViewKey = "list" | "map";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "match", label: "Best match" },
  { value: "rating", label: "Highest rated" },
  { value: "reviews", label: "Most reviewed" },
  { value: "name", label: "Name" },
];

const IMPORTANCE_LEVELS: Importance[] = [0, 1, 2, 3];

function parseFilters(value: string | undefined): CriterionKey[] {
  if (!value) return [];
  return value
    .split(",")
    .filter((key): key is CriterionKey =>
      CRITERION_KEYS.includes(key as CriterionKey)
    );
}

function parsePriorities(value: string | undefined): Priorities {
  if (!value || !/^[0-3]{4}$/.test(value)) return DEFAULT_PRIORITIES;
  const priorities = { ...DEFAULT_PRIORITIES };
  CRITERION_KEYS.forEach((key, index) => {
    priorities[key] = Number(value[index]) as Importance;
  });
  return priorities;
}

function serializePriorities(priorities: Priorities) {
  return CRITERION_KEYS.map((key) => priorities[key]).join("");
}

function parseSort(value: string | undefined): SortKey {
  return SORT_OPTIONS.some((o) => o.value === value)
    ? (value as SortKey)
    : "match";
}

type SpotExplorerProps = {
  spots: SpotWithSummary[];
  initialQuery: Record<string, string | undefined>;
};

export default function SpotExplorer({
  spots,
  initialQuery,
}: SpotExplorerProps) {
  const [query, setQuery] = useState(initialQuery.q ?? "");
  const [filters, setFilters] = useState<CriterionKey[]>(() =>
    parseFilters(initialQuery.f)
  );
  const [priorities, setPriorities] = useState<Priorities>(() =>
    parsePriorities(initialQuery.p)
  );
  const [sort, setSort] = useState<SortKey>(() => parseSort(initialQuery.sort));
  const [showOptions, setShowOptions] = useState(false);
  const [view, setView] = useState<ViewKey>(
    initialQuery.view === "map" ? "map" : "list"
  );

  // Keep the URL in sync so a filtered view can be bookmarked or shared.
  useEffect(() => {
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (filters.length) params.set("f", filters.join(","));
    if (sort !== "match") params.set("sort", sort);
    const serialized = serializePriorities(priorities);
    if (serialized !== serializePriorities(DEFAULT_PRIORITIES)) {
      params.set("p", serialized);
    }
    if (view === "map") params.set("view", "map");

    const search = params.toString();
    const url = search ? `?${search}` : window.location.pathname;
    window.history.replaceState(null, "", url);
  }, [query, filters, priorities, sort, view]);

  const results = useMemo(() => {
    const term = query.trim().toLowerCase();

    const matching = spots
      .filter((spot) => {
        if (!term) return true;
        return [spot.name, spot.building, spot.description, spot.address]
          .filter(Boolean)
          .some((field) => field!.toLowerCase().includes(term));
      })
      .filter((spot) =>
        filters.every(
          (key) =>
            spot.summary.averages !== null &&
            spot.summary.averages[key] >= FILTER_THRESHOLD
        )
      )
      .map((spot) => ({ spot, score: matchScore(spot.summary, priorities) }));

    // Spots without reviews always sort after reviewed ones.
    const byNullable = (a: number | null, b: number | null) => {
      if (a === null && b === null) return 0;
      if (a === null) return 1;
      if (b === null) return -1;
      return b - a;
    };

    return matching.sort((a, b) => {
      let result = 0;
      if (sort === "match") result = byNullable(a.score, b.score);
      if (sort === "rating")
        result = byNullable(a.spot.summary.overall, b.spot.summary.overall);
      if (sort === "reviews")
        result = b.spot.summary.count - a.spot.summary.count;
      if (result !== 0) return result;
      return a.spot.name.localeCompare(b.spot.name);
    });
  }, [spots, query, filters, priorities, sort]);

  const mapSpots = results
    .map((r) => r.spot)
    .filter(
      (s): s is SpotWithSummary & { latitude: number; longitude: number } =>
        s.latitude !== null && s.longitude !== null
    );

  const hasActiveFilters = query.trim() !== "" || filters.length > 0;

  function toggleFilter(key: CriterionKey) {
    setFilters((current) =>
      current.includes(key)
        ? current.filter((k) => k !== key)
        : CRITERION_KEYS.filter((k) => k === key || current.includes(k))
    );
  }

  function clearFilters() {
    setQuery("");
    setFilters([]);
  }

  return (
    <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="space-y-6 lg:sticky lg:top-20 lg:self-start">
        <div>
          <label htmlFor="spot-search" className="text-sm font-medium text-ink">
            Search
          </label>
          <div className="relative mt-2">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-subtle"
              aria-hidden
            />
            <input
              id="spot-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Name or building"
              className={`${input} pl-9`}
            />
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowOptions((v) => !v)}
          aria-expanded={showOptions}
          aria-controls="explorer-options"
          className={`${buttonSecondary} w-full lg:hidden`}
        >
          <SlidersHorizontal className="size-4" aria-hidden />
          {showOptions ? "Hide filters" : "Filters and ranking"}
          {filters.length > 0 && ` (${filters.length})`}
        </button>

        <div
          id="explorer-options"
          className={`${showOptions ? "block" : "hidden"} space-y-6 lg:block`}
        >
          <fieldset>
            <legend className="text-sm font-medium text-ink">Must have</legend>
            <p className="mt-1 text-xs text-ink-subtle">
              Average rating of {FILTER_THRESHOLD} or more out of 5
            </p>
            <div className="mt-3 space-y-2">
              {CRITERIA.map((criterion) => (
                <label
                  key={criterion.key}
                  className="flex cursor-pointer items-center gap-2.5 text-sm text-ink"
                >
                  <input
                    type="checkbox"
                    checked={filters.includes(criterion.key)}
                    onChange={() => toggleFilter(criterion.key)}
                    className="size-4 rounded border-line-strong accent-accent"
                  />
                  {criterion.filterLabel}
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-sm font-medium text-ink">
              What matters to you
            </legend>
            <p className="mt-1 text-xs text-ink-subtle">
              Sets the weights used by the Best match ranking
            </p>
            <div className="mt-3 space-y-3">
              {CRITERIA.map((criterion) => (
                <div key={criterion.key}>
                  <p className="mb-1.5 text-xs font-medium text-ink-muted">
                    {criterion.label}
                  </p>
                  <div
                    role="radiogroup"
                    aria-label={`${criterion.label} importance`}
                    className="grid grid-cols-4 overflow-hidden rounded-md border border-line-strong"
                  >
                    {IMPORTANCE_LEVELS.map((level) => {
                      const selected = priorities[criterion.key] === level;
                      return (
                        <button
                          key={level}
                          type="button"
                          role="radio"
                          aria-checked={selected}
                          onClick={() =>
                            setPriorities((p) => ({
                              ...p,
                              [criterion.key]: level,
                            }))
                          }
                          className={`border-l border-line-strong px-1 py-1.5 text-xs first:border-l-0 ${
                            selected
                              ? "bg-accent font-medium text-white"
                              : "bg-surface text-ink-muted hover:bg-canvas"
                          }`}
                        >
                          {IMPORTANCE_LABELS[level]}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </fieldset>
        </div>
      </aside>

      <section aria-labelledby="results-heading" className="min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h2
              id="results-heading"
              className="text-sm font-medium text-ink"
              aria-live="polite"
            >
              {results.length} {results.length === 1 ? "result" : "results"}
            </h2>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className={`${buttonGhost} px-2 py-1 text-xs`}
              >
                <X className="size-3.5" aria-hidden />
                Clear filters
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="sort" className="sr-only">
              Sort by
            </label>
            <select
              id="sort"
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="rounded-md border border-line-strong bg-surface px-3 py-1.5 text-sm text-ink focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <div
              className="flex shrink-0 overflow-hidden rounded-md border border-line-strong"
              role="group"
              aria-label="Layout"
            >
              <ViewButton
                active={view === "list"}
                onClick={() => setView("list")}
                label="List"
              >
                <List className="size-4" aria-hidden />
              </ViewButton>
              <ViewButton
                active={view === "map"}
                onClick={() => setView("map")}
                label="Map"
              >
                <MapIcon className="size-4" aria-hidden />
              </ViewButton>
            </div>
          </div>
        </div>

        {view === "map" && (
          <div className="mt-4">
            <SpotMap spots={mapSpots} linkToSpots className="h-[28rem]" />
          </div>
        )}

        {results.length === 0 ? (
          <div className={`${card} mt-4 px-6 py-12 text-center`}>
            <p className="font-medium text-ink">No spots match these filters</p>
            <p className="mt-1 text-sm text-ink-muted">
              Spots without reviews are hidden while a filter is on.
            </p>
            <button
              type="button"
              onClick={clearFilters}
              className={`${buttonGhost} mt-4`}
            >
              Clear filters
            </button>
          </div>
        ) : (
          <ul className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            {results.map(({ spot, score }) => (
              <li key={spot.id}>
                <SpotCard
                  spot={spot}
                  score={sort === "match" ? score : null}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function ViewButton({
  active,
  onClick,
  label,
  children,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex items-center gap-1.5 border-l border-line-strong px-3 py-1.5 text-sm first:border-l-0 ${
        active
          ? "bg-ink text-white"
          : "bg-surface text-ink-muted hover:bg-canvas"
      }`}
    >
      {children}
      {label}
    </button>
  );
}

function SpotCard({
  spot,
  score,
}: {
  spot: SpotWithSummary;
  score: number | null;
}) {
  const { summary } = spot;

  return (
    <Link
      href={`/study-spots/${spot.id}`}
      className={`${card} group flex h-full flex-col p-5 transition-colors hover:border-line-strong`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="font-semibold text-ink group-hover:text-accent">
            {spot.name}
          </h3>
          {spot.building && (
            <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-muted">
              <MapPin className="size-3.5 shrink-0" aria-hidden />
              <span className="truncate">{spot.building}</span>
            </p>
          )}
        </div>

        {summary.overall !== null && (
          <div className="shrink-0 text-right">
            <p className="text-lg font-semibold leading-none text-ink">
              {formatRating(summary.overall)}
            </p>
            <p className="mt-1 text-xs text-ink-subtle">
              {summary.count} {summary.count === 1 ? "review" : "reviews"}
            </p>
          </div>
        )}
      </div>

      {spot.description && (
        <p className="mt-3 line-clamp-2 text-sm text-ink-muted">
          {spot.description}
        </p>
      )}

      <div className="mt-4 flex-1">
        {summary.averages ? (
          <div className="grid grid-cols-2 gap-x-5 gap-y-2.5">
            {CRITERIA.map((criterion) => (
              <RatingBar
                key={criterion.key}
                label={criterion.label}
                value={summary.averages![criterion.key]}
                compact
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-ink-subtle">No reviews yet</p>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-line pt-3 text-sm">
        {score !== null ? (
          <span className="text-ink-muted">
            <span className="font-medium text-accent">{score}%</span> match
          </span>
        ) : (
          <span />
        )}
        <span className="flex items-center gap-0.5 font-medium text-ink-muted group-hover:text-ink">
          View details
          <ChevronRight className="size-4" aria-hidden />
        </span>
      </div>
    </Link>
  );
}
