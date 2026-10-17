export function pageMeta(title: string, description: string) {
  return { meta: [
    { title: `${title} — ماجراجویی انگلیسی` },
    { name: "description", content: description },
    { property: "og:title", content: `${title} — ماجراجویی انگلیسی` },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] };
}