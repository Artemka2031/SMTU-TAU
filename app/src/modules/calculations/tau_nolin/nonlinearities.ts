// SMTU-TAU/app/src/modules/calculations/tau_nolin/nonlinearities.ts
// Функции нелинейностей

export type NonlinearityFunc = (
  x: number,
  dxDt: number,
  a: number,
  b: number,
  c: number,
  K: number
) => number;

// 2-х позиционное реле
export function twoPoseRele(x: number, a: number): number {
  return x > 0 ? a : -a;
}

// 3-х позиционное реле
export function threePoseRele(x: number, a: number, b: number): number {
  if (x > b) return a;
  if (Math.abs(x) <= b) return 0;
  if (x < -b) return -a;
  return 0;
}

// Усилитель с насыщением
export function amplifierWithSaturation(
  x: number,
  a: number,
  b: number,
  K: number
): number {
  if (Math.abs(x) <= b) return K * x;
  if (x > b) return a;
  if (x < -b) return -a;
  return 0;
}

// Усилитель с зоной нечувствительности
export function amplifierWithInsensitivity(
  x: number,
  a: number,
  b: number,
  K: number
): number {
  if (x > b) return K * (x - b);
  if (Math.abs(x) <= b) return 0;
  if (x < -b) return K * (x + b);
  return 0;
}

// Усилитель с зоной нечувствительности и ограничением
export function amplifierWithSaturationAndInsensitivity(
  x: number,
  a: number,
  b: number,
  c: number,
  K: number
): number {
  if (x > c) return a;
  if (b < x && x <= c) return K * (x - b);
  if (-b <= x && x <= b) return 0;
  if (-c <= x && x < -b) return K * (x + b);
  if (x < -c) return -a;
  return 0;
}

// Реле с гистерезисом
export function releWithHysteresis(
  x: number,
  dxDt: number,
  a: number,
  b: number
): number {
  if (dxDt > 0) {
    return x > b ? a : -a;
  } else if (dxDt < 0) {
    return x > -b ? a : -a;
  }
  return 0;
}

// Люфт
export function luft(x: number, dxDt: number, K: number, b: number): number {
  if (dxDt > 0) {
    return K * (x - b);
  } else if (dxDt < 0) {
    return K * (x + b);
  }
  return 0;
}

// Реле с зоной нечувствительности и гистерезисом
export function releWithInsensitivityAndHysteresis(
  x: number,
  dxDt: number,
  a: number,
  b: number,
  c: number
): number {
  if (dxDt > 0) {
    if (x > c) return a;
    if (-b <= x && x <= c) return 0;
    if (x < -b) return -a;
  } else if (dxDt < 0) {
    if (x > b) return a;
    if (-c <= x && x <= b) return 0;
    if (x < -c) return -a;
  }
  return 0;
}

// Карта нелинейностей
export const nonlinearities: Record<string, NonlinearityFunc> = {
  "2-х позиционное реле": (x, _dxDt, a) => twoPoseRele(x, a),
  "3-х позиционное реле": (x, _dxDt, a, b) => threePoseRele(x, a, b),
  "Усилитель с насыщением": (x, _dxDt, a, b, _c, K) =>
    amplifierWithSaturation(x, a, b, K),
  "Усилитель с зоной нечувствительности": (x, _dxDt, a, b, _c, K) =>
    amplifierWithInsensitivity(x, a, b, K),
  "Усилитель с зоной нечувствительности и ограничением": (
    x,
    _dxDt,
    a,
    b,
    c,
    K
  ) => amplifierWithSaturationAndInsensitivity(x, a, b, c, K),
  "Реле с зоной нечувствительности и гистерезисом": (x, dxDt, a, b, c) =>
    releWithInsensitivityAndHysteresis(x, dxDt, a, b, c),
  "Реле с гистерезисом": (x, dxDt, a, b) => releWithHysteresis(x, dxDt, a, b),
  "Люфт": (x, dxDt, _a, b, _c, K) => luft(x, dxDt, K, b),
};
