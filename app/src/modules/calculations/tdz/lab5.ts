import { CalcParams, CalcResult, GraphParams, logspace } from "../types";
import { c, cAbs, cAdd, cDiv, cMul, cPow2, cPow3, cScale, Complex } from "./complex";

interface Lab5TDZParams {
  K1: number;
  K2: number;
  K3: number;
  T1: number;
  T2: number;
  T3: number;
}

function parseParams(params: CalcParams): Lab5TDZParams {
  return {
    K1: parseFloat(params["K1"] ?? "10.0"),
    K2: parseFloat(params["K2"] ?? "0.5"),
    K3: parseFloat(params["K3"] ?? "3.0"),
    T1: parseFloat(params["T1"] ?? "0.5"),
    T2: parseFloat(params["T2"] ?? "10.0"),
    T3: parseFloat(params["T3"] ?? "2.0"),
  };
}

function response(p: Lab5TDZParams, omega: number[]): Complex[] {
  return omega.map((w) => {
    const jw = c(0, w);
    const numerator = cScale(
      cMul(cAdd(cScale(jw, p.T2), c(1, 0)), cAdd(cScale(jw, p.T3), c(1, 0))),
      p.K1
    );
    const denominator = cAdd(
      cAdd(
        cScale(cPow3(jw), p.T1 * p.T2 * p.T3),
        cScale(cPow2(jw), p.T1 * p.T2 + p.T1 * p.T3 + p.T2 * p.T3)
      ),
      cAdd(cScale(jw, p.T1 + p.T2 + p.T3), c(1 + p.K1 * p.K2 * p.K3, 0))
    );
    return cDiv(numerator, denominator);
  });
}

function mikhailov(p: Lab5TDZParams, omega: number[]): Complex[] {
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

export function calculateLab5TDZ(
  params: CalcParams,
  graphParams: GraphParams = {}
): CalcResult {
  const p = parseParams(params);
  const count = graphParams.countOfPoints ?? 2000;
  const wEnd = graphParams.wEnd ?? parseFloat(params["w"] ?? "100");
  const omega = logspace(Math.log10(0.001), Math.log10(wEnd), count);
  const h = response(p, omega);
  const d = mikhailov(p, omega);

  return {
    АЧХ: {
      x: omega,
      y: h.map(cAbs),
      desc: `АЧХ: K1=${p.K1}, K2=${p.K2}, K3=${p.K3}, T1=${p.T1}, T2=${p.T2}, T3=${p.T3}`,
    },
    АФЧХ: {
      x: h.map((z) => z.re),
      y: h.map((z) => z.im),
      desc: `АФЧХ: K1=${p.K1}, K2=${p.K2}, K3=${p.K3}, T1=${p.T1}, T2=${p.T2}, T3=${p.T3}`,
    },
    "Годограф Михайлова": {
      x: d.map((z) => z.re),
      y: d.map((z) => z.im),
      desc: `Годограф Михайлова: K1=${p.K1}, K2=${p.K2}, K3=${p.K3}, T1=${p.T1}, T2=${p.T2}, T3=${p.T3}`,
    },
  };
}
