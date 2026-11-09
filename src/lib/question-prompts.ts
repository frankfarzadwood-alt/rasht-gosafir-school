import evolveRaw from "@/data/evolve/prompt-fa.json?raw";
import projectRaw from "@/data/project/prompt-fa.json?raw";

const evolve = JSON.parse(evolveRaw) as Record<string, string>;
const project = JSON.parse(projectRaw) as Record<string, string>;

/** Look up the exact displayed wording so a future English edit cannot show a stale translation. */
export function questionPromptFa(id: string, prompt: string | null): string | undefined {
  if (!prompt) return undefined;
  const translations = /^evolve[12]\./.test(id) ? evolve : /^project[12]\./.test(id) ? project : undefined;
  return translations && Object.hasOwn(translations, prompt) ? translations[prompt] : undefined;
}
