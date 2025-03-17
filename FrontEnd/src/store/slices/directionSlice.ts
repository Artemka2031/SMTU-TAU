import {createSlice, createAsyncThunk, PayloadAction} from "@reduxjs/toolkit";

/**
 * Параметр: name ("K", "t", ...) и value ("3.0", "25", ...).
 */
export interface ParamItem {
    name: string;
    value: string;
}

/**
 * Набор данных (серия) для графика:
 *  - id: порядковый номер
 *  - title: например, "График (ПХ) №1"
 *  - x, y: массивы точек
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
 * Описание одной лабораторной работы в Redux:
 *  - id: ID из бэкенда
 *  - short, full: краткое и полное название
 *  - note: примечание
 *  - parameters: список ParamItem
 *  - graphs: список имен графиков
 *  - activeGraph: текущее имя графика
 *  - graphStorage: для каждого типа (ПХ, АЧХ...) массив GraphData
 *  - graphAxes: настройки осей
 */
export interface LabDefinition {
    id: number;
    short: string;
    full: string;
    note: string;
    parameters: ParamItem[];
    graphs: string[];
    activeGraph: string;
    graphStorage: { [graphName: string]: GraphData[] };
    graphAxes?: { [graphName: string]: AxisSettings };
}

/**
 * Описание направления (ТАУ Лин, ТАУ Нелин...).
 */
export interface DirectionItem {
    id: number;
    name: string;
    labs: LabDefinition[];
}

/**
 * Глобальное состояние.
 */
export interface DirectionState {
    activeDirection: string;      // текущее название направления
    activeLab: string | null;     // текущее полное название ЛР (или null)
    directions: DirectionItem[];  // список всех направлений
}

// ----------------------
// Типы, приходящие с API
// ----------------------

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

/**
 * Ответ calculate:
 * Сервер возвращает структуру вроде:
 * {
 *   "Переходная характеристика": { "x": [...], "y": [...], "desc": "..." },
 *   "АЧХ": { "x": [...], "y": [...], "desc": "..." },
 *   ...
 * }
 */
interface CalcResponse {
    [graphName: string]: {
        x: number[];
        y: number[];
        desc?: string;
    };
}

// ----------------------
// Начальное состояние
// ----------------------
const initialState: DirectionState = {
    activeDirection: "",
    activeLab: null,
    directions: []
};

// ----------------------
// 1. Асинхронный thunk: calculateLab
// ----------------------

/**
 * Аргументы для запроса:
 * directionId, labId: ID направления и ЛР из бэкенда,
 * bodyParams: параметры (K, T, Xm, ...) для расчёта
 */
interface CalculateLabArgs {
    directionId: number;
    labId: number;
    bodyParams: Record<string, string>; // {"K":"3.5","t":"25","count_of_points":"600", ...}
}

/**
 * POST /api/directions/{directionId}/labs/{labId}/calculate/
 * Возвращает CalcResponse
 */
export const calculateLab = createAsyncThunk<
  // Fulfilled
  { directionId: number; labId: number; data: CalcResponse },
  // Args
  CalculateLabArgs,
  // ThunkApiConfig (не обязательно, если не нужно rejectValue)
  { rejectValue: string }
>(
  "direction/calculateLab",
  async ({ directionId, labId, bodyParams }, { rejectWithValue }) => {
    try {
      const url = `http://127.0.0.1:8000/api/directions/${directionId}/labs/${labId}/calculate/`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyParams)
      });
      if (!response.ok) {
        return rejectWithValue(`HTTP error: ${response.status}`);
      }
      const data: CalcResponse = await response.json();
      return { directionId, labId, data };
    } catch (error) {
      return rejectWithValue(String(error));
    }
  }
);


// ----------------------
// 2. Слайс directionSlice
// ----------------------

