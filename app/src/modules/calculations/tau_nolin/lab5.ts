import { CalcParams, CalcResult, GraphParams } from "../types";
import {
  getAllowedNonlinearities,
  nonlinearityCurve,
  parseNolinParams,
  resolveNonlinearity,
  runEuler,
} from "./common";

const LAB5_NONLINEARITIES = [
  "3-х позиционное реле",
  "Усилитель с насыщением",
  "Усилитель с зоной нечувствительности",
  "Усилитель с зоной нечувствительности и ограничением",
  "Реле с зоной нечувствительности и гистерезисом",
];

export function calculateLab5Nolin(
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
    a: 0,
    b: 1,
    c: 0,
    K: 0,
    tMax: 25,
  });
  const names = getAllowedNonlinearities(LAB5_NONLINEARITIES, nonlinearity);
  const result: CalcResult = {};

  for (const name of names) {
    const nlFunc = resolveNonlinearity(name);
    const data = runEuler(p, graphParams, nlFunc, true, 10000);
    const curve = nonlinearityCurve(p, data, name, nlFunc);

    result[`φ(t)_${name}`] = {
      x: data.t,
      y: data.phiValues,
      desc: `Выходной сигнал φ(t) для ${name}`,
    };
    result[`μ(t)_${name}`] = {
      x: data.t,
      y: data.muValues,
      desc: `Выходной сигнал регулятора μ(t) для ${name}`,
    };
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
    result[`x'(x)_${name}`] = {
      x: data.xValues,
      y: data.dxDtValues,
      desc: `Фазовый портрет x'(x) для ${name}`,
    };
    result[`φ'(φ)_${name}`] = {
      x: data.phiValues,
      y: data.dPhiDtValues,
      desc: `Фазовый портрет φ'(φ) для ${name}`,
    };
    result[`nonlinearity_${name}`] = curve;
  }

  return result;
}
