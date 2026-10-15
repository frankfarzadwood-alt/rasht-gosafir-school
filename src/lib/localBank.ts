/**
 * Browser-local store for reviewed ready packs (IndexedDB). Affects only this browser.
 * Approved records are loaded into the shared playable catalogue via setLocalOverlay.
 */
import { ALL_QUESTIONS, CONTEXTS, ID_ALIASES, setLocalOverlay } from "./bank";
import { planPack, type PackPlan, type StoredC, type StoredQ } from "./pack";

const DB = "english-quest-packs";
let dbp: Promise<IDBDatabase> | null = null;
function open(): Promise<IDBDatabase> {
  if (typeof indexedDB === "undefined") return Promise.reject(new Error("IndexedDB unavailable"));
  return (dbp ??= new Promise((res, rej) => {
    const r = indexedDB.open(DB, 1);
    r.onupgradeneeded = () => {
      const db = r.result;
      db.createObjectStore("questions", { keyPath: "id" });
      db.createObjectStore("contexts", { keyPath: "id" });
      db.createObjectStore("imports", { autoIncrement: true });
    };
    r.onsuccess = () => res(r.result);
    r.onerror = () => { dbp = null; rej(r.error); };
  }));
}
const all = <T,>(db: IDBDatabase, store: string) => new Promise<T[]>((res, rej) => {
  const r = db.transaction(store).objectStore(store).getAll();
  r.onsuccess = () => res(r.result as T[]); r.onerror = () => rej(r.error);
});

export async function readLocal() {
  const db = await open();
  const [qs, cs] = await Promise.all([all<StoredQ>(db, "questions"), all<StoredC>(db, "contexts")]);
  return { qs: qs.sort((a, b) => a.seq - b.seq), cs };
}

export async function loadLocalOverlay(): Promise<void> {
  try {
    const { qs, cs } = await readLocal();
    // The bundled reviewed release wins over older local copies of the same ID or an alias of a bundled ID.
    const bundled = new Set(ALL_QUESTIONS.map((q) => q.id));
    const bundledC = new Set(CONTEXTS.map((c) => c.id));
    setLocalOverlay(qs.filter((r) => !bundled.has(r.id) && !ID_ALIASES[r.id]).map((r) => r.q), cs.filter((r) => !bundledC.has(r.id)).map((r) => r.c));
  } catch { /* storage unavailable: bundled pack stays the catalogue */ }
}

export async function dryRunPack(env: unknown): Promise<PackPlan> {
  let qs: StoredQ[] = [], cs: StoredC[] = [];
  try { ({ qs, cs } = await readLocal()); } catch { /* treat as empty */ }
  return planPack(env, new Map(ALL_QUESTIONS.map((q) => [q.id, q])), new Map(CONTEXTS.map((c) => [c.id, c])),
    new Map(qs.map((r) => [r.id, r])), new Map(cs.map((r) => [r.id, r])));
}

/** One atomic transaction: on quota or any failure nothing is written and the existing catalogue stays. */
export async function importPack(env: unknown): Promise<PackPlan> {
  const plan = await dryRunPack(env);
  if (!plan.accept.length) return plan;
  const db = await open();
  const existing = await all<StoredQ>(db, "questions");
  const seqOf = new Map(existing.map((r) => [r.id, r.seq]));
  let next = existing.reduce((m, r) => Math.max(m, r.seq), 0) + 1;
  await new Promise<void>((res, rej) => {
    const tx = db.transaction(["questions", "contexts", "imports"], "readwrite");
    for (const q of plan.accept) tx.objectStore("questions").put({ id: q.id, q, version: plan.version, seq: seqOf.get(q.id) ?? next++ } satisfies StoredQ);
    for (const c of plan.acceptCtx) tx.objectStore("contexts").put({ id: c.id, c, version: plan.version } satisfies StoredC);
    tx.objectStore("imports").add({ at: new Date().toISOString(), version: plan.version, added: plan.newIds.length, updated: plan.updated.length });
    tx.oncomplete = () => res();
    tx.onerror = tx.onabort = () => rej(tx.error ?? new Error("import aborted"));
  });
  await loadLocalOverlay();
  return plan;
}

export async function clearLocalPacks(): Promise<void> {
  const db = await open();
  await new Promise<void>((res, rej) => {
    const tx = db.transaction(["questions", "contexts"], "readwrite");
    tx.objectStore("questions").clear(); tx.objectStore("contexts").clear();
    tx.oncomplete = () => res(); tx.onerror = () => rej(tx.error);
  });
  setLocalOverlay([], []);
}
