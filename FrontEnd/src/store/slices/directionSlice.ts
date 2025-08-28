// SMTU/FrontEnd/src/store/slices/directionSlice.ts
import {createAsyncThunk, createSlice, PayloadAction} from "@reduxjs/toolkit";

export interface ParamItem {
    name: string;
    value: string;
}

export interface GraphData {
    id: number;
    title: string;
    x: number[];
    y: number[];
}

export interface AxisSettings {
    xLabel: string;
    yLabel: string;
    logX: boolean;
}

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
    nonlinearities?: string[];
    selectedNonlinearity?: string;
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
    nonlinearities: string[];
}

interface APIDirection {
    id: number;
    name: string;
    description: string;
    labs: APILab[];
}

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
    nonlinearity?: string;
}

export const calculateLab = createAsyncThunk<
  { directionId: number; labId: number; data: CalcResponse },
  CalculateLabArgs,
  { rejectValue: string }
>(
  "direction/calculateLab",
  async ({ directionId, labId, bodyParams, nonlinearity }, { rejectWithValue }) => {
    try {
      // Берём базовый URL из .env (VITE_API_BASE_URL)
      const baseUrl = import.meta.env.VITE_API_BASE_URL as string;
      const url = `${baseUrl}/directions/${directionId}/labs/${labId}/calculate/`;

      const requestBody = { ...bodyParams };
      if (nonlinearity && directionId === 2) {
        requestBody.nonlinearity = nonlinearity;
      }
      console.log("Отправка запроса calculateLab:", url, requestBody);

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        console.error("HTTP ошибка:", response.status);
        return rejectWithValue(`HTTP ошибка: ${response.status}`);
      }

      const data: CalcResponse = await response.json();
      console.log("Полученные данные calculateLab:", data);

      return { directionId, labId, data };
    } catch (error) {
      console.error("Ошибка запроса calculateLab:", error);
      return rejectWithValue(String(error));
    }
  }
);


const initialState: DirectionState = {
    activeDirection: "",
    activeLab: null,
    directions: [],
};

