/** Resolve app-owned public files under the host's base path. */
export function publicAssetUrl(path: string): string {
  return path.startsWith("/") && !path.startsWith("//")
    ? `${import.meta.env.BASE_URL}${path.slice(1)}`
    : path;
}
