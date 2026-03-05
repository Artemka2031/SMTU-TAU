import { CalcParams, CalcResult, GraphParams, linspace, logspace } from "../types";

interface Lab3LinParams {
  K1: number;
  K2: number;
  Xm: number;
  T1: number;
  T2: number;
  t: number;
  w: number;
}

function parseParams(params: CalcParams): Lab3LinParams {
  return {
    K1: parseFloat(params["K1"] ?? "3.0"),
    K2: parseFloat(params["K2"] ?? "2.0"),
    Xm: parseFloat(params["Xm"] ?? "4.0"),
    T1: parseFloat(params["T1"] ?? "2.0"),
    T2: parseFloat(params["T2"] ?? "1.0"),
    t: parseFloat(params["t"] ?? "25"),
    w: parseFloat(params["w"] ?? "100"),
  };
}

function calculatePH(
  K1: number,
  K2: number,
  Xm: number,
  T1: number,
  T2: number,
  tMax: number,
  count: number
): { x: number[]; y: number[] } {
  const time = linspace(0, tMax, count);
  const response = time.map(
    (t) =>
      K1 *
      K2 *
      Xm *
      (1 -
        (T1 / (T1 - T2)) * Math.exp(-t / T1) +
        (T2 / (T1 - T2)) * Math.exp(-t / T2))
  );
  return { x: time, y: response };
}

function calculateACH(
  K1: number,
  K2: number,
  T1: number,
  T2: number,
  count: number,
  wEnd: number
): { x: number[]; y: number[] } {
  const omega = linspace(0.001, wEnd, count);
  const amplitude = omega.map(
    (w) => (K1 * K2) / Math.sqrt((T1 * T1 * w * w + 1) * (T2 * T2 * w * w + 1))
  );
  return { x: omega, y: amplitude };
}

function calculateFCH(
  T1: number,
  T2: number,
  count: number,
  wEnd: number
): { x: number[]; y: number[] } {
  const omega = linspace(0.001, wEnd, count);
  const phase = omega.map((w) => -(Math.atan(T1 * w) + Math.atan(T2 * w)));
  return { x: omega, y: phase };
}

function calculateAFCH(
  K1: number,
  K2: number,
  T1: number,
  T2: number,
  count: number,
  wEnd: number
): { x: number[]; y: number[] } {
  const omega = logspace(Math.log10(0.001), Math.log10(wEnd), count);
  const re = omega.map((w) => {
    const denom = Math.pow(1 - T1 * T2 * w * w, 2) + Math.pow(T1 + T2, 2) * w * w;
    return (K1 * K2 * (1 - T1 * T2 * w * w)) / denom;
  });
  const im = omega.map((w) => {
    const denom = Math.pow(1 - T1 * T2 * w * w, 2) + Math.pow(T1 + T2, 2) * w * w;
    return (-K1 * K2 * w * (T1 + T2)) / denom;
  });
  return { x: re, y: im };
}

function calculateLAFCH(
  K1: number,
  K2: number,
  T1: number,
  T2: number,
  count: number,
  wEnd: number
): { x: number[]; magnitude: number[]; phase: number[] } {
  const omega = logspace(Math.log10(0.001), Math.log10(wEnd), count);
  const magnitude = omega.map((w) => {
    const denom = Math.sqrt((T1 * T1 * w * w + 1) * (T2 * T2 * w * w + 1));
    return 20 * Math.log10((K1 * K2) / denom);
  });
  const phase = omega.map((w) => (-(Math.atan(T1 * w) + Math.atan(T2 * w)) * 180) / Math.PI);
  return { x: omega, magnitude, phase };
}

export function calculateLab3Lin(
  params: CalcParams,
  graphParams: GraphParams = {}
): CalcResult {
  const p = parseParams(params);
  const count = graphParams.countOfPoints ?? 10000;

  const ph = calculatePH(p.K1, p.K2, p.Xm, p.T1, p.T2, p.t, count);
  const ach = calculateACH(p.K1, p.K2, p.T1, p.T2, count, p.w);
  const fch = calculateFCH(p.T1, p.T2, count, p.w);
  const afch = calculateAFCH(p.K1, p.K2, p.T1, p.T2, count, p.w);
  const lafch = calculateLAFCH(p.K1, p.K2, p.T1, p.T2, count, p.w);

  return {
    ПХ: { x: ph.x, y: ph.y, desc: `ПХ: K1=${p.K1}, K2=${p.K2}, T1=${p.T1}, T2=${p.T2}` },
    АЧХ: { x: ach.x, y: ach.y, desc: `АЧХ: K1=${p.K1}, K2=${p.K2}, T1=${p.T1}, T2=${p.T2}` },
    ФЧХ: { x: fch.x, y: fch.y, desc: `ФЧХ: T1=${p.T1}, T2=${p.T2}` },
    АФЧХ: { x: afch.x, y: afch.y, desc: `АФЧХ: K1=${p.K1}, K2=${p.K2}, T1=${p.T1}, T2=${p.T2}` },
    "ЛАФЧХ (амплитуда)": {
      x: lafch.x,
      y: lafch.magnitude,
      desc: `ЛАФЧХ (амплитуда): K1=${p.K1}, K2=${p.K2}, T1=${p.T1}, T2=${p.T2}`,
    },
    "ЛАФЧХ (фаза)": {
      x: lafch.x,
      y: lafch.phase,
      desc: `ЛАФЧХ (фаза): K1=${p.K1}, K2=${p.K2}, T1=${p.T1}, T2=${p.T2}`,
    },
  };
}
