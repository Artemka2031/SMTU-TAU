import { CalcParams, CalcResult, GraphParams } from "../types";
import { calculateLab1Lin } from "./lab1";
import { calculateLab2Lin } from "./lab2";
import { calculateLab3Lin } from "./lab3";
import { calculateLab4Lin } from "./lab4";

export function calculateTauLin(
  labId: number,
  params: CalcParams,
  graphParams: GraphParams = {}
): CalcResult {
  switch (labId) {
    case 1:
      return calculateLab1Lin(params, graphParams);
    case 2:
      return calculateLab2Lin(params, graphParams);
    case 3:
      return calculateLab3Lin(params, graphParams);
    case 4:
      return calculateLab4Lin(params, graphParams);
    default:
      throw new Error(`Unknown lab ID: ${labId}`);
  }
}
