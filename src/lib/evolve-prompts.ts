import raw from "@/data/evolve/prompt-fa.json?raw";

const translations = JSON.parse(raw) as Record<string, string>;

/** Look up the exact displayed wording so a future English edit cannot show a stale translation. */
export function evolvePromptFa(id: string, prompt: string | null): string | undefined {
  if (!prompt || !/^evolve[1-3]\./.test(id)) return undefined;
  return Object.hasOwn(translations, prompt) ? translations[prompt] : undefined;
}
