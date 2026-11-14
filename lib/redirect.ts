/**
 * Only allow redirects to paths inside this app, so a crafted
 * ?next= value cannot send someone to another site after signing in.
 */
export function safeRedirectPath(value: string | null | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/";
  }

  if (value.startsWith("/\\")) {
    return "/";
  }

  return value;
}
