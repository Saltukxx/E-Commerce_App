/** Server-side API base URL — prefers Docker-internal routing over public hairpin. */
export function getServerApiUrl(): string {
  return (
    process.env.API_INTERNAL_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    'http://localhost:3000/api/v1'
  );
}
