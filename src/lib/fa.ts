const D = "۰۱۲۳۴۵۶۷۸۹";
export const fa = (n: number | string) => String(n).replace(/\d/g, (d) => D[+d]!);
export const GRADES = [7, 8, 9, 10, 11, 12] as const;
export const TERMS = [1, 2] as const;
export const gradeLabel = (g: number) =>
  ({ 7: "پایهٔ هفتم", 8: "پایهٔ هشتم", 9: "پایهٔ نهم", 10: "پایهٔ دهم", 11: "پایهٔ یازدهم", 12: "پایهٔ دوازدهم" })[g] ?? `پایهٔ ${fa(g)}`;
export const termLabel = (t: number) => (t === 1 ? "نوبت اول" : "نوبت دوم");
export const SKILL_FA: Record<string, string> = {
  grammar: "دستور زبان", vocabulary: "واژگان", spelling: "املا", conversation: "مکالمه",
  reading: "درک مطلب", listening: "شنیداری", writing: "نوشتن", pronunciation: "تلفظ", mixed: "ترکیبی",
};
export const isSenior = (g: number) => g >= 10;
