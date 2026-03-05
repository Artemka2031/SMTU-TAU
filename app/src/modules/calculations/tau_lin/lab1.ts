// SMTU-TAU/app/src/modules/calculations/tau_lin/lab1.ts
// Лабораторная работа 1: Линейные системы (Дифференцирующее звено с замедлением)

import { CalcParams, CalcResult, GraphParams, linspace, logspace } from "../types";

interface Lab1LinParams {
  K: number;
  Xm: number;
  T: number;
  t: number;
  w: number;
}

function parseParams(params: CalcParams): Lab1LinParams {
  return {
    K: parseFloat(params["K"] || "3.0"),
    Xm: parseFloat(params["Xm"] || "4.0"),
    T: parseFloat(params["T"] || "2.0"),
    t: parseFloat(params["t"] || "25"),
    w: parseFloat(params["w"] || "100"),
  };
}

// Переходная характеристика
function calculatePH(
  K: number,
  Xm: number,
  T: number,
  t: number,
  count: number
): { x: number[]; y: number[] } {
  const time = linspace(0, t, count);
  const response = time.map((ti) => (K * Xm / T) * Math.exp(-ti / T));
  return { x: time, y: response };
}

// Амплитудно-частотная характеристика
function calculateACH(
  K: number,
  T: number,
  count: number,
  wEnd: number
): { x: number[]; y: number[] } {
  const omega = linspace(0.001, wEnd, count);
  const amplitude = omega.map(
    (w) => (K * w) / Math.sqrt(T * T * w * w + 1)
  );
  return { x: omega, y: amplitude };
}

// Фазо-частотная характеристика
function calculateFCH(
  T: number,
  count: number,
  wEnd: number
): { x: number[]; y: number[] } {
  const omega = linspace(0.001, wEnd, count);
  const phase = omega.map((w) => Math.atan(1 / (T * w)));
  return { x: omega, y: phase };
}

// Амплитудно-фазо-частотная характеристика
function calculateAFCH(
  K: number,
  T: number,
  count: number,
  wEnd: number
): { x: number[]; y: number[] } {
  const omega = logspace(Math.log10(0.001), Math.log10(wEnd), count);
  const Re = omega.map((w) => (K * T * T * w * w) / (T * T * w * w + 1));
  const Im = omega.map((w) => (K * w) / (T * T * w * w + 1));
  return { x: Re, y: Im };
}

// Логарифмическая АФЧХc
function calculateLAFCH(
  K: number,
  T: number,
  count: number,
  wEnd: number
): { x: number[]; yMag: number[]; yPhase: number[] } {
  const omega = logspace(Math.log10(0.001), Math.log10(wEnd), count);
  const magnitude = omega.map((w) => {
    const mag = 20 * Math.log10((K * w) / Math.sqrt(1 + Math.pow(T * w, 2)));
    return mag - 20 * Math.log10(K / T); // нормировка
  });
  const phase = omega.map((w) => 90 - (Math.atan(T * w) * 180) / Math.PI);
  return { x: omega, yMag: magnitude, yPhase: phase };
}

export function calculateLab1Lin(
  params: CalcParams,
  graphParams: GraphParams = {}
): CalcResult {
  const p = parseParams(params);
  const countOfDots = graphParams.countOfPoints || 10000;

  const ph = calculatePH(p.K, p.Xm, p.T, p.t, countOfDots);
  const ach = calculateACH(p.K, p.T, countOfDots, p.w);
  const fch = calculateFCH(p.T, countOfDots, p.w);
  const afch = calculateAFCH(p.K, p.T, countOfDots, p.w);
  const lafch = calculateLAFCH(p.K, p.T, countOfDots, p.w);

  return {
    ПХ: { x: ph.x, y: ph.y, desc: `ПХ: K=${p.K}, Xm=${p.Xm}, T=${p.T}` },
    АЧХ: { x: ach.x, y: ach.y, desc: `АЧХ: K=${p.K}, Xm=${p.Xm}, T=${p.T}` },
    ФЧХ: { x: fch.x, y: fch.y, desc: `ФЧХ: T=${p.T}` },
    АФЧХ: { x: afch.x, y: afch.y, desc: `АФЧХ: K=${p.K}, T=${p.T}` },
    "ЛАФЧХ (амплитуда)": {
      x: lafch.x,
      y: lafch.yMag,
      desc: `ЛАФЧХ (амплитуда): K=${p.K}, T=${p.T}`,
    },
    "ЛАФЧХ (фаза)": {
      x: lafch.x,
      y: lafch.yPhase,
      desc: `ЛАФЧХ (фаза): K=${p.K}, T=${p.T}`,
    },
  };
}
