import { CalcParams, CalcResult, GraphParams } from "../types";
import { calculateLab1TDZ } from "./lab1";
import { calculateLab2TDZ } from "./lab2";
import { calculateLab3TDZ } from "./lab3";
import { calculateLab4TDZ } from "./lab4";
import { calculateLab5TDZ } from "./lab5";
import { calculateLab6TDZ } from "./lab6";

export function calculateTDZ(
  labId: number,
  params: CalcParams,
  graphParams: GraphParams = {}
): CalcResult {
  switch (labId) {
    case 1:
      return calculateLab1TDZ(params, graphParams);
    case 2:
      return calculateLab2TDZ(params, graphParams);
    case 3:
      return calculateLab3TDZ(params, graphParams);
    case 4:
      return calculateLab4TDZ(params, graphParams);
    case 5:
      return calculateLab5TDZ(params, graphParams);
    case 6:
      return calculateLab6TDZ(params, graphParams);
    default:
      throw new Error(`Unknown TDZ lab ID: ${labId}`);
  }
}
