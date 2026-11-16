import evolveRaw from "@/data/evolve/prompt-fa.units-1-6.json?raw";
import projectRaw from "@/data/project1/prompt-fa.json?raw";

const evolve = JSON.parse(evolveRaw) as Record<string, string>;
const project = JSON.parse(projectRaw) as Record<string, string>;

/** Check the book and unit before looking up text shared by several exercises. */
export function questionPromptFa(id: string, prompt: string | null): string | undefined {
  if (!prompt) return undefined;
  const translations = id.startsWith("project1.") ? project
    : /^evolve1\.(?:wb|quiz|native\.wb)\.u0[1-6]\./.test(id) ? evolve
    : undefined;
  return translations && Object.hasOwn(translations, prompt) ? translations[prompt] : undefined;
}
