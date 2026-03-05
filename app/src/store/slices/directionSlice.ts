// SMTU-TAU/app/src/store/slices/directionSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { calculate } from "@/modules/calculations";

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
  isLoading: boolean;
  error: string | null;
}

export interface CalcResult {
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

const LAFCH_AMPLITUDE = "ЛАФЧХ (амплитуда)";
const LAFCH_PHASE = "ЛАФЧХ (фаза)";
const LAFCH_COMBINED = "ЛАФЧХ";

function cloneSeries(series: GraphData[] | undefined): GraphData[] {
  if (!Array.isArray(series)) return [];

  return series.map((item, index) => ({
    id: item.id ?? index + 1,
    title: item.title ?? "",
    x: Array.isArray(item.x) ? [...item.x] : [],
    y: Array.isArray(item.y) ? [...item.y] : [],
  }));
}

function normalizeLabDefinition(
  lab: LabDefinition,
  existingGraphStorage?: { [graphName: string]: GraphData[] }
): LabDefinition {
  const rawGraphs = Array.isArray(lab.graphs) ? [...lab.graphs] : [];
  const rawStorage = lab.graphStorage || {};
  const rawAxes = { ...(lab.graphAxes || {}) };
  const nonlinearities = lab.nonlinearities ? [...lab.nonlinearities] : undefined;

  const hasAmp =
    rawGraphs.includes(LAFCH_AMPLITUDE) ||
    Object.hasOwn(rawStorage, LAFCH_AMPLITUDE) ||
    Object.hasOwn(rawAxes, LAFCH_AMPLITUDE);
  const hasPhase =
    rawGraphs.includes(LAFCH_PHASE) ||
    Object.hasOwn(rawStorage, LAFCH_PHASE) ||
    Object.hasOwn(rawAxes, LAFCH_PHASE);

  let normalizedGraphs = rawGraphs;
  if (hasAmp && hasPhase) {
    normalizedGraphs = rawGraphs.filter(
      (graph) => graph !== LAFCH_AMPLITUDE && graph !== LAFCH_PHASE
    );
    if (!normalizedGraphs.includes(LAFCH_COMBINED)) {
      normalizedGraphs.push(LAFCH_COMBINED);
    }
  }

  let normalizedActiveGraph = lab.activeGraph;
  if (
    [LAFCH_AMPLITUDE, LAFCH_PHASE].includes(normalizedActiveGraph) &&
    hasAmp &&
    hasPhase
  ) {
    normalizedActiveGraph = LAFCH_COMBINED;
  }
  if (!normalizedGraphs.includes(normalizedActiveGraph)) {
    normalizedActiveGraph = normalizedGraphs[0] || "";
  }

  const storageKeys = new Set<string>([
    ...normalizedGraphs,
    ...Object.keys(rawStorage),
  ]);
  if (hasAmp && hasPhase) {
    storageKeys.add(LAFCH_AMPLITUDE);
    storageKeys.add(LAFCH_PHASE);
  }

  const defaultStorage: { [graphName: string]: GraphData[] } = {};
  storageKeys.forEach((key) => {
    defaultStorage[key] = cloneSeries(rawStorage[key]);
  });

  const normalizedStorage: { [graphName: string]: GraphData[] } = {};
  storageKeys.forEach((key) => {
    normalizedStorage[key] = cloneSeries(
      existingGraphStorage?.[key] ?? defaultStorage[key]
    );
  });

  if (hasAmp && hasPhase && !rawAxes[LAFCH_COMBINED]) {
    rawAxes[LAFCH_COMBINED] = {
      xLabel: "ω, рад/с",
      yLabel: "ДБ + Фаза",
      logX: true,
    };
  }

  let selectedNonlinearity = lab.selectedNonlinearity;
  if (nonlinearities?.length) {
    if (
      !selectedNonlinearity ||
      !nonlinearities.includes(selectedNonlinearity)
    ) {
      selectedNonlinearity = nonlinearities[0];
    }
  }

  return {
    ...lab,
    parameters: lab.parameters.map((param) => ({ ...param })),
    graphs: normalizedGraphs,
    activeGraph: normalizedActiveGraph,
    graphStorage: normalizedStorage,
    graphAxes: rawAxes,
    nonlinearities,
    selectedNonlinearity,
  };
}

function appendCalculationResult(
  lab: LabDefinition,
  directionName: string,
  data: CalcResult
) {
  if (directionName === "ТАУ Нелин") {
    const nl = lab.selectedNonlinearity;
    lab.graphs.forEach((graphName) => {
      if (!lab.graphStorage[graphName]) {
        lab.graphStorage[graphName] = [];
      }
      const nlKey = `${graphName}_${nl}`;
      if (nl && data[nlKey]) {
        const { x, y, desc } = data[nlKey];
        if (Array.isArray(x) && Array.isArray(y)) {
          lab.graphStorage[graphName].push({
            id: lab.graphStorage[graphName].length + 1,
            title: desc || `График для ${nl} (${graphName})`,
            x,
            y,
          });
        }
      }
    });
    return;
  }

  for (const graphName in data) {
    if (!lab.graphStorage[graphName]) {
      lab.graphStorage[graphName] = [];
    }
    if (data[graphName].x && data[graphName].y) {
      const { x, y, desc } = data[graphName];
      if (Array.isArray(x) && Array.isArray(y)) {
        lab.graphStorage[graphName].push({
          id: lab.graphStorage[graphName].length + 1,
          title: desc || `График ${graphName}`,
          x,
          y,
        });
      }
    }
  }
}

export const calculateLab = createAsyncThunk<
  { directionId: number; labId: number; data: CalcResult },
  CalculateLabArgs,
  { rejectValue: string }
>(
  "direction/calculateLab",
  async ({ directionId, labId, bodyParams, nonlinearity }, { rejectWithValue }) => {
    try {
      const data = calculate({
        directionId,
        labId,
        params: bodyParams,
        nonlinearity,
      });

      return { directionId, labId, data };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : String(error)
      );
    }
  }
);

