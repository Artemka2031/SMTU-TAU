import { CalcParams, CalcResult, GraphParams, linspace, logspace } from "../types";

interface Lab1TDZParams {
  K1: number;
  K2: number;
  K3: number;
  T1: number;
  T2: number;
  T3: number;
  w: number;
}

function parseParams(params: CalcParams): Lab1TDZParams {
  return {
    K1: parseFloat(params["K1"] ?? "1.0"),
    K2: parseFloat(params["K2"] ?? "1.0"),
    K3: parseFloat(params["K3"] ?? "1.0"),
    T1: parseFloat(params["T1"] ?? "1.0"),
    T2: parseFloat(params["T2"] ?? "1.0"),
    T3: parseFloat(params["T3"] ?? "1.0"),
    w: parseFloat(params["w"] ?? "100"),
  };
}

function calculateACH(
  p: Lab1TDZParams,
  count: number
): { x: number[]; y: number[] } {
  const omega = linspace(0.001, p.w, count);
  const y = omega.map((w) => {
    const denom = Math.sqrt(
      (1 + p.T1 * p.T1 * w * w) * (1 + p.T2 * p.T2 * w * w) * (1 + p.T3 * p.T3 * w * w)
    );
    return (p.K1 * p.K2 * p.K3) / denom;
  });
  return { x: omega, y };
}

function calculateAFCH(
  p: Lab1TDZParams,
  count: number
): { x: number[]; y: number[] } {
  const omega = logspace(Math.log10(0.001), Math.log10(p.w), count);
  const re = omega.map((w) => {
    const denom =
      (1 + p.T1 * p.T1 * w * w) * (1 + p.T2 * p.T2 * w * w) * (1 + p.T3 * p.T3 * w * w);
    return (p.K1 * p.K2 * p.K3 * (1 - w * w * p.T1 * p.T2 - w * w * p.T2 * p.T3 - w * w * p.T1 * p.T3)) / denom;
  });
  const im = omega.map((w) => {
    const denom =
      (1 + p.T1 * p.T1 * w * w) * (1 + p.T2 * p.T2 * w * w) * (1 + p.T3 * p.T3 * w * w);
    return (
      (p.K1 *
        p.K2 *
        p.K3 *
        (w * w * p.T1 * p.T2 * p.T3 - w * p.T1 - w * p.T2 - w * p.T3)) /
      denom
    );
  });
  return { x: re, y: im };
}

function calculateLAFCH(
  p: Lab1TDZParams,
  count: number
): { x: number[]; magnitude: number[]; phase: number[] } {
  const omega = logspace(Math.log10(0.001), Math.log10(p.w), count);
  const magnitude = omega.map((w) => {
    const denom = Math.sqrt(
      (1 + p.T1 * p.T1 * w * w) * (1 + p.T2 * p.T2 * w * w) * (1 + p.T3 * p.T3 * w * w)
    );
    return 20 * Math.log10((p.K1 * p.K2 * p.K3) / denom);
  });
  const phase = omega.map(
    (w) =>
      (-(Math.atan(p.T1 * w) + Math.atan(p.T2 * w) + Math.atan(p.T3 * w)) * 180) /
      Math.PI
  );
  return { x: omega, magnitude, phase };
}

export function calculateLab1TDZ(
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
      desc: `АЧХ: K1=${p.K1}, K2=${p.K2}, K3=${p.K3}, T1=${p.T1}, T2=${p.T2}, T3=${p.T3}`,
    },
    АФЧХ: {
      x: afch.x,
      y: afch.y,
      desc: `АФЧХ: K1=${p.K1}, K2=${p.K2}, K3=${p.K3}, T1=${p.T1}, T2=${p.T2}, T3=${p.T3}`,
    },
    "ЛАФЧХ (амплитуда)": {
      x: lafch.x,
      y: lafch.magnitude,
      desc: `ЛАФЧХ (амплитуда): K1=${p.K1}, K2=${p.K2}, K3=${p.K3}, T1=${p.T1}, T2=${p.T2}, T3=${p.T3}`,
    },
    "ЛАФЧХ (фаза)": {
      x: lafch.x,
      y: lafch.phase,
      desc: `ЛАФЧХ (фаза): K1=${p.K1}, K2=${p.K2}, K3=${p.K3}, T1=${p.T1}, T2=${p.T2}, T3=${p.T3}`,
    },
  };
}
