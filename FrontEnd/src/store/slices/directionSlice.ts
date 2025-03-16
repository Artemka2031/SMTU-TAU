import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// ----------------------
// 1. Типы
// ----------------------

/**
 * Параметр: name ("K", "Шаг", "t" и т.д.) + текущее value
 */
export interface ParamItem {
  name: string;
  value: string;
}

/**
 * Набор данных (серия) в одном графике:
 * id: порядковый номер
 * title: "График (ПХ) №1"
 * x, y: точки
 */
interface GraphData {
  id: number;
  title: string;
  x: number[];
  y: number[];
}

/**
 * Настройки для осей и логарифма:
 *  - xLabel, yLabel: подписи осей
 *  - logX: переключатель логарифмической шкалы
 */
interface AxisSettings {
  xLabel: string;
  yLabel: string;
  logX: boolean;
}

/**
 * Лабораторная работа:
 *  - parameters: массив ParamItem (K, t, Шаг, ...)
 *  - graphs: список типов ("ПХ", "АЧХ", ...)
 *  - activeGraph: текущий тип
 *  - graphStorage: для КАЖДОГО типа массив GraphData (несколько построенных серий)
 *  - graphAxes: для КАЖДОГО типа заданы настройки осей (axisLabels)
 *  - note: примечание
 */
export interface LabDefinition {
  short: string;
  full: string;
  parameters: ParamItem[];
  graphs: string[];
  activeGraph: string;
  graphStorage: { [graphName: string]: GraphData[] };
  graphAxes?: { [graphName: string]: AxisSettings };
  note: string;
}

/**
 * Направление: "ТАУ Лин", "ТАУ Нелин", ...
 */
interface DirectionItem {
  name: string;
  labs: LabDefinition[];
}

/**
 * Состояние всего слайса
 */
interface DirectionState {
  activeDirection: string;
  activeLab: string | null;
  directions: DirectionItem[];
}

// ----------------------
// 2. Начальное состояние
// ----------------------

