import { CalcParams, CalcResult, GraphParams, linspace } from "../types";

interface Lab5Params {
  mu0: number;
  muDot0: number;
  phi0: number;
  Tr: number;
  Tk: number;
  Ta: number;
  theta: number;
  gamma: number;
  f: number;
  tMax: number;
}

interface State {
  mu: number;
  muDot: number;
  phi: number;
}

function parseParams(params: CalcParams): Lab5Params {
  return {
    mu0: parseFloat(params["μ0"] ?? "0.0"),
    muDot0: parseFloat(params["μ̇0"] ?? "0.0"),
    phi0: parseFloat(params["φ0"] ?? "0.0"),
    Tr: parseFloat(params["Tr"] ?? "1.0"),
    Tk: parseFloat(params["Tk"] ?? "1.0"),
    Ta: parseFloat(params["Ta"] ?? "1.0"),
    theta: parseFloat(params["Θ"] ?? "1.0"),
    gamma: parseFloat(params["γ"] ?? "1.0"),
    f: parseFloat(params["f"] ?? "0.0"),
    tMax: parseFloat(params["t"] ?? "10.0"),
  };
}

function derivatives(s: State, p: Lab5Params): { mu: number; muDot: number; phi: number } {
  const muDDot = (s.phi - p.Tk * s.muDot - p.gamma * s.mu) / (p.Tr * p.Tr);
  const phiDot = (-s.mu - p.f - p.theta * s.phi) / p.Ta;
  return { mu: s.muDot, muDot: muDDot, phi: phiDot };
}

function integrateSystem(
  p: Lab5Params,
  count: number
): { t: number[]; mu: number[]; muDot: number[]; phi: number[]; phiDot: number[] } {
  const t = linspace(0, p.tMax, count);
  const dt = count > 1 ? t[1] - t[0] : p.tMax;

  const mu = new Array<number>(count).fill(0);
  const muDot = new Array<number>(count).fill(0);
  const phi = new Array<number>(count).fill(0);
  const phiDot = new Array<number>(count).fill(0);

  mu[0] = p.mu0;
  muDot[0] = p.muDot0;
  phi[0] = p.phi0;
  phiDot[0] = (-p.mu0 - p.f - p.theta * p.phi0) / p.Ta;

  for (let i = 1; i < count; i++) {
    const current: State = { mu: mu[i - 1], muDot: muDot[i - 1], phi: phi[i - 1] };

    const k1 = derivatives(current, p);
    const k2 = derivatives(
      {
        mu: current.mu + 0.5 * dt * k1.mu,
        muDot: current.muDot + 0.5 * dt * k1.muDot,
        phi: current.phi + 0.5 * dt * k1.phi,
      },
      p
    );
    const k3 = derivatives(
      {
        mu: current.mu + 0.5 * dt * k2.mu,
        muDot: current.muDot + 0.5 * dt * k2.muDot,
        phi: current.phi + 0.5 * dt * k2.phi,
      },
      p
    );
    const k4 = derivatives(
      {
        mu: current.mu + dt * k3.mu,
        muDot: current.muDot + dt * k3.muDot,
        phi: current.phi + dt * k3.phi,
      },
      p
    );

    mu[i] = current.mu + (dt / 6) * (k1.mu + 2 * k2.mu + 2 * k3.mu + k4.mu);
    muDot[i] = current.muDot + (dt / 6) * (k1.muDot + 2 * k2.muDot + 2 * k3.muDot + k4.muDot);
    phi[i] = current.phi + (dt / 6) * (k1.phi + 2 * k2.phi + 2 * k3.phi + k4.phi);
    phiDot[i] = (-mu[i] - p.f - p.theta * phi[i]) / p.Ta;
  }

  return { t, mu, muDot, phi, phiDot };
}

export function calculateLab5(
  params: CalcParams,
  graphParams: GraphParams = {}
): CalcResult {
  const p = parseParams(params);
  const count = graphParams.countOfPoints ?? 2000;
  const { t, mu, muDot, phi, phiDot } = integrateSystem(p, count);
  const epsilon = phi.map((v, idx) => -(1 / p.Ta) * v - mu[idx]);

  return {
    "μ(t)": {
      x: t,
      y: mu,
      desc: `μ(t): Tr=${p.Tr}, Tk=${p.Tk}, Ta=${p.Ta}, Θ=${p.theta}, γ=${p.gamma}, f=${p.f}`,
    },
    "φ(t)": {
      x: t,
      y: phi,
      desc: `φ(t): Tr=${p.Tr}, Tk=${p.Tk}, Ta=${p.Ta}, Θ=${p.theta}, γ=${p.gamma}, f=${p.f}`,
    },
    "ε(t)": {
      x: t,
      y: epsilon,
      desc: "ε(t) = -(1/Ta)·φ(t) - μ(t)",
    },
    "ФП μ": {
      x: mu,
      y: muDot,
      desc: "Фазовый портрет μ̇(μ)",
    },
    "ФП φ": {
      x: phi,
      y: phiDot,
      desc: "Фазовый портрет φ̇(φ)",
    },
  };
}