export const directionSlice = createSlice({
    name: "direction",
    initialState,
    reducers: {
        setActiveDirection(state, action: PayloadAction<string>) {
            console.log("setActiveDirection:", action.payload);
            state.activeDirection = action.payload;
            const dir = state.directions.find(d => d.name === action.payload);
            state.activeLab = dir && dir.labs.length > 0 ? dir.labs[0].full : null;
        },

        setActiveLab(state, action: PayloadAction<string | null>) {
            console.log("setActiveLab:", action.payload);
            state.activeLab = action.payload;
        },

        setActiveGraphForLab(
            state,
            action: PayloadAction<{ labFull: string; graph: string }>
        ) {
            const {labFull, graph} = action.payload;
            console.log("setActiveGraphForLab:", {labFull, graph});
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
            const {labFull, paramName, newValue} = action.payload;
            console.log("updateLabParameter:", {labFull, paramName, newValue});
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
            const {labFull} = action.payload;
            console.log("clearGraphs:", labFull);
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
            const {labFull, newNote} = action.payload;
            console.log("updateNote:", {labFull, newNote});
            for (const dir of state.directions) {
                const lab = dir.labs.find((l) => l.full === labFull);
                if (lab) {
                    lab.note = newNote;
                    break;
                }
            }
        },

        setDirectionsFromAPI(state, action: PayloadAction<APIDirection[]>) {
            console.log("setDirectionsFromAPI: Загрузка направлений");
            const apiDirections = action.payload;
            const existingGraphStorage: { [labFull: string]: { [graphName: string]: GraphData[] } } = {};
            state.directions.forEach((dir) => {
                dir.labs.forEach((lab) => {
                    existingGraphStorage[lab.full] = {...lab.graphStorage};
                });
            });

            state.directions = apiDirections.map((apiDir) => ({
                id: apiDir.id,
                name: apiDir.name,
                labs: apiDir.labs.map((apiLab) => {
                    let graphNames = apiLab.graphs.map((g: APIGraph) => g.name);
                    const hasAmp = graphNames.includes("ЛАФЧХ (амплитуда)");
                    const hasPhase = graphNames.includes("ЛАФЧХ (фаза)");

                    if (hasAmp && hasPhase) {
                        graphNames = graphNames.filter(
                            (n: string) => n !== "ЛАФЧХ (амплитуда)" && n !== "ЛАФЧХ (фаза)"
                        );
                        if (!graphNames.includes("ЛАФЧХ")) {
                            graphNames.push("ЛАФЧХ");
                        }
                    }

                    let activeGraph = apiLab.active_graph;
                    if (
                        ["ЛАФЧХ (амплитуда)", "ЛАФЧХ (фаза)"].includes(activeGraph) &&
                        hasAmp &&
                        hasPhase
                    ) {
                        activeGraph = "ЛАФЧХ";
                    } else if (!graphNames.includes(activeGraph)) {
                        activeGraph = graphNames[0] || "";
                    }

                    const storageEntries = graphNames.map((g: string) => [g, []]);
                    const graphStorageObj = Object.fromEntries(storageEntries);

                    const graphAxesObj: { [key: string]: AxisSettings } = {};
                    apiLab.graphs.forEach((g: APIGraph) => {
                        graphAxesObj[g.name] = {
                            xLabel: g.x_label,
                            yLabel: g.y_label,
                            logX: g.log_x,
                        };
                    });
                    if (hasAmp && hasPhase) {
                        graphAxesObj["ЛАФЧХ"] = {
                            xLabel: "ω, рад/с",
                            yLabel: "ДБ + Фаза",
                            logX: true,
                        };
                    }

                    const restoredGraphStorage = existingGraphStorage[apiLab.full] || graphStorageObj;

                    return {
                        id: apiLab.id,
                        short: apiLab.short,
                        full: apiLab.full,
                        note: apiLab.note,
                        parameters: apiLab.parameters,
                        graphs: graphNames,
                        activeGraph,
                        graphStorage: restoredGraphStorage,
                        graphAxes: graphAxesObj,
                        nonlinearities: apiLab.nonlinearities || [],
                        selectedNonlinearity: apiLab.nonlinearities?.length > 0 ? apiLab.nonlinearities[0] : undefined,
                    };
                }),
            }));

            if (state.directions.length > 0) {
                state.activeDirection = state.directions[0].name;
                if (state.directions[0].labs.length > 0) {
                    state.activeLab = state.directions[0].labs[0].full;
                } else {
                    state.activeLab = null;
                }
            }
            console.log("setDirectionsFromAPI: directions после обновления:", state.directions);
        },

        addGraph(state, action: PayloadAction<{ labFull: string }>) {
            const {labFull} = action.payload;
            console.log("addGraph:", labFull);
            for (const dir of state.directions) {
                const lab = dir.labs.find((l) => l.full === labFull);
                if (lab) {
                    lab.graphs.forEach((graphName) => {
                        if (!lab.graphStorage[graphName]) {
                            lab.graphStorage[graphName] = [];
                        }
                    });
                    break;
                }
            }
        },

        setNonlinearity(
            state,
            action: PayloadAction<{ labFull: string; nonlinearity: string }>
        ) {
            const {labFull, nonlinearity} = action.payload;
            console.log("setNonlinearity:", {labFull, nonlinearity});
            for (const dir of state.directions) {
                if (dir.name !== "ТАУ Нелин") continue;
                const lab = dir.labs.find((l) => l.full === labFull);
                if (lab && lab.nonlinearities?.includes(nonlinearity)) {
                    lab.selectedNonlinearity = nonlinearity;
                    console.log(`Обновление selectedNonlinearity для ${labFull}: ${nonlinearity}`);
                    break;
                } else {
                    console.warn(`Лаборатория с labFull=${labFull} не найдена или нелинейность ${nonlinearity} недоступна`);
                }
            }
        },
    },
    extraReducers: (builder) => {
        builder.addCase(calculateLab.fulfilled, (state, action) => {
            const {directionId, labId, data} = action.payload;
            console.log("calculateLab.fulfilled:", {directionId, labId, data});
            const dir = state.directions.find((d) => d.id === directionId);
            if (!dir) {
                console.warn(`Направление с id ${directionId} не найдено`);
                return;
            }
            const lab = dir.labs.find((l) => l.id === labId);
            if (!lab) {
                console.warn(`Лаборатория с id ${labId} не найдена`);
                return;
            }

            if (dir.name === "ТАУ Нелин") {
                const nl = lab.selectedNonlinearity;
                lab.graphs.forEach((graphName) => {
                    if (!lab.graphStorage[graphName]) {
                        lab.graphStorage[graphName] = [];
                    }
                    const nlKey = `${graphName}_${nl}`;
                    if (nl && data[nlKey]) {
                        const {x, y, desc} = data[nlKey];
                        if (Array.isArray(x) && Array.isArray(y)) {
                            lab.graphStorage[graphName].push({
                                id: lab.graphStorage[graphName].length + 1,
                                title: desc || `График для ${nl} (${graphName})`,
                                x,
                                y,
                            });
                            console.log(`Добавлен нелинейный график для ${nlKey}:`, {x, y, desc});
                        } else {
                            console.warn(`Некорректные данные x или y для ${nlKey}:`, {x, y});
                        }
                    } else {
                        console.warn(`Данные для ${nlKey} отсутствуют в ответе:`, data);
                    }
                });
            } else {
                for (const graphName in data) {
                    if (!lab.graphStorage[graphName]) {
                        lab.graphStorage[graphName] = [];
                    }
                    if (data[graphName].x && data[graphName].y) {
                        const {x, y, desc} = data[graphName];
                        if (Array.isArray(x) && Array.isArray(y)) {
                            lab.graphStorage[graphName].push({
                                id: lab.graphStorage[graphName].length + 1,
                                title: desc || `График ${graphName}`,
                                x,
                                y,
                            });
                            console.log(`Добавлен график ${graphName}:`, {x, y, desc});
                        } else {
                            console.warn(`Некорректные данные x или y для графика ${graphName}:`, {x, y});
                        }
                    }
                }
            }
            console.log(`calculateLab.fulfilled: Обновлен graphStorage для лаборатории ${labId}:`, lab.graphStorage);
        });

        builder.addCase(calculateLab.rejected, (_state, action) => {
            console.error("calculateLab.rejected:", action.payload);
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
    setNonlinearity,
} = directionSlice.actions;

export default directionSlice.reducer;