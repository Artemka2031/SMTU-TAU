// SMTU-TAU/app/src/modules/calculations/index.ts
// Главный модуль вычислений

export * from "./types";
export { calculateTauBasics } from "./tau_basics";
export { calculateTauLin } from "./tau_lin";
export { calculateTauNolin } from "./tau_nolin";
export { calculateTDZ } from "./tdz";

import { CalcParams, CalcResult, GraphParams } from "./types";
import { calculateTauBasics } from "./tau_basics";
import { calculateTauLin } from "./tau_lin";
import { calculateTauNolin } from "./tau_nolin";
import { calculateTDZ } from "./tdz";

export interface CalculateOptions {
  directionId: number;
  labId: number;
  params: CalcParams;
  graphParams?: GraphParams;
  nonlinearity?: string;
}

export function calculate(options: CalculateOptions): CalcResult {
  const { directionId, labId, params, graphParams = {}, nonlinearity } = options;

  switch (directionId) {
    case 1: // Основы автоматизации
      return calculateTauBasics(labId, params, graphParams);
    case 2: // ТАУ Лин
      return calculateTauLin(labId, params, graphParams);
    case 3: // ТАУ Нелин
      return calculateTauNolin(labId, params, graphParams, nonlinearity);
    case 4: // ТДЗ
      return calculateTDZ(labId, params, graphParams);
    default:
      throw new Error(`Unknown direction ID: ${directionId}`);
  }
}
