export { calculateLab1Nolin } from "./lab1";
export { nonlinearities } from "./nonlinearities";

import { CalcParams, CalcResult, GraphParams } from "../types";
import { calculateLab1Nolin } from "./lab1";
import { calculateLab2Nolin } from "./lab2";
import { calculateLab3Nolin } from "./lab3";
import { calculateLab4Nolin } from "./lab4";
import { calculateLab5Nolin } from "./lab5";

export function calculateTauNolin(
  labId: number,
  params: CalcParams,
  graphParams: GraphParams = {},
  nonlinearity?: string
): CalcResult {
  switch (labId) {
    case 1:
      return calculateLab1Nolin(params, graphParams, nonlinearity);
    case 2:
      return calculateLab2Nolin(params, graphParams, nonlinearity);
    case 3:
      return calculateLab3Nolin(params, graphParams, nonlinearity);
    case 4:
      return calculateLab4Nolin(params, graphParams, nonlinearity);
    case 5:
      return calculateLab5Nolin(params, graphParams, nonlinearity);
    default:
      throw new Error(`Unknown lab ID: ${labId}`);
  }
}
