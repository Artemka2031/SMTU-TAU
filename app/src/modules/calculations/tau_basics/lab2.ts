import { CalcParams, CalcResult, GraphParams, linspace } from "../types";

interface Lab2Params {
  mu0: number;
  muDot0: number;
  phi0: number;
  Tr: number;
  Tk: number;
  tMax: number;
}

function parseParams(params: CalcParams): Lab2Params {
  return {
    mu0: parseFloat(params["μ0"] ?? "0.0"),
    muDot0: parseFloat(params["μ̇0"] ?? "0.0"),
    phi0: parseFloat(params["φ0"] ?? "0.0"),
    Tr: parseFloat(params["Tr"] ?? "1.0"),
    Tk: parseFloat(params["Tk"] ?? "1.0"),
    tMax: parseFloat(params["t"] ?? "10.0"),
  };
}

function calcMuSeries(
  p: Lab2Params,
  count: number
): { time: number[]; mu: number[]; dMu: number[] } {
  const time = linspace(0, p.tMax, count);
  const a = p.Tk / (p.Tr * p.Tr);
  const coef = (p.Tr * p.Tr) / p.Tk;

  const mu = time.map(
    (t) =>
      p.mu0 +
      coef * (p.muDot0 + p.phi0 / p.Tk) * (1 - Math.exp(-a * t)) +
      (p.phi0 / p.Tk) * t
  );
  const dMu = time.map(
    (t) => (p.muDot0 + p.phi0 / p.Tk) * Math.exp(-a * t) + p.phi0 / p.Tk
  );

  return { time, mu, dMu };
}

export function calculateLab2(
  params: CalcParams,
  graphParams: GraphParams = {}
): CalcResult {
  const p = parseParams(params);
  const count = graphParams.countOfPoints ?? 2000;
  const { time, mu, dMu } = calcMuSeries(p, count);

  return {
    "μ(t)": {
      x: time,
      y: mu,
      desc: `μ(t): μ0=${p.mu0}, μ̇0=${p.muDot0}, φ0=${p.phi0}, Tr=${p.Tr}, Tk=${p.Tk}`,
    },
    "dμ/dt": {
      x: time,
      y: dMu,
      desc: `dμ/dt: μ0=${p.mu0}, μ̇0=${p.muDot0}, φ0=${p.phi0}, Tr=${p.Tr}, Tk=${p.Tk}`,
    },
  };
}
