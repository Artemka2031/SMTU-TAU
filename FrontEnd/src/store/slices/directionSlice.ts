import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// ----------------------
// 1. Типы
// ----------------------

/**
 * Параметр с названием, значением и, возможно, минимум/максимум или описанием.
 * В вашем PyQt-коде есть "K", "Xm" и т.д. со значениями по умолчанию.
 * Здесь мы храним { name: "K", value: "3.0" } и т.д.
 */
export interface ParamItem {
  name: string;    // "K"
  value: string;   // "3.0"
}

/**
 * Описание набора данных (series) в графике.
 * Например, можно хранить массив точек, но для упрощения - только id и описание.
 */
interface GraphData {
  id: number;
  description: string; // "Graph #1", ...
}

/**
 * Описание одной лабораторной работы в Redux:
 *  - short, full          : краткое и полное название.
 *  - parameters           : массив ParamItem, чтобы хранить текущее значение для каждого параметра.
 *  - graphs               : список доступных типов графиков (ПХ, АЧХ...).
 *  - activeGraph          : какой график сейчас выбран.
 *  - graphStorage         : для КАЖДОГО типа графика массив построенных GraphData (результат "Добавить график").
 *  - graphLog             : лог действий (добавление, экспорт, очистка).
 *  - note                 : текстовое поле «Примечание для данной ЛР».
 */
export interface LabDefinition {
  short: string;
  full: string;
  parameters: ParamItem[];
  graphs: string[];
  activeGraph: string;
  graphStorage: { [graphName: string]: GraphData[] };
  graphLog: string[];
  note: string;
}

/**
 * Направление: "ТАУ Нелин", "ТАУ Лин" и т.д., каждая содержит массив ЛР.
 */
interface DirectionItem {
  name: string;
  labs: LabDefinition[];
}

/**
 * Полное состояние для слайса direction.
 */
interface DirectionState {
  activeDirection: string;        // "ТАУ Нелин"
  activeLab: string | null;       // полное название ЛР
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
          // Параметры (с дефолтными значениями)
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
          graphLog: [],
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
          graphLog: [],
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
          graphLog: [],
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
          graphLog: [],
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
          graphLog: [],
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
          graphLog: [],
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
          graphLog: [],
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
          graphLog: [],
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
    // Смена направления
    setActiveDirection(state, action: PayloadAction<string>) {
      state.activeDirection = action.payload;
      state.activeLab = null;
    },

    // Смена активной ЛР
    setActiveLab(state, action: PayloadAction<string | null>) {
      state.activeLab = action.payload;
    },

    // Сменить активный график в выбранной ЛР
    setActiveGraphForLab(
      state,
      action: PayloadAction<{ labFull: string; graph: string }>
    ) {
      const { labFull, graph } = action.payload;
      for (const dir of state.directions) {
        const lab = dir.labs.find((l) => l.full === labFull);
        if (lab) {
          lab.activeGraph = graph;
          break;
        }
      }
    },

    // Изменить значение параметра (например, пользователь ввёл K=5.0)
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
            p.value = newValue; // Обновляем значение
          }
          break;
        }
      }
    },

    // Добавить "построенный" график в activeGraph
    addGraph(state, action: PayloadAction<{ labFull: string }>) {
      const { labFull } = action.payload;
      for (const dir of state.directions) {
        const lab = dir.labs.find((l) => l.full === labFull);
        if (lab && lab.activeGraph) {
          const gName = lab.activeGraph;
          // создаем массив, если нет
          if (!lab.graphStorage[gName]) {
            lab.graphStorage[gName] = [];
          }
          const newId = lab.graphStorage[gName].length + 1;
          lab.graphStorage[gName].push({
            id: newId,
            description: `Graph #${newId} (для ${gName})`
          });
          // Добавляем запись в лог
          lab.graphLog.push(`Добавлен график #${newId} для [${gName}]`);
          break;
        }
      }
    },

    // Очистить все графики у выбранной ЛР
    clearGraphs(state, action: PayloadAction<{ labFull: string }>) {
      const { labFull } = action.payload;
      for (const dir of state.directions) {
        const lab = dir.labs.find((l) => l.full === labFull);
        if (lab) {
          // чистим все графы
          for (const g of Object.keys(lab.graphStorage)) {
            lab.graphStorage[g] = [];
          }
          lab.graphLog.push("Все графики очищены");
          break;
        }
      }
    },

    // "Экспорт" – добавляем запись в log
    exportGraphs(state, action: PayloadAction<{ labFull: string }>) {
      const { labFull } = action.payload;
      for (const dir of state.directions) {
        const lab = dir.labs.find((l) => l.full === labFull);
        if (lab) {
          lab.graphLog.push("Экспорт выполнен");
          break;
        }
      }
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
    },
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