const initialState: DirectionState = {
  activeDirection: "ТАУ Нелин",
  activeLab: null,
  directions: [
    {
      name: "OA",
      labs: []
    },
    {
      name: "ТАУ Лин",
      labs: [
        {
          short: "1 ЛР",
          full: "1 ЛР: Линейные системы, пример",
          parameters: [
            { name: "K", value: "3.0" },
            { name: "Xm", value: "4.0" },
            { name: "T", value: "2.0" },
            { name: "t", value: "25" }
          ],
          graphs: ["ПХ", "АЧХ", "ФЧХ"],
          activeGraph: "ПХ",
          graphStorage: {
            "ПХ": [],
            "АЧХ": [],
            "ФЧХ": []
          },
          // Для примера: настройки осей
          graphAxes: {
            "ПХ": { xLabel: "Время", yLabel: "Амплитуда", logX: false },
            "АЧХ": { xLabel: "Частота, рад/с", yLabel: "Амплитуда", logX: true },
            "ФЧХ": { xLabel: "Частота, рад/с", yLabel: "Фаза, °", logX: true }
          },
          note: "Примечание для 1 ЛР (Лин)"
        },
        {
          short: "2 ЛР",
          full: "2 ЛР: Ещё одна ЛР по линейным системам",
          parameters: [
            { name: "K1", value: "1.0" },
            { name: "K2", value: "1.0" },
            { name: "T1", value: "2.0" },
            { name: "T2", value: "3.0" }
          ],
          graphs: ["ПХ", "АФЧХ", "ЛАФЧХ"],
          activeGraph: "ПХ",
          graphStorage: {
            "ПХ": [],
            "АФЧХ": [],
            "ЛАФЧХ": []
          },
          graphAxes: {
            "ПХ": { xLabel: "Время", yLabel: "Амплитуда", logX: false },
            "АФЧХ": { xLabel: "Re", yLabel: "Im", logX: false },
            "ЛАФЧХ": { xLabel: "Частота, рад/с", yLabel: "дБ", logX: true }
          },
          note: "Примечание для 2 ЛР (Лин)"
        }
      ]
    },
    {
      name: "ТАУ Нелин",
      labs: [
        {
          short: "1 ЛР",
          full: "1 ЛР: Дифференциальные уравнения",
          parameters: [
            { name: "K", value: "3.0" },
            { name: "Xm", value: "4.0" },
            { name: "T", value: "2.0" },
            { name: "Шаг", value: "0.1" },
            { name: "t", value: "25" }
          ],
          graphs: ["ПХ", "АЧХ", "ФЧХ", "АФЧХ", "ЛАФЧХ"],
          activeGraph: "ПХ",
          graphStorage: {
            "ПХ": [],
            "АЧХ": [],
            "ФЧХ": [],
            "АФЧХ": [],
            "ЛАФЧХ": []
          },
          graphAxes: {
            "ПХ": { xLabel: "Время", yLabel: "Амплитуда", logX: false },
            "АЧХ": { xLabel: "Частота, рад/с", yLabel: "Амплитуда", logX: true },
            "ФЧХ": { xLabel: "Частота, рад/с", yLabel: "Фаза, °", logX: true },
            "АФЧХ": { xLabel: "Re", yLabel: "Im", logX: false },
            "ЛАФЧХ": { xLabel: "Частота, рад/с", yLabel: "дБ", logX: true }
          },
          note: "Примечание для 1 ЛР (Нелин)"
        },
        {
          short: "2 ЛР",
          full: "2 ЛР: Аперодические звенья I порядка",
          parameters: [
            { name: "K", value: "3.0" },
            { name: "Xm", value: "4.0" },
            { name: "T", value: "2.0" },
            { name: "Шаг", value: "0.1" },
            { name: "t", value: "25" }
          ],
          graphs: ["ПХ", "АЧХ", "ФЧХ", "АФЧХ", "ЛАФЧХ"],
          activeGraph: "ПХ",
          graphStorage: {
            "ПХ": [],
            "АЧХ": [],
            "ФЧХ": [],
            "АФЧХ": [],
            "ЛАФЧХ": []
          },
          graphAxes: {
            "ПХ": { xLabel: "Время", yLabel: "Амплитуда", logX: false },
            "АЧХ": { xLabel: "Частота, рад/с", yLabel: "Амплитуда", logX: true },
            "ФЧХ": { xLabel: "Частота, рад/с", yLabel: "Фаза, °", logX: true },
            "АФЧХ": { xLabel: "Re", yLabel: "Im", logX: false },
            "ЛАФЧХ": { xLabel: "Частота, рад/с", yLabel: "дБ", logX: true }
          },
          note: "Примечание для 2 ЛР (Нелин)"
        },
        {
          short: "3 ЛР",
          full: "3 ЛР: Аперодические звенья II порядка",
          parameters: [
            { name: "K1", value: "3.0" },
            { name: "K2", value: "2.0" },
            { name: "Xm", value: "4.0" },
            { name: "T1", value: "2.0" },
            { name: "T2", value: "1.0" },
            { name: "t", value: "25" }
          ],
          graphs: ["ПХ", "АЧХ", "ФЧХ", "АФЧХ", "ЛАФЧХ"],
          activeGraph: "ПХ",
          graphStorage: {
            "ПХ": [],
            "АЧХ": [],
            "ФЧХ": [],
            "АФЧХ": [],
            "ЛАФЧХ": []
          },
          graphAxes: {
            "ПХ": { xLabel: "Время", yLabel: "Амплитуда", logX: false },
            "АЧХ": { xLabel: "Частота, рад/с", yLabel: "Амплитуда", logX: true },
            "ФЧХ": { xLabel: "Частота, рад/с", yLabel: "Фаза, °", logX: true },
            "АФЧХ": { xLabel: "Re", yLabel: "Im", logX: false },
            "ЛАФЧХ": { xLabel: "Частота, рад/с", yLabel: "дБ", logX: true }
          },
          note: "Примечание для 3 ЛР (Нелин)"
        },
        {
          short: "4 ЛР",
          full: "4 ЛР: Колебательные звенья",
          parameters: [
            { name: "K", value: "3.0" },
            { name: "Xm", value: "4.0" },
            { name: "T", value: "2.0" },
            { name: "xi", value: "0.5" },
            { name: "t", value: "25" }
          ],
          graphs: ["ПХ", "АЧХ", "ФЧХ", "АФЧХ", "ЛАФЧХ"],
          activeGraph: "ПХ",
          graphStorage: {
            "ПХ": [],
            "АЧХ": [],
            "ФЧХ": [],
            "АФЧХ": [],
            "ЛАФЧХ": []
          },
          graphAxes: {
            "ПХ": { xLabel: "Время", yLabel: "Амплитуда", logX: false },
            "АЧХ": { xLabel: "Частота, рад/с", yLabel: "Амплитуда", logX: true },
            "ФЧХ": { xLabel: "Частота, рад/с", yLabel: "Фаза, °", logX: true },
            "АФЧХ": { xLabel: "Re", yLabel: "Im", logX: false },
            "ЛАФЧХ": { xLabel: "Частота, рад/с", yLabel: "дБ", logX: true }
          },
          note: "Примечание для 4 ЛР (Нелин)"
        },
        {
          short: "5 ЛР",
          full: "5 ЛР: Исследование переходных процессов",
          parameters: [
            { name: "K1", value: "1.0" },
            { name: "K2", value: "1.0" },
            { name: "K3", value: "1.0" },
            { name: "T1", value: "1.0" },
            { name: "T2", value: "1.0" },
            { name: "T3", value: "1.0" }
          ],
          graphs: ["АЧХ", "АФЧХ", "ЛАФЧХ"],
          activeGraph: "АЧХ",
          graphStorage: {
            "АЧХ": [],
            "АФЧХ": [],
            "ЛАФЧХ": []
          },
          graphAxes: {
            "АЧХ": { xLabel: "Частота, рад/с", yLabel: "Амплитуда", logX: true },
            "АФЧХ": { xLabel: "Re", yLabel: "Im", logX: false },
            "ЛАФЧХ": { xLabel: "Частота, рад/с", yLabel: "дБ", logX: true }
          },
          note: "Примечание для 5 ЛР (Нелин)"
        },
        {
          short: "6 ЛР",
          full: "6 ЛР: Замкнутая система управления",
          parameters: [
            { name: "K1", value: "1.0" },
            { name: "K2", value: "1.0" },
            { name: "K3", value: "1.0" },
            { name: "T1", value: "1.0" },
            { name: "T2", value: "1.0" },
            { name: "T3", value: "1.0" }
          ],
          graphs: ["АЧХ", "АФЧХ", "Годограф Михайлова"],
          activeGraph: "АЧХ",
          graphStorage: {
            "АЧХ": [],
            "АФЧХ": [],
            "Годограф Михайлова": []
          },
          graphAxes: {
            "АЧХ": { xLabel: "Частота, рад/с", yLabel: "Амплитуда", logX: true },
            "АФЧХ": { xLabel: "Re", yLabel: "Im", logX: false },
            "Годограф Михайлова": { xLabel: "Re", yLabel: "Im", logX: false }
          },
          note: "Примечание для 6 ЛР (Нелин)"
        }
      ]
    },
    {
      name: "ТДЗ",
      labs: []
    }
  ]
};

