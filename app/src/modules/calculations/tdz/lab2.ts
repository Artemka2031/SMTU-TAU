import { CalcParams, CalcResult, GraphParams, linspace, logspace } from "../types";

interface Lab2TDZParams {
  K1: number;
  K2: number;
  T1: number;
  T2: number;
  xi: number;
  w: number;
}

function parseParams(params: CalcParams): Lab2TDZParams {
  return {
    K1: parseFloat(params["K1"] ?? "10.0"),
    K2: parseFloat(params["K2"] ?? "0.5"),
    T1: parseFloat(params["T1"] ?? "0.5"),
    T2: parseFloat(params["T2"] ?? "10.0"),
    xi: parseFloat(params["xi"] ?? "0.5"),
    w: parseFloat(params["w"] ?? "100"),
  };
}

function calculateACH(p: Lab2TDZParams, count: number): { x: number[]; y: number[] } {
  const omega = linspace(0.001, p.w, count);
  const y = omega.map((w) => {
    const denom = Math.sqrt(
      (1 + p.T1 * p.T1 * w * w) *
        (Math.pow(1 - p.T2 * p.T2 * w * w, 2) + Math.pow(2 * p.xi * p.T2 * w, 2))
    );
    return (p.K1 * p.K2) / denom;
  });
  return { x: omega, y };
}

function calculateAFCH(p: Lab2TDZParams, count: number): { x: number[]; y: number[] } {
  const omega = logspace(Math.log10(0.001), Math.log10(p.w), count);
  const re = omega.map((w) => {
    const denom =
      (1 + p.T1 * p.T1 * w * w) *
      (Math.pow(1 - p.T2 * p.T2 * w * w, 2) + Math.pow(2 * p.xi * p.T2 * w, 2));
    return (p.K1 * p.K2 * (1 - p.T2 * p.T2 * w * w - p.xi * p.T1 * p.T2 * w * w)) / denom;
  });
  const im = omega.map((w) => {
    const denom =
      (1 + p.T1 * p.T1 * w * w) *
      (Math.pow(1 - p.T2 * p.T2 * w * w, 2) + Math.pow(2 * p.xi * p.T2 * w, 2));
    return (p.K1 * p.K2 * (p.T1 * p.T2 * p.T2 * Math.pow(w, 3) - 2 * p.xi * p.T2 * w - p.T1 * w)) / denom;
  });
  return { x: re, y: im };
}

function calculateLAFCH(
  p: Lab2TDZParams,
  count: number
): { x: number[]; magnitude: number[]; phase: number[] } {
  const omega = logspace(Math.log10(0.001), Math.log10(p.w), count);
  const magnitude = omega.map((w) => {
    const denom = Math.sqrt(
      (1 + p.T1 * p.T1 * w * w) *
        (Math.pow(1 - p.T2 * p.T2 * w * w, 2) + Math.pow(2 * p.xi * p.T2 * w, 2))
    );
    return 20 * Math.log10((p.K1 * p.K2) / denom);
  });
  const phase = omega.map(
    (w) =>
      (-(Math.atan(p.T1 * w) + Math.atan2(2 * p.xi * p.T2 * w, 1 - p.T2 * p.T2 * w * w)) *
        180) /
      Math.PI
  );
  return { x: omega, magnitude, phase };
}

export function calculateLab2TDZ(
  params: CalcParams,
  graphParams: GraphParams = {}
): CalcResult {
  const p = parseParams(params);
  const count = graphParams.countOfPoints ?? 10000;
  const ach = calculateACH(p, count);
  const afch = calculateAFCH(p, count);
  const lafch = calculateLAFCH(p, count);

  return {
    АЧХ: {
      x: ach.x,
      y: ach.y,
      desc: `АЧХ: K1=${p.K1}, K2=${p.K2}, T1=${p.T1}, T2=${p.T2}, xi=${p.xi}`,
    },
    АФЧХ: {
      x: afch.x,
      y: afch.y,
      desc: `АФЧХ: K1=${p.K1}, K2=${p.K2}, T1=${p.T1}, T2=${p.T2}, xi=${p.xi}`,
    },
    "ЛАФЧХ (амплитуда)": {
      x: lafch.x,
      y: lafch.magnitude,
      desc: `ЛАФЧХ (амплитуда): K1=${p.K1}, K2=${p.K2}, T1=${p.T1}, T2=${p.T2}, xi=${p.xi}`,
    },
    "ЛАФЧХ (фаза)": {
      x: lafch.x,
      y: lafch.phase,
      desc: `ЛАФЧХ (фаза): K1=${p.K1}, K2=${p.K2}, T1=${p.T1}, T2=${p.T2}, xi=${p.xi}`,
    },
  };
}