const initialState: DirectionState = {
  activeDirection: "",
  activeLab: null,
  directions: [],
  isLoading: false,
  error: null,
};

export const directionSlice = createSlice({
  name: "direction",
  initialState,
  reducers: {
    setDirections(state, action: PayloadAction<DirectionItem[]>) {
      const existingGraphStorage: {
        [labFull: string]: { [graphName: string]: GraphData[] };
      } = {};

      state.directions.forEach((dir) => {
        dir.labs.forEach((lab) => {
          existingGraphStorage[lab.full] = {};
          Object.keys(lab.graphStorage).forEach((key) => {
            existingGraphStorage[lab.full][key] = cloneSeries(
              lab.graphStorage[key]
            );
          });
        });
      });

      state.directions = action.payload.map((dir) => ({
        id: dir.id,
        name: dir.name,
        labs: dir.labs.map((lab) =>
          normalizeLabDefinition(lab, existingGraphStorage[lab.full])
        ),
      }));

      if (state.directions.length > 0) {
        state.activeDirection = state.directions[0].name;
        if (state.directions[0].labs.length > 0) {
          state.activeLab = state.directions[0].labs[0].full;
        } else {
          state.activeLab = null;
        }
      } else {
        state.activeDirection = "";
        state.activeLab = null;
      }
    },

    setActiveDirection(state, action: PayloadAction<string>) {
      state.activeDirection = action.payload;
      const dir = state.directions.find((d) => d.name === action.payload);
      state.activeLab = dir && dir.labs.length > 0 ? dir.labs[0].full : null;
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
        if (!lab) continue;

        const canUseCombinedLAFCH =
          graph === LAFCH_COMBINED &&
          (lab.graphs.includes(LAFCH_COMBINED) ||
            (lab.graphs.includes(LAFCH_AMPLITUDE) &&
              lab.graphs.includes(LAFCH_PHASE)));

        if (lab.graphs.includes(graph) || canUseCombinedLAFCH) {
          lab.activeGraph = graph;
          break;
        }
      }
    },

    updateLabParameter(
      state,
      action: PayloadAction<{
        labFull: string;
        paramName: string;
        newValue: string;
      }>
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

    addGraph(state, action: PayloadAction<{ labFull: string }>) {
      const { labFull } = action.payload;
      for (const dir of state.directions) {
        const lab = dir.labs.find((l) => l.full === labFull);
        if (!lab) continue;

        const requiredKeys = new Set<string>(lab.graphs);
        if (
          lab.graphAxes?.[LAFCH_AMPLITUDE] &&
          lab.graphAxes?.[LAFCH_PHASE]
        ) {
          requiredKeys.add(LAFCH_AMPLITUDE);
          requiredKeys.add(LAFCH_PHASE);
          requiredKeys.add(LAFCH_COMBINED);
        }

        requiredKeys.forEach((graphName) => {
          if (!lab.graphStorage[graphName]) {
            lab.graphStorage[graphName] = [];
          }
        });
        break;
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

    setNonlinearity(
      state,
      action: PayloadAction<{ labFull: string; nonlinearity: string }>
    ) {
      const { labFull, nonlinearity } = action.payload;
      for (const dir of state.directions) {
        if (dir.name !== "ТАУ Нелин") continue;
        const lab = dir.labs.find((l) => l.full === labFull);
        if (lab && lab.nonlinearities?.includes(nonlinearity)) {
          lab.selectedNonlinearity = nonlinearity;
          break;
        }
      }
    },

    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },

    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },

    // Добавление результатов расчёта в графики (синхронный путь)
    addCalculationResult(
      state,
      action: PayloadAction<{
        directionId: number;
        labId: number;
        data: CalcResult;
      }>
    ) {
      const { directionId, labId, data } = action.payload;
      const dir = state.directions.find((d) => d.id === directionId);
      if (!dir) return;

      const lab = dir.labs.find((l) => l.id === labId);
      if (!lab) return;
      appendCalculationResult(lab, dir.name, data);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(calculateLab.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });

    builder.addCase(calculateLab.fulfilled, (state, action) => {
      state.isLoading = false;
      state.error = null;

      const { directionId, labId, data } = action.payload;
      const dir = state.directions.find((d) => d.id === directionId);
      if (!dir) return;

      const lab = dir.labs.find((l) => l.id === labId);
      if (!lab) return;

      appendCalculationResult(lab, dir.name, data);
    });

    builder.addCase(calculateLab.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload || "Ошибка расчёта";
    });
  },
});

export const {
  setDirections,
  setActiveDirection,
  setActiveLab,
  setActiveGraphForLab,
  updateLabParameter,
  clearGraphs,
  addGraph,
  updateNote,
  setNonlinearity,
  setLoading,
  setError,
  addCalculationResult,
} = directionSlice.actions;

export default directionSlice.reducer;
