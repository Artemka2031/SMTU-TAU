import { CalcParams, GraphParams, linspace, max, min } from "../types";
import { nonlinearities, NonlinearityFunc } from "./nonlinearities";

export interface NolinParams {
  delta: number;
  Ts: number;
  Ta: number;
  theta: number;
  phi0: number;
  mu0: number;
  z: number;
  a: number;
  b: number;
  c: number;
  K: number;
  tMax: number;
}

export interface EulerData {
  t: number[];
  phiValues: number[];
  muValues: number[];
  xValues: number[];
  FxValues: number[];
  dxDtValues: number[];
  dPhiDtValues: number[];
}

export const HYSTERESIS_TYPES = new Set<string>([
  "Реле с гистерезисом",
  "Люфт",
  "Реле с зоной нечувствительности и гистерезисом",
]);

export function parseNolinParams(
  params: CalcParams,
  defaults: Partial<NolinParams> = {}
): NolinParams {
  return {
    delta: parseFloat(params["δ"] ?? String(defaults.delta ?? 0.2)),
    Ts: parseFloat(params["Ts"] ?? String(defaults.Ts ?? 0.1)),
    Ta: parseFloat(params["Ta"] ?? String(defaults.Ta ?? 0.5)),
    theta: parseFloat(params["θ"] ?? String(defaults.theta ?? 0.1)),
    phi0: parseFloat(params["φ0"] ?? String(defaults.phi0 ?? 0.0)),
    mu0: parseFloat(params["μ0"] ?? String(defaults.mu0 ?? 0.0)),
    z: parseFloat(params["z"] ?? String(defaults.z ?? 1)),
    a: parseFloat(params["a"] ?? String(defaults.a ?? 1)),
    b: parseFloat(params["b"] ?? String(defaults.b ?? 0)),
    c: parseFloat(params["c"] ?? String(defaults.c ?? 0)),
    K: parseFloat(params["K"] ?? String(defaults.K ?? 0)),
    tMax: parseFloat(params["t"] ?? String(defaults.tMax ?? 25)),
  };
}

export function getAllowedNonlinearities(
  names: string[],
  selected?: string
): string[] {
  if (selected) {
    if (!names.includes(selected)) {
      throw new Error(`Unknown nonlinearity: ${selected}`);
    }
    return [selected];
  }
  return names;
}

export function resolveNonlinearity(name: string): NonlinearityFunc {
  const fn = nonlinearities[name];
  if (!fn) {
    throw new Error(`Unknown nonlinearity mapping: ${name}`);
  }
  return fn;
}

export function runEuler(
  p: NolinParams,
  graphParams: GraphParams,
  nlFunc: NonlinearityFunc,
  sanitize: boolean,
  defaultCount = 2000
): EulerData {
  const count = graphParams.countOfPoints ?? defaultCount;
  const dt = p.tMax / count;
  const t = linspace(0, p.tMax - dt, count);

  let phi = p.phi0;
  let mu = p.mu0;

  const phiValues = new Array<number>(count);
  const muValues = new Array<number>(count);
  const xValues = new Array<number>(count);
  const FxValues = new Array<number>(count).fill(0);
  const dxDtValues = new Array<number>(count).fill(0);
  const dPhiDtValues = new Array<number>(count).fill(0);

  for (let i = 0; i < count; i++) {
    phiValues[i] = phi;
    muValues[i] = mu;
    const x = phi - p.delta * mu;
    xValues[i] = x;

    const dPhiDt = (1 / p.Ta) * (p.z - p.theta * phi - mu);
    dPhiDtValues[i] = dPhiDt;

    let dMuDt = i > 0 ? FxValues[i - 1] / p.Ts : 0;
    const dxDt = dPhiDt - p.delta * dMuDt;
    FxValues[i] = nlFunc(x, dxDt, p.a, p.b, p.c, p.K);
    dMuDt = FxValues[i] / p.Ts;
    dxDtValues[i] = dPhiDt - p.delta * dMuDt;

    phi += dt * dPhiDt;
    mu += dt * dMuDt;

    if (sanitize) {
      if (!Number.isFinite(phi)) phi = 0;
      if (!Number.isFinite(mu)) mu = 0;
    }
  }

  return { t, phiValues, muValues, xValues, FxValues, dxDtValues, dPhiDtValues };
}

export function nonlinearityCurve(
  p: NolinParams,
  data: EulerData,
  nlName: string,
  nlFunc: NonlinearityFunc
): { x: number[]; y: number[]; desc: string } {
  const xMin = min(data.xValues) - 1;
  const xMax = max(data.xValues) + 1;

  if (HYSTERESIS_TYPES.has(nlName)) {
    const xPos = linspace(xMin, xMax, 500);
    const yPos = xPos.map((x) => nlFunc(x, 1.0, p.a, p.b, p.c, p.K));
    const xNeg = linspace(xMax, xMin, 500);
    const yNeg = xNeg.map((x) => nlFunc(x, -1.0, p.a, p.b, p.c, p.K));
    return {
      x: [...xPos, ...xNeg],
      y: [...yPos, ...yNeg],
      desc: `Характеристика нелинейности F(x) для ${nlName} (гистерезис)`,
    };
  }

  const xRange = linspace(xMin, xMax, 1000);
  const yRange = xRange.map((x) => nlFunc(x, 0, p.a, p.b, p.c, p.K));
  return {
    x: xRange,
    y: yRange,
    desc: `Характеристика нелинейности F(x) для ${nlName}`,
  };
}