// ----------------------
// 3. Слайс directionSlice
// ----------------------

export const directionSlice = createSlice({
  name: "direction",
  initialState,
  reducers: {
    // Переключение направления
    setActiveDirection(state, action: PayloadAction<string>) {
      state.activeDirection = action.payload;
      state.activeLab = null;
    },

    // Переключение ЛР
    setActiveLab(state, action: PayloadAction<string | null>) {
      state.activeLab = action.payload;
    },

    // Переключение активного графика (ПХ, АЧХ и т.д.)
    setActiveGraphForLab(
      state,
      action: PayloadAction<{ labFull: string; graph: string }>
    ) {
      const { labFull, graph } = action.payload;
      for (const dir of state.directions) {
        const lab = dir.labs.find((l) => l.full === labFull);
        if (lab && lab.graphs.includes(graph)) {
          lab.activeGraph = graph;
          break;
        }
      }
    },

    // Пользователь меняет параметр (например, Шаг, K, T...)
    updateLabParameter(
      state,
      action: PayloadAction<{ labFull: string; paramName: string; newValue: string }>
    ) {
      const { labFull, paramName, newValue } = action.payload;
      for (const dir of state.directions) {
        const lab = dir.labs.find((l) => l.full === labFull);
        if (lab) {
          const p = lab.parameters.find((pp) => pp.name === paramName);
          if (p) {
            // Если это "Шаг", делаем clamp до 0.01
            if (paramName === "Шаг") {
              const num = parseFloat(newValue);
              p.value = (num < 0.01 ? 0.01 : num).toString();
            } else {
              p.value = newValue;
            }
          }
          break;
        }
      }
    },

    // Добавляем "график" (серию) во ВСЕ типы, а не только в активный
    // Здесь будет вызов на Flask – пока mock
    addGraph(state, action: PayloadAction<{ labFull: string }>) {
      const { labFull } = action.payload;
      for (const dir of state.directions) {
        const lab = dir.labs.find((l) => l.full === labFull);
        if (!lab) continue;

        // Читаем параметр t, Шаг и т.д.
        const pT = lab.parameters.find((pp) => pp.name === "t");
        const pShag = lab.parameters.find((pp) => pp.name === "Шаг");
        const tVal = pT ? parseFloat(pT.value) : 10;
        const shagVal = pShag ? parseFloat(pShag.value) : 0.1;
        // clamp шаг
        const step = shagVal < 0.01 ? 0.01 : shagVal;

        // Имитируем реальный вызов Flask:
        // const response = await fetch(`http://localhost:5000/api/lab?lab=${lab.short}`, { ... });
        // const data = await response.json();
        // data.[typeGraph].x, data.[typeGraph].y etc.

        // Пока делаем mock – сгенерируем синусы
        lab.graphs.forEach((graphName) => {
          const seriesArr = lab.graphStorage[graphName] || [];
          const newId = seriesArr.length + 1;

          const xVals: number[] = [];
          const yVals: number[] = [];
          for (let x = 0; x <= tVal; x += step) {
            xVals.push(x);
            // Небольшой shift чтобы графики не накладывались
            yVals.push(Math.sin(x) + newId);
          }

          const newGraphData: GraphData = {
            id: newId,
            title: `График (${graphName}) №${newId}`,
            x: xVals,
            y: yVals
          };

          if (!lab.graphStorage[graphName]) {
            lab.graphStorage[graphName] = [];
          }
          lab.graphStorage[graphName].push(newGraphData);
        });

        break;
      }
    },

    // Очистить все серии (GraphData[]) во ВСЕХ типах
    clearGraphs(state, action: PayloadAction<{ labFull: string }>) {
      const { labFull } = action.payload;
      for (const dir of state.directions) {
        const lab = dir.labs.find((l) => l.full === labFull);
        if (lab) {
          Object.keys(lab.graphStorage).forEach((graphName) => {
            lab.graphStorage[graphName] = [];
          });
          break;
        }
      }
    },

    // "Экспорт" – при реальном проекте сделаем вызов на бэкенд
    exportGraphs(state, action: PayloadAction<{ labFull: string }>) {
      // Пока пустой
      console.log("Экспорт (пока заглушка) для", action.payload.labFull);
    },

    // Обновить примечание
    updateNote(state, action: PayloadAction<{ labFull: string; newNote: string }>) {
      const { labFull, newNote } = action.payload;
      for (const dir of state.directions) {
        const lab = dir.labs.find((l) => l.full === labFull);
        if (lab) {
          lab.note = newNote;
          break;
        }
      }
    }
  }
});

// Экспорт экшенов
export const {
  setActiveDirection,
  setActiveLab,
  setActiveGraphForLab,
  updateLabParameter,
  addGraph,
  clearGraphs,
  exportGraphs,
  updateNote
} = directionSlice.actions;
