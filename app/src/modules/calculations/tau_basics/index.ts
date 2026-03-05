import { CalcParams, CalcResult, GraphParams } from "../types";
import { calculateLab1 } from "./lab1";
import { calculateLab2 } from "./lab2";
import { calculateLab3 } from "./lab3";
import { calculateLab4 } from "./lab4";
import { calculateLab5 } from "./lab5";

export function calculateTauBasics(
  labId: number,
  params: CalcParams,
  graphParams: GraphParams = {}
): CalcResult {
  switch (labId) {
    case 1:
      return calculateLab1(params, graphParams);
    case 2:
      return calculateLab2(params, graphParams);
    case 3:
      return calculateLab3(params, graphParams);
    case 4:
      return calculateLab4(params, graphParams);
    case 5:
      return calculateLab5(params, graphParams);
    default:
      throw new Error(`Unknown lab ID: ${labId}`);
  }
}