export const directionSlice = createSlice({
    name: "direction",
    initialState,
    reducers: {
        // Устанавливает активное направление
        setActiveDirection(state, action: PayloadAction<string>) {
            state.activeDirection = action.payload;
            state.activeLab = null;
        },

        // Устанавливает активную ЛР (по full)
        setActiveLab(state, action: PayloadAction<string | null>) {
            state.activeLab = action.payload;
        },

        // Переключение активного графика
        setActiveGraphForLab(
            state,
            action: PayloadAction<{ labFull: string; graph: string }>
        ) {
            const {labFull, graph} = action.payload;
            for (const dir of state.directions) {
                const lab = dir.labs.find((l) => l.full === labFull);
                if (lab && lab.graphs.includes(graph)) {
                    lab.activeGraph = graph;
                    break;
                }
            }
        },

        // Обновление параметров (K, t, Шаг, ...)
        updateLabParameter(
            state,
            action: PayloadAction<{ labFull: string; paramName: string; newValue: string }>
        ) {
            const {labFull, paramName, newValue} = action.payload;
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

        // Очищает все серии графиков (во всех типах) для выбранной ЛР
        clearGraphs(state, action: PayloadAction<{ labFull: string }>) {
            const {labFull} = action.payload;
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

        // Обновляет note
        updateNote(state, action: PayloadAction<{ labFull: string; newNote: string }>) {
            const {labFull, newNote} = action.payload;
            for (const dir of state.directions) {
                const lab = dir.labs.find((l) => l.full === labFull);
                if (lab) {
                    lab.note = newNote;
                    break;
                }
            }
        },

        // Инициализация направлений (списка) из API
        setDirectionsFromAPI(state, action: PayloadAction<APIDirection[]>) {
            const apiDirections = action.payload;
            state.directions = apiDirections.map((apiDir) => ({
                id: apiDir.id,
                name: apiDir.name,
                labs: apiDir.labs.map((apiLab) => ({
                    id: apiLab.id,
                    short: apiLab.short,
                    full: apiLab.full,
                    note: apiLab.note,
                    parameters: apiLab.parameters,
                    graphs: apiLab.graphs.map((g) => g.name),
                    activeGraph: apiLab.active_graph,
                    // Инициализируем пустое хранилище
                    graphStorage: Object.fromEntries(
                        apiLab.graphs.map((g) => [g.name, []])
                    ),
                    // Преобразуем массив graphs => объект { [graphName]: AxisSettings }
                    graphAxes: Object.fromEntries(
                        apiLab.graphs.map((g) => [
                            g.name,
                            {
                                xLabel: g.x_label,
                                yLabel: g.y_label,
                                logX: g.log_x
                            }
                        ])
                    )
                }))
            }));

            // Устанавливаем activeDirection и activeLab по умолчанию
            if (state.directions.length > 0) {
                state.activeDirection = state.directions[0].name;
                if (state.directions[0].labs.length > 0) {
                    state.activeLab = state.directions[0].labs[0].full;
                } else {
                    state.activeLab = null;
                }
            }
        }
    },

    // ----------------------
    // 3. extraReducers для calculateLab
    // ----------------------
    extraReducers: (builder) => {
  builder.addCase(calculateLab.fulfilled, (state, action) => {
    const { directionId, labId, data } = action.payload;
    // Ищем нужное направление
    const dir = state.directions.find((d) => d.id === directionId);
    if (!dir) return;
    // Ищем лабораторную по labId
    const lab = dir.labs.find((l) => l.id === labId);
    if (!lab) return;
    // data[graphName] = { x: [...], y: [...], desc: "..." }
    for (const graphName in data) {
      if (!lab.graphStorage[graphName]) {
        lab.graphStorage[graphName] = [];
      }
      const newId = lab.graphStorage[graphName].length + 1;
      const { x, y, desc } = data[graphName];
      lab.graphStorage[graphName].push({
        id: newId,
        title: desc || `График (${graphName}) №${newId}`,
        x,
        y
      });
    }
  });

  builder.addCase(calculateLab.rejected, (_state, action) => {
    console.error("Ошибка при расчёте графиков:", action.payload);
  });
}

});

// Экспортируем экшены
export const {
    setActiveDirection,
    setActiveLab,
    setActiveGraphForLab,
    updateLabParameter,
    clearGraphs,
    updateNote,
    setDirectionsFromAPI
} = directionSlice.actions;

// Экспортируем сам редьюсер
export default directionSlice.reducer;
