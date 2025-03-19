import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

/**
 * Параметр: name ("K", "t", ...) и value ("3.0", "25", ...).
 */
export interface ParamItem {
  name: string;
  value: string;
}

/**
 * Набор данных (серия) для графика
 */
export interface GraphData {
  id: number;
  title: string;
  x: number[];
  y: number[];
}

/**
 * Настройки осей: подписи и логарифм.
 */
export interface AxisSettings {
  xLabel: string;
  yLabel: string;
  logX: boolean;
}

/**
 * Лабораторная работа в Redux
 */
export interface LabDefinition {
  id: number;
  short: string;
  full: string;
  note: string;
  parameters: ParamItem[];
  graphs: string[];                        // ["ПХ", "АЧХ", ..., "ЛАФЧХ" (при объединении)]
  activeGraph: string;                     // "ПХ" / "АЧХ" / "ЛАФЧХ" ...
  graphStorage: { [graphName: string]: GraphData[] };
  graphAxes?: { [graphName: string]: AxisSettings };
}

export interface DirectionItem {
  id: number;
  name: string;
  labs: LabDefinition[];
}

export interface DirectionState {
  activeDirection: string;
  activeLab: string | null;
  directions: DirectionItem[];
}

// Типы с API
interface APIGraph {
  name: string;
  x_label: string;
  y_label: string;
  log_x: boolean;
}

interface APILab {
  id: number;
  short: string;
  full: string;
  note: string;
  active_graph: string;
  parameters: ParamItem[];
  graphs: APIGraph[];
}

interface APIDirection {
  id: number;
  name: string;
  description: string;
  labs: APILab[];
}

// ----------------------
// calculateLab thunk
// ----------------------

interface CalcResponse {
  [graphName: string]: {
    x: number[];
    y: number[];
    desc?: string;
  };
}

interface CalculateLabArgs {
  directionId: number;
  labId: number;
  bodyParams: Record<string, string>;
}

export const calculateLab = createAsyncThunk<
  { directionId: number; labId: number; data: CalcResponse },
  CalculateLabArgs,
  { rejectValue: string }
>(
  "direction/calculateLab",
  async ({ directionId, labId, bodyParams }, { rejectWithValue }) => {
    try {
      const url = `http://127.0.0.1:8000/api/directions/${directionId}/labs/${labId}/calculate/`;
      console.log("Отправка запроса:", url, bodyParams);

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyParams),
      });

      if (!response.ok) {
        console.error("HTTP Error:", response.status);
        return rejectWithValue(`HTTP error: ${response.status}`);
      }

      const data: CalcResponse = await response.json();
      console.log("Полученные данные:", data);

      return { directionId, labId, data };
    } catch (error) {
      console.error("Ошибка запроса:", error);
      return rejectWithValue(String(error));
    }
  }
);

// ----------------------
// Начальное состояние
// ----------------------
const initialState: DirectionState = {
  activeDirection: "",
  activeLab: null,
  directions: [],
};

// ----------------------
// directionSlice
// ----------------------

