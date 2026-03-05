import { CalcParams, CalcResult, GraphParams, linspace } from "../types";

interface Lab4Params {
  mu0: number;
  muDot0: number;
  phi0: number;
  Tr: number;
  Ta: number;
  Tk: number;
  theta: number;
  f: number;
  tMax: number;
}

function parseParams(params: CalcParams): Lab4Params {
  return {
    mu0: parseFloat(params["μ0"] ?? "0.0"),
    muDot0: parseFloat(params["μ̇0"] ?? "0.0"),
    phi0: parseFloat(params["φ0"] ?? "0.0"),
    Tr: parseFloat(params["Tr"] ?? "1.0"),
    Ta: parseFloat(params["Ta"] ?? "1.0"),
    Tk: parseFloat(params["Tk"] ?? "1.0"),
    theta: parseFloat(params["Θ"] ?? "1.0"),
    f: parseFloat(params["f"] ?? "0.0"),
    tMax: parseFloat(params["t"] ?? "10.0"),
  };
}

function solveMuSeries(
  p: Lab4Params,
  count: number
): { time: number[]; mu: number[]; dMu: number[] } {
  const time = linspace(0, p.tMax, count);
  const a = p.Tr * p.Tr * p.Ta;
  const b = p.Tr * p.Tr * p.theta + p.Tk * p.Ta;
  const c = p.Tk * p.theta;
  const muP = c !== 0 ? p.f / c : 0;

  if (a === 0) {
    const lam = b !== 0 ? -c / b : 0;
    const A = p.mu0 - muP;
    const mu = time.map((t) => A * Math.exp(lam * t) + muP);
    const dMu = time.map((t) => lam * A * Math.exp(lam * t));
    return { time, mu, dMu };
  }

  const D = b * b - 4 * a * c;
  const eps = 1e-12;

  if (D > eps) {
    const sqrtD = Math.sqrt(D);
    const lam1 = (-b + sqrtD) / (2 * a);
    const lam2 = (-b - sqrtD) / (2 * a);
    const rhs1 = p.mu0 - muP;
    const rhs2 = p.muDot0;
    const A = (rhs2 - rhs1 * lam2) / (lam1 - lam2);
    const B = rhs1 - A;
    const mu = time.map((t) => A * Math.exp(lam1 * t) + B * Math.exp(lam2 * t) + muP);
    const dMu = time.map(
      (t) => A * lam1 * Math.exp(lam1 * t) + B * lam2 * Math.exp(lam2 * t)
    );
    return { time, mu, dMu };
  }

  if (Math.abs(D) <= eps) {
    const lam = -b / (2 * a);
    const A = p.mu0 - muP;
    const B = p.muDot0 - lam * A;
    const mu = time.map((t) => (A + B * t) * Math.exp(lam * t) + muP);
    const dMu = time.map(
      (t) => (B + lam * (A + B * t)) * Math.exp(lam * t)
    );
    return { time, mu, dMu };
  }

  const beta = -b / (2 * a);
  const omega = Math.sqrt(-D) / (2 * a);
  const C1 = p.mu0 - muP;
  const C2 = omega !== 0 ? (p.muDot0 - beta * C1) / omega : 0;
  const mu = time.map((t) => {
    const expBt = Math.exp(beta * t);
    return expBt * (C1 * Math.cos(omega * t) + C2 * Math.sin(omega * t)) + muP;
  });
  const dMu = time.map((t) => {
    const expBt = Math.exp(beta * t);
    return expBt * ((-beta * C1 + omega * C2) * Math.cos(omega * t) + (-beta * C2 - omega * C1) * Math.sin(omega * t));
  });
  return { time, mu, dMu };
}

function solvePhiFromMu(
  p: Lab4Params,
  time: number[],
  mu: number[]
): { phi: number[]; dPhi: number[] } {
  if (time.length < 2) {
    return { phi: [p.phi0], dPhi: [0] };
  }

  const dt = time[1] - time[0];
  const phi = new Array<number>(time.length).fill(0);
  phi[0] = p.phi0;
  const invTa = 1 / p.Ta;

  for (let i = 1; i < time.length; i++) {
    const dPhi = invTa * (-mu[i - 1] - p.f - p.theta * phi[i - 1]);
    phi[i] = phi[i - 1] + dt * dPhi;
  }

  const dPhi = phi.map((v, idx) => invTa * (-mu[idx] - p.f - p.theta * v));
  return { phi, dPhi };
}

export function calculateLab4(
  params: CalcParams,
  graphParams: GraphParams = {}
): CalcResult {
  const p = parseParams(params);
  const count = graphParams.countOfPoints ?? 2000;
  const { time, mu, dMu } = solveMuSeries(p, count);
  const { phi, dPhi } = solvePhiFromMu(p, time, mu);
  const epsilon = phi.map((v, idx) => -(1 / p.Ta) * v - mu[idx]);

  return {
    "μ(t)": {
      x: time,
      y: mu,
      desc: `μ(t): μ0=${p.mu0}, μ̇0=${p.muDot0}, Tr=${p.Tr}, Ta=${p.Ta}, Tk=${p.Tk}, Θ=${p.theta}, f=${p.f}`,
    },
    "φ(t)": {
      x: time,
      y: phi,
      desc: `φ(t): φ0=${p.phi0}, Tr=${p.Tr}, Ta=${p.Ta}, Tk=${p.Tk}, Θ=${p.theta}, f=${p.f}`,
    },
    "ε(t)": {
      x: time,
      y: epsilon,
      desc: "ε(t) = -(1/Ta)·φ(t) - μ(t)",
    },
    "ФП μ": {
      x: mu,
      y: dMu,
      desc: "Фазовый портрет dμ/dt(μ)",
    },
    "ФП φ": {
      x: phi,
      y: dPhi,
      desc: "Фазовый портрет dφ/dt(φ)",
    },
  };
}
