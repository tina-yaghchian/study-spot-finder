// Shared class names so buttons and inputs look the same everywhere.

const base =
  "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60";

export const buttonPrimary = `${base} bg-accent px-4 py-2 text-white hover:bg-accent-hover`;

export const buttonSecondary = `${base} border border-line-strong bg-surface px-4 py-2 text-ink hover:bg-canvas`;

export const buttonGhost = `${base} px-3 py-2 text-ink-muted hover:bg-canvas hover:text-ink`;

export const buttonDanger = `${base} border border-line-strong bg-surface px-4 py-2 text-danger hover:bg-danger-soft`;

export const input =
  "w-full rounded-md border border-line-strong bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-subtle focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20";

export const card = "rounded-lg border border-line bg-surface";
