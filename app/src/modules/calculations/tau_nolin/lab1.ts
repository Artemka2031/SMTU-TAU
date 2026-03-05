import { CalcParams, CalcResult, GraphParams } from "../types";
import {
  getAllowedNonlinearities,
  nonlinearityCurve,
  parseNolinParams,
  resolveNonlinearity,
  runEuler,
} from "./common";

const LAB1_NONLINEARITIES = [
  "2-х позиционное реле",
  "3-х позиционное реле",
  "Усилитель с насыщением",
  "Усилитель с зоной нечувствительности",
  "Усилитель с зоной нечувствительности и ограничением",
  "Реле с зоной нечувствительности и гистерезисом",
  "Реле с гистерезисом",
  "Люфт",
];

export function calculateLab1Nolin(
  params: CalcParams,
  graphParams: GraphParams = {},
  nonlinearity?: string
): CalcResult {
  const p = parseNolinParams(params, {
    delta: 0.2,
    Ts: 0.1,
    Ta: 0.5,
    theta: 0.1,
    phi0: 0,
    mu0: 0,
    z: 1,
    a: 1,
    b: 0,
    c: 0,
    K: 0,
    tMax: 25,
  });
  const names = getAllowedNonlinearities(LAB1_NONLINEARITIES, nonlinearity);
  const result: CalcResult = {};

  for (const name of names) {
    const nlFunc = resolveNonlinearity(name);
    const data = runEuler(p, graphParams, nlFunc, false, 2000);
    const curve = nonlinearityCurve(p, data, name, nlFunc);

    result[`x(t)_${name}`] = {
      x: data.t,
      y: data.xValues,
      desc: `Входное воздействие x(t) для ${name}`,
    };

    result[`Fx(t)_${name}`] = {
      x: data.t,
      y: data.FxValues,
      desc: `Выходное воздействие F(x)(t) для ${name}`,
    };

    result[`nonlinearity_${name}`] = curve;
  }

  return result;
}
