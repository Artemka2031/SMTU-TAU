export interface Complex {
  re: number;
  im: number;
}

export function c(re: number, im = 0): Complex {
  return { re, im };
}

export function cAdd(a: Complex, b: Complex): Complex {
  return { re: a.re + b.re, im: a.im + b.im };
}

export function cMul(a: Complex, b: Complex): Complex {
  return {
    re: a.re * b.re - a.im * b.im,
    im: a.re * b.im + a.im * b.re,
  };
}

export function cScale(a: Complex, k: number): Complex {
  return { re: a.re * k, im: a.im * k };
}

export function cDiv(a: Complex, b: Complex): Complex {
  const denom = b.re * b.re + b.im * b.im;
  return {
    re: (a.re * b.re + a.im * b.im) / denom,
    im: (a.im * b.re - a.re * b.im) / denom,
  };
}

export function cAbs(a: Complex): number {
  return Math.hypot(a.re, a.im);
}

export function cPow2(a: Complex): Complex {
  return cMul(a, a);
}

export function cPow3(a: Complex): Complex {
  return cMul(cMul(a, a), a);
}
