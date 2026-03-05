import { CalcParams, CalcResult, GraphParams, linspace } from "../types";

interface Lab3Params {
  mu0: number;
  muDot0: number;
  phi0: number;
  Tr: number;
  Tk: number;
  gamma: number;
  tMax: number;
}

function parseParams(params: CalcParams): Lab3Params {
  return {
    mu0: parseFloat(params["μ0"] ?? "0.0"),
    muDot0: parseFloat(params["μ̇0"] ?? "0.0"),
    phi0: parseFloat(params["φ0"] ?? "0.0"),
    Tr: parseFloat(params["Tr"] ?? "1.0"),
    Tk: parseFloat(params["Tk"] ?? "1.0"),
    gamma: parseFloat(params["γ"] ?? "1.0"),
    tMax: parseFloat(params["t"] ?? "10.0"),
  };
}

function solveRealRoots(
  p: Lab3Params,
  time: number[]
): { mu: number[]; dMu: number[] } {
  const D = p.Tk * p.Tk - 4 * p.Tr * p.Tr * p.gamma;
  const sqrtD = Math.sqrt(Math.max(0, D));
  const denom = 2 * p.Tr * p.Tr;
  const lam1 = (-p.Tk + sqrtD) / denom;
  const lam2 = (-p.Tk - sqrtD) / denom;
  const c = p.gamma !== 0 ? p.phi0 / p.gamma : 0;

  if (Math.abs(lam1 - lam2) < 1e-12) {
    const lam = lam1;
    const A = p.mu0 - c;
    const B = p.muDot0 - lam * A;
    const mu = time.map((t) => (A + B * t) * Math.exp(lam * t) + c);
    const dMu = time.map(
      (t) => (B + lam * (A + B * t)) * Math.exp(lam * t)
    );
    return { mu, dMu };
  }

  const rhs1 = p.mu0 - c;
  const rhs2 = p.muDot0;
  const A = (rhs2 - rhs1 * lam2) / (lam1 - lam2);
  const B = rhs1 - A;

  const mu = time.map((t) => A * Math.exp(lam1 * t) + B * Math.exp(lam2 * t) + c);
  const dMu = time.map(
    (t) => A * lam1 * Math.exp(lam1 * t) + B * lam2 * Math.exp(lam2 * t)
  );
  return { mu, dMu };
}

function solveComplexRoots(
  p: Lab3Params,
  time: number[]
): { mu: number[]; dMu: number[] } {
  const beta = -p.Tk / (2 * p.Tr * p.Tr);
  const omega =
    Math.sqrt(4 * p.Tr * p.Tr * p.gamma - p.Tk * p.Tk) / (2 * p.Tr * p.Tr);
  const c = p.gamma !== 0 ? p.phi0 / p.gamma : 0;
  const C1 = p.mu0 + c;
  const C2 = omega !== 0 ? (p.muDot0 - beta * p.mu0 - beta * c) / omega : 0;

  const mu = time.map((t) => {
    const expBt = Math.exp(beta * t);
    return expBt * (C1 * Math.cos(omega * t) + C2 * Math.sin(omega * t)) + c;
  });

  const dMu = time.map((t) => {
    const expBt = Math.exp(beta * t);
    const cosWt = Math.cos(omega * t);
    const sinWt = Math.sin(omega * t);
    return expBt * ((-beta * C1 + omega * C2) * cosWt + (-beta * C2 - omega * C1) * sinWt);
  });

  return { mu, dMu };
}

function calcMuAndDerivative(
  p: Lab3Params,
  count: number
): { time: number[]; mu: number[]; dMu: number[] } {
  const time = linspace(0, p.tMax, count);
  const D = p.Tk * p.Tk - 4 * p.Tr * p.Tr * p.gamma;
  const series = D >= 0 ? solveRealRoots(p, time) : solveComplexRoots(p, time);
  return { time, mu: series.mu, dMu: series.dMu };
}

export function calculateLab3(
  params: CalcParams,
  graphParams: GraphParams = {}
): CalcResult {
  const p = parseParams(params);
  const count = graphParams.countOfPoints ?? 2000;
  const { time, mu, dMu } = calcMuAndDerivative(p, count);

  return {
    "μ(t)": {
      x: time,
      y: mu,
      desc: `μ(t): μ0=${p.mu0}, μ̇0=${p.muDot0}, φ0=${p.phi0}, Tr=${p.Tr}, Tk=${p.Tk}, γ=${p.gamma}`,
    },
    "dμ/dt": {
      x: time,
      y: dMu,
      desc: `dμ/dt: μ0=${p.mu0}, μ̇0=${p.muDot0}, φ0=${p.phi0}, Tr=${p.Tr}, Tk=${p.Tk}, γ=${p.gamma}`,
    },
    ФП: {
      x: mu,
      y: dMu,
      desc: "Фазовый портрет dμ/dt(μ)",
    },
  };
}
