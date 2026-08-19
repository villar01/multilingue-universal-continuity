function safeOrigin(location: string) {
  return location.startsWith("/") && !location.startsWith("//") ? location : "/dashboard";
}

export function getABCBookHref(location: string) {
  return `/abc-book?returnTo=${encodeURIComponent(safeOrigin(location))}`;
}
