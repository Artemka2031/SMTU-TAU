// SMTU-TAU/app/src/modules/calculations/tau_basics/lab1.ts
// Лабораторная работа 1: Основы автоматизации

import {
  CalcParams,
  CalcResult,
  GraphParams,
  linspace,
} from "../types";

interface Lab1Params {
  theta: number; // θ - коэффициент при φ
  Ta: number; // постоянная времени
  phi0: number; // φ0 - начальное значение
  mu: number; // μ - управляющее воздействие
  f: number; // возмущение
  tMax: number; // конец интервала моделирования
}

function parseParams(params: CalcParams): Lab1Params {
  return {
    theta: parseFloat(params["θ"] || "0.1"),
    Ta: parseFloat(params["Ta"] || "1.0"),
    phi0: parseFloat(params["φ0"] || "0.0"),
    mu: parseFloat(params["μ"] || "1.0"),
    f: parseFloat(params["f"] || "0.0"),
    tMax: parseFloat(params["t"] || "10.0"),
  };
}

function integratePhi(
  p: Lab1Params,
  countOfDots: number
): { x: number[]; y: number[] } {
  const time = linspace(0.0, p.tMax, countOfDots);
  const dt = countOfDots > 1 ? time[1] - time[0] : p.tMax;

  const phiValues: number[] = new Array(countOfDots);
  let phi = p.phi0;

  for (let i = 0; i < countOfDots; i++) {
    phiValues[i] = phi;
    const dPhiDt = -(p.theta / p.Ta) * phi + (1.0 / p.Ta) * p.mu - (1.0 / p.Ta) * p.f;
    phi = phi + dt * dPhiDt;
  }

  return { x: time, y: phiValues };
}

export function calculateLab1(
  params: CalcParams,
  graphParams: GraphParams = {}
): CalcResult {
  const p = parseParams(params);
  const countOfDots = graphParams.countOfPoints || 2000;

  const { x, y } = integratePhi(p, countOfDots);

  return {
    "φ(t)": {
      x,
      y,
      desc: `φ(t): θ=${p.theta}, Ta=${p.Ta}, φ0=${p.phi0}, μ=${p.mu}, f=${p.f}`,
    },
  };
}
