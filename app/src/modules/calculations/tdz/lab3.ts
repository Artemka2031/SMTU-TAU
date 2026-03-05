import { CalcParams, CalcResult, GraphParams, linspace, logspace } from "../types";
import { c, cAbs, cAdd, cDiv, cPow2, cPow3, cScale, Complex } from "./complex";

interface Lab3TDZParams {
  K1: number;
  K2: number;
  K3: number;
  T1: number;
  T2: number;
  T3: number;
  w: number;
}

function parseParams(params: CalcParams): Lab3TDZParams {
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

function response(p: Lab3TDZParams, omega: number[]): Complex[] {
  return omega.map((w) => {
    const jw = c(0, w);
    const num = cScale(cAdd(cScale(jw, p.T3), c(1, 0)), p.K1 * p.K2);
    const den = cAdd(
      cAdd(
        cScale(cPow3(jw), p.T1 * p.T2 * p.T3),
        cScale(cPow2(jw), p.T1 * p.T2 + p.T1 * p.T3 + p.T2 * p.T3)
      ),
      cAdd(cScale(jw, p.T1 + p.T2 + p.T3), c(1 + p.K1 * p.K2 * p.K3, 0))
    );
    return cDiv(num, den);
  });
}

function mikhailov(p: Lab3TDZParams, omega: number[]): Complex[] {
  return omega.map((w) => {
    const jw = c(0, w);
    return cAdd(
      cAdd(
        cScale(cPow3(jw), p.T1 * p.T2 * p.T3),
        cScale(cPow2(jw), p.T1 * p.T2 + p.T1 * p.T3 + p.T2 * p.T3)
      ),
      cAdd(cScale(jw, p.T1 + p.T2 + p.T3), c(1 + p.K1 * p.K2 * p.K3, 0))
    );
  });
}

export function calculateLab3TDZ(
  params: CalcParams,
  graphParams: GraphParams = {}
): CalcResult {
  const p = parseParams(params);
  const count = graphParams.countOfPoints ?? 10000;
  const wEnd = graphParams.wEnd ?? p.w;
  const omegaLin = linspace(0.001, wEnd, count);
  const omegaLog = logspace(Math.log10(0.001), Math.log10(wEnd), count);

  const hAch = response(p, omegaLin);
  const hAfch = response(p, omegaLog);
  const dMik = mikhailov(p, omegaLog);

  return {
    АЧХ: {
      x: omegaLin,
      y: hAch.map(cAbs),
      desc: `АЧХ: K1=${p.K1}, K2=${p.K2}, K3=${p.K3}, T1=${p.T1}, T2=${p.T2}, T3=${p.T3}`,
    },
    АФЧХ: {
      x: hAfch.map((z) => z.re),
      y: hAfch.map((z) => z.im),
      desc: `АФЧХ: K1=${p.K1}, K2=${p.K2}, K3=${p.K3}, T1=${p.T1}, T2=${p.T2}, T3=${p.T3}`,
    },
    "Годограф Михайлова": {
      x: dMik.map((z) => z.re),
      y: dMik.map((z) => z.im),
      desc: `Годограф Михайлова: K1=${p.K1}, K2=${p.K2}, K3=${p.K3}, T1=${p.T1}, T2=${p.T2}, T3=${p.T3}`,
    },
  };
}
