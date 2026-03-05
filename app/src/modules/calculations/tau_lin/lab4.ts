import { CalcParams, CalcResult, GraphParams, linspace, logspace } from "../types";

interface Lab4LinParams {
  K: number;
  Xm: number;
  T: number;
  xi: number;
  t: number;
  w: number;
}

function parseParams(params: CalcParams): Lab4LinParams {
  return {
    K: parseFloat(params["K"] ?? "3.0"),
    Xm: parseFloat(params["Xm"] ?? "4.0"),
    T: parseFloat(params["T"] ?? "2.0"),
    xi: parseFloat(params["xi"] ?? "0.5"),
    t: parseFloat(params["t"] ?? "35"),
    w: parseFloat(params["w"] ?? "100"),
  };
}

function calculatePH(
  K: number,
  Xm: number,
  T: number,
  xi: number,
  tMax: number,
  count: number
): { x: number[]; y: number[] } {
  const time = linspace(0, tMax, count);
  const wn = Math.sqrt(1 - xi * xi) / T;
  const response = time.map(
    (t) =>
      K *
      Xm *
      (1 -
        Math.exp((-xi * t) / T) *
          (Math.cos(wn * t) + (xi / Math.sqrt(1 - xi * xi)) * Math.sin(wn * t)))
  );
  return { x: time, y: response };
}

function calculateACH(
  K: number,
  T: number,
  xi: number,
  count: number,
  wEnd: number
): { x: number[]; y: number[] } {
  const omega = linspace(0.001, wEnd, count);
  const amplitude = omega.map((w) => {
    const denom = Math.sqrt(Math.pow(1 - T * T * w * w, 2) + Math.pow(2 * xi * T * w, 2));
    return K / denom;
  });
  return { x: omega, y: amplitude };
}

function calculateFCH(
  T: number,
  xi: number,
  count: number,
  wEnd: number
): { x: number[]; y: number[] } {
  const omega = linspace(0.001, wEnd, count);
  const phase = omega.map((w) => -Math.atan2(2 * xi * T * w, 1 - T * T * w * w));
  return { x: omega, y: phase };
}

function calculateAFCH(
  K: number,
  T: number,
  xi: number,
  count: number,
  wEnd: number
): { x: number[]; y: number[] } {
  const omega = logspace(Math.log10(0.001), Math.log10(wEnd), count);
  const re = omega.map((w) => {
    const denom = Math.pow(1 - T * T * w * w, 2) + Math.pow(2 * xi * T * w, 2);
    return (K * (1 - T * T * w * w)) / denom;
  });
  const im = omega.map((w) => {
    const denom = Math.pow(1 - T * T * w * w, 2) + Math.pow(2 * xi * T * w, 2);
    return (-K * (2 * xi * T * w)) / denom;
  });
  return { x: re, y: im };
}

function calculateLAFCH(
  K: number,
  T: number,
  xi: number,
  count: number,
  wEnd: number
): { x: number[]; magnitude: number[]; phase: number[] } {
  const omega = logspace(Math.log10(0.001), Math.log10(wEnd), count);
  const magnitude = omega.map((w) => {
    const denom = Math.sqrt(Math.pow(1 - T * T * w * w, 2) + Math.pow(2 * xi * T * w, 2));
    return 20 * Math.log10(K / denom);
  });
  const phase = omega.map(
    (w) => (-Math.atan2(2 * xi * T * w, 1 - T * T * w * w) * 180) / Math.PI
  );
  return { x: omega, magnitude, phase };
}

export function calculateLab4Lin(
  params: CalcParams,
  graphParams: GraphParams = {}
): CalcResult {
  const p = parseParams(params);
  const count = graphParams.countOfPoints ?? 10000;

  const ph = calculatePH(p.K, p.Xm, p.T, p.xi, p.t, count);
  const ach = calculateACH(p.K, p.T, p.xi, count, p.w);
  const fch = calculateFCH(p.T, p.xi, count, p.w);
  const afch = calculateAFCH(p.K, p.T, p.xi, count, p.w);
  const lafch = calculateLAFCH(p.K, p.T, p.xi, count, p.w);

  return {
    ПХ: { x: ph.x, y: ph.y, desc: `ПХ: K=${p.K}, T=${p.T}, ξ=${p.xi}` },
    АЧХ: { x: ach.x, y: ach.y, desc: `АЧХ: K=${p.K}, T=${p.T}, ξ=${p.xi}` },
    ФЧХ: { x: fch.x, y: fch.y, desc: `ФЧХ: T=${p.T}, ξ=${p.xi}` },
    АФЧХ: { x: afch.x, y: afch.y, desc: `АФЧХ: K=${p.K}, T=${p.T}, ξ=${p.xi}` },
    "ЛАФЧХ (амплитуда)": {
      x: lafch.x,
      y: lafch.magnitude,
      desc: `ЛАФЧХ (амплитуда): K=${p.K}, T=${p.T}, ξ=${p.xi}`,
    },
    "ЛАФЧХ (фаза)": {
      x: lafch.x,
      y: lafch.phase,
      desc: `ЛАФЧХ (фаза): K=${p.K}, T=${p.T}, ξ=${p.xi}`,
    },
  };
}