export const directionSlice = createSlice({
  name: "direction",
  initialState,
  reducers: {
    setActiveDirection(state, action: PayloadAction<string>) {
      state.activeDirection = action.payload;
      state.activeLab = null;
    },

    setActiveLab(state, action: PayloadAction<string | null>) {
      state.activeLab = action.payload;
    },

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

    updateNote(
      state,
      action: PayloadAction<{ labFull: string; newNote: string }>
    ) {
      const { labFull, newNote } = action.payload;
      for (const dir of state.directions) {
        const lab = dir.labs.find((l) => l.full === labFull);
        if (lab) {
          lab.note = newNote;
          break;
        }
      }
    },

    /**
     * Обработка данных с API. Здесь мы "объединяем" ЛАФЧХ (амплитуда) и (фаза) в один пункт "ЛАФЧХ".
     */
    setDirectionsFromAPI(state, action: PayloadAction<APIDirection[]>) {
      const apiDirections = action.payload;
      state.directions = apiDirections.map((apiDir) => {
        return {
          id: apiDir.id,
          name: apiDir.name,
          labs: apiDir.labs.map((apiLab) => {
            // 1) Формируем массив названий графиков
            let graphNames = apiLab.graphs.map((g) => g.name);

            // Проверяем, есть ли в списке "ЛАФЧХ (амплитуда)" и "ЛАФЧХ (фаза)"
            const hasAmp = graphNames.includes("ЛАФЧХ (амплитуда)");
            const hasPhase = graphNames.includes("ЛАФЧХ (фаза)");

            // Если да, то убираем их и добавляем "ЛАФЧХ"
            if (hasAmp && hasPhase) {
              graphNames = graphNames.filter(
                (n) => n !== "ЛАФЧХ (амплитуда)" && n !== "ЛАФЧХ (фаза)"
              );
              if (!graphNames.includes("ЛАФЧХ")) {
                graphNames.push("ЛАФЧХ");
              }
            }

            // Проверяем active_graph: если он "ЛАФЧХ (амплитуда)" или "(фаза)",
            // то ставим "ЛАФЧХ"
            let activeGraph = apiLab.active_graph;
            if (
              ["ЛАФЧХ (амплитуда)", "ЛАФЧХ (фаза)"].includes(activeGraph) &&
              hasAmp && hasPhase
            ) {
              activeGraph = "ЛАФЧХ";
            }

            // 2) Инициализируем graphStorage ВСЕГДА под все оригинальные ключи,
            //    чтобы у нас были "ЛАФЧХ (амплитуда)" и "ЛАФЧХ (фаза)" тоже
            //    (когда сервер вернёт данные)
            const storageEntries = apiLab.graphs.map((g) => [g.name, []]);

            // 3) Плюс, если мы добавили "ЛАФЧХ" как объединение,
            //    то тоже инициализируем под ключ "ЛАФЧХ" (на всякий случай).
            if (hasAmp && hasPhase) {
              storageEntries.push(["ЛАФЧХ", []]);
            }

            // Формируем объект для graphStorage
            const graphStorageObj = Object.fromEntries(storageEntries);

            // Аналогично формируем graphAxes
            const graphAxesObj = Object.fromEntries(
              apiLab.graphs.map((g) => [
                g.name,
                {
                  xLabel: g.x_label,
                  yLabel: g.y_label,
                  logX: g.log_x,
                },
              ])
            );
            // Для "ЛАФЧХ" как объединённого графика при желании можно задать особые оси
            if (hasAmp && hasPhase) {
              graphAxesObj["ЛАФЧХ"] = {
                xLabel: "ω, рад/с",
                yLabel: "ДБ + Фаза",
                logX: true,
              };
            }

            // Собираем результат
            return {
              id: apiLab.id,
              short: apiLab.short,
              full: apiLab.full,
              note: apiLab.note,
              parameters: apiLab.parameters,
              graphs: graphNames,        // уже отредактированный список
              activeGraph,               // заменён, если нужно
              graphStorage: graphStorageObj,
              graphAxes: graphAxesObj,
            };
          }),
        };
      });

      // Устанавливаем activeDirection, activeLab по умолчанию
      if (state.directions.length > 0) {
        state.activeDirection = state.directions[0].name;
        if (state.directions[0].labs.length > 0) {
          state.activeLab = state.directions[0].labs[0].full;
        } else {
          state.activeLab = null;
        }
      }
    },

    addGraph(state, action: PayloadAction<{ labFull: string }>) {
      const { labFull } = action.payload;
      for (const dir of state.directions) {
        const lab = dir.labs.find((l) => l.full === labFull);
        if (lab) {
          const { activeGraph } = lab;
          if (!lab.graphStorage[activeGraph]) {
            lab.graphStorage[activeGraph] = [];
          }
          const newId = lab.graphStorage[activeGraph].length + 1;
          lab.graphStorage[activeGraph].push({
            id: newId,
            title: `Graph (${activeGraph}) #${newId}`,
            x: [],
            y: [],
          });
          return;
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(calculateLab.fulfilled, (state, action) => {
      const { directionId, labId, data } = action.payload;
      const dir = state.directions.find((d) => d.id === directionId);
      if (!dir) return;
      const lab = dir.labs.find((l) => l.id === labId);
      if (!lab) return;

      for (const graphName in data) {
        if (!lab.graphStorage[graphName]) {
          lab.graphStorage[graphName] = [];
        }
        const { x, y, desc } = data[graphName];
        const newId = lab.graphStorage[graphName].length + 1;
        lab.graphStorage[graphName].push({
          id: newId,
          title: desc || `Graph (${graphName}) #${newId}`,
          x,
          y,
        });
      }
    });

    builder.addCase(calculateLab.rejected, (_state, action) => {
      console.error("Ошибка при расчёте графиков:", action.payload);
    });
  },
});

export const {
  setActiveDirection,
  setActiveLab,
  setActiveGraphForLab,
  updateLabParameter,
  clearGraphs,
  updateNote,
  setDirectionsFromAPI,
  addGraph,
} = directionSlice.actions;

export default directionSlice.reducer;
