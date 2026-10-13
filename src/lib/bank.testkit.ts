export * from "./bank";
export const GRADES_CHECK: [number, number][] = [7, 8, 9, 10, 11, 12].flatMap((g) => [[g, 1], [g, 2]] as [number, number][]);
