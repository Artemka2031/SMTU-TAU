// SMTU-TAU/app/src/modules/calculations/types.ts
// Общие типы для вычислительных модулей

export interface CalcParams {
  [key: string]: string;
}

export interface GraphResult {
  x: number[];
  y: number[];
  desc: string;
}

export interface CalcResult {
  [graphName: string]: GraphResult;
}

export interface GraphParams {
  countOfPoints?: number;
  wEnd?: number;
}

// Функция для создания массива чисел (аналог numpy.linspace)
export function linspace(start: number, end: number, count: number): number[] {
  if (count <= 1) return [start];
  const step = (end - start) / (count - 1);
  return Array.from({ length: count }, (_, i) => start + i * step);
}

// Функция для создания логарифмического массива (аналог numpy.logspace)
export function logspace(
  startExp: number,
  endExp: number,
  count: number
): number[] {
  const linValues = linspace(startExp, endExp, count);
  return linValues.map((v) => Math.pow(10, v));
}

// Функция для нахождения минимума в массиве
export function min(arr: number[]): number {
  return Math.min(...arr);
}

// Функция для нахождения максимума в массиве
export function max(arr: number[]): number {
  return Math.max(...arr);
}
