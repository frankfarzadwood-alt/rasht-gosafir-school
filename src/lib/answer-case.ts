import type { Question } from "./bank";

const capitalizeStart = (text: string) => text.replace(/^([\s"'“‘(]*)([a-z])/, (_, prefix: string, letter: string) => prefix + letter.toUpperCase());

function startsSentence(prefix: string, suffix: string) {
  const stem = prefix.replace(/^\s*(?:Complete (?:the|this) (?:sentence|question|dialogue)|Choose the correct (?:word or phrase|answer|option)):\s*/i, "").trimEnd();
  if (!stem) return Boolean(suffix.trim());
  if (/(?:^|\s)[A-Z]:$/.test(stem)) return true;
  if (/(?:\.{2,}|…)$/.test(stem)) return false;
  if (/\b(?:a\.m\.|p\.m\.|Mr\.|Mrs\.|Ms\.|Dr\.|e\.g\.|i\.e\.|[A-Z]\.)$/i.test(stem)) return false;
  return /[.!?]["”’)]?$/.test(stem);
}

/** Apply sentence case at the answer's insertion point, while keeping its stored value for grading. */
export function learnerAnswerCase(q: Question, text: string): string {
  const prompt = q.prompt_en ?? "";
  if (q.answer.normalization?.case_sensitive || q.native_options ||
    /\b(?:capitali[sz]ation|capital letters?|upper[- ]?case|lower[- ]?case)\b/i.test(prompt)) return text;

  const gaps = [...prompt.matchAll(/_{2,}/g)];
  let label = text.replace(/\bwi-fi\b/g, "Wi-Fi");
  if (gaps.length === 1) {
    const gap = gaps[0]!;
    if (startsSentence(prompt.slice(0, gap.index), prompt.slice(gap.index + gap[0].length))) label = capitalizeStart(label);
  } else if (gaps.length > 1) {
    const parts = label.split(/(;\s*)/);
    if (parts.length === gaps.length * 2 - 1) {
      label = parts.map((part, index) => {
        if (index % 2) return part;
        const gap = gaps[index / 2]!;
        return startsSentence(prompt.slice(0, gap.index), prompt.slice(gap.index + gap[0].length)) ? capitalizeStart(part) : part;
      }).join("");
    }
  } else if (/\?\s*$/.test(prompt) && /^(?:i|you|he|she|it|we|they|there|this|that)(?:\s|['’])/i.test(label) && /[.!?]$/.test(label)) {
    label = capitalizeStart(label);
  }

  if (label === text) return text;
  // Case can itself be the distinction between two offered answers.
  const original = text.toLowerCase();
  return q.options.some(option => option.text !== text && option.text.toLowerCase() === original) ? text : label;
}

/** Use the reviewed answer's casing for tiles with an unambiguous spelling. */
export function sentenceTileLabels(q: Question): string[] {
  const words = /[a-z]+(?:['’][a-z]+)*/gi;
  const spellings = new Map<string, string | null>();
  for (const word of (q.answer.value ?? "").match(words) ?? []) {
    const key = word.toLowerCase();
    if (!spellings.has(key)) spellings.set(key, word);
    else if (spellings.get(key) !== word) spellings.set(key, null);
  }
  return (q.reorder_tokens ?? []).map(tile => tile.replace(words, word => spellings.get(word.toLowerCase()) ?? word));
}
