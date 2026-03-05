import { CalcParams, CalcResult, GraphParams, linspace, logspace } from "../types";

interface Lab2LinParams {
  K: number;
  Xm: number;
  T: number;
  t: number;
  w: number;
}

function parseParams(params: CalcParams): Lab2LinParams {
  return {
    K: parseFloat(params["K"] ?? "3.0"),
    Xm: parseFloat(params["Xm"] ?? "4.0"),
    T: parseFloat(params["T"] ?? "2.0"),
    t: parseFloat(params["t"] ?? "25"),
    w: parseFloat(params["w"] ?? "100"),
  };
}

function calculatePH(
  K: number,
  T: number,
  Xm: number,
  tMax: number,
  count: number
): { x: number[]; y: number[] } {
  const time = linspace(0, tMax, count);
  const response = time.map((t) => K * Xm * (1 - Math.exp(-t / T)));
  return { x: time, y: response };
}

function calculateACH(
  K: number,
  T: number,
  count: number,
  wEnd: number
): { x: number[]; y: number[] } {
  const omega = linspace(0.001, wEnd, count);
  const amplitude = omega.map((w) => K / Math.sqrt(T * T * w * w + 1));
  return { x: omega, y: amplitude };
}

function calculateFCH(
  T: number,
  count: number,
  wEnd: number
): { x: number[]; y: number[] } {
  const omega = linspace(0.001, wEnd, count);
  const phase = omega.map((w) => -Math.atan(T * w));
  return { x: omega, y: phase };
}

function calculateAFCH(
  K: number,
  T: number,
  count: number,
  wEnd: number
): { x: number[]; y: number[] } {
  const omega = logspace(Math.log10(0.001), Math.log10(wEnd), count);
  const re = omega.map((w) => K / (T * T * w * w + 1));
  const im = omega.map((w) => (-K * w) / (T * T * w * w + 1));
  return { x: re, y: im };
}

function calculateLAFCH(
  K: number,
  T: number,
  count: number,
  wEnd: number
): { x: number[]; magnitude: number[]; phase: number[] } {
  const omega = logspace(Math.log10(0.001), Math.log10(wEnd), count);
  const magnitude = omega.map((w) => 20 * Math.log10(K / Math.sqrt(T * T * w * w + 1)));
  const phase = omega.map((w) => (-Math.atan(T * w) * 180) / Math.PI);
  return { x: omega, magnitude, phase };
}

export function calculateLab2Lin(
  params: CalcParams,
  graphParams: GraphParams = {}
): CalcResult {
  const p = parseParams(params);
  const count = graphParams.countOfPoints ?? 10000;

  const ph = calculatePH(p.K, p.T, p.Xm, p.t, count);
  const ach = calculateACH(p.K, p.T, count, p.w);
  const fch = calculateFCH(p.T, count, p.w);
  const afch = calculateAFCH(p.K, p.T, count, p.w);
  const lafch = calculateLAFCH(p.K, p.T, count, p.w);

  return {
    ПХ: { x: ph.x, y: ph.y, desc: `ПХ: K=${p.K}, T=${p.T}, Xm=${p.Xm}` },
    АЧХ: { x: ach.x, y: ach.y, desc: `АЧХ: K=${p.K}, Xm=${p.Xm}, T=${p.T}` },
    ФЧХ: { x: fch.x, y: fch.y, desc: `ФЧХ: K=${p.K}, Xm=${p.Xm}, T=${p.T}` },
    АФЧХ: { x: afch.x, y: afch.y, desc: `АФЧХ: K=${p.K}, Xm=${p.Xm}, T=${p.T}` },
    "ЛАФЧХ (амплитуда)": {
      x: lafch.x,
      y: lafch.magnitude,
      desc: `ЛАФЧХ (амплитуда): K=${p.K}, Xm=${p.Xm}, T=${p.T}`,
    },
    "ЛАФЧХ (фаза)": {
      x: lafch.x,
      y: lafch.phase,
      desc: `ЛАФЧХ (фаза): K=${p.K}, Xm=${p.Xm}, T=${p.T}`,
    },
  };
}
