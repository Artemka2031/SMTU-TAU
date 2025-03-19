import React from "react";
// @ts-ignore
import Plot from "react-plotly.js";

/**
 * Данные для одной серии (GraphData)
 */
interface GraphData {
  id: number;
  title: string;
  x: number[];
  y: number[];
}

/**
 * Настройки осей (AxisSettings).
 */
interface AxisSettings {
  xLabel: string;
  yLabel: string;
  logX: boolean;
}

interface PlotlyGraphProps {
  /** Имя активного графика. Например: "ПХ", "АЧХ", "ЛАФЧХ", "ЛАФЧХ (амплитуда)", etc. */
  graphName: string;

  /**
   * Массив серий для *текущего* выбранного графика, если это обычный график.
   * Например: graphStorage["ПХ"] --> [{id, title, x, y}, ...].
   */
  dataSeries: GraphData[];

  /**
   * Если нужно комбинировать "ЛАФЧХ (амплитуда)" и "ЛАФЧХ (фаза)",
   * то можете передать их сюда. Если undefined, рисуем обычный график.
   */
  lafchAmplitude?: GraphData[]; // graphStorage["ЛАФЧХ (амплитуда)"]
  lafchPhase?: GraphData[];     // graphStorage["ЛАФЧХ (фаза)"]

  /**
   * Настройки осей для обычного графика (если не ЛАФЧХ).
   */
  axisSettings: AxisSettings;
}

/**
 * Универсальный компонент: либо рисует "обычный" график,
 * либо, если графName === "ЛАФЧХ", объединяет "ЛАФЧХ (амплитуда)" и "ЛАФЧХ (фаза)" в один график.
 */
const PlotlyGraph: React.FC<PlotlyGraphProps> = ({
  graphName,
  dataSeries,
  lafchAmplitude,
  lafchPhase,
  axisSettings
}) => {
  // -----------------------------------------------------------
  // 1. Если НЕ "ЛАФЧХ", рисуем "обычный" график
  // -----------------------------------------------------------
  if (graphName !== "ЛАФЧХ") {
    // Формируем простой набор трейсов
    const traces = dataSeries.map((series) => ({
      x: series.x,
      y: series.y,
      mode: "lines",
      name: series.title,
      line: { width: 4 }
    }));

    // Логарифм X
    const xType = axisSettings.logX ? "log" : "linear";

    const layout = {
      title: `Активный график: ${graphName}`,
      xaxis: {
        title: axisSettings.xLabel,
        type: xType,
        titlefont: { size: 16, family: "Arial" },
        tickfont: { size: 14 }
      },
      yaxis: {
        title: axisSettings.yLabel,
        titlefont: { size: 16, family: "Arial" },
        tickfont: { size: 14 }
      },
      font: { family: "Arial", size: 14 },
      legend: {
        font: { size: 14 },
        orientation: "h",
        x: 0,
        y: -0.2
      },
      autosize: true
    };

    return (
      <Plot
        data={traces}
        layout={layout}
        config={{ responsive: true, displaylogo: false }}
        style={{ width: "100%", height: "100%" }}
      />
    );
  }

  // -----------------------------------------------------------
  // 2. Если выбрана "ЛАФЧХ": объединяем "ЛАФЧХ (амплитуда)" и "ЛАФЧХ (фаза)"
  //    в один график с двумя осями
  // -----------------------------------------------------------
  const amplitudeData = lafchAmplitude || [];
  const phaseData = lafchPhase || [];

  // Трейсы для амплитуды (левая ось)
  const amplitudeTraces = amplitudeData.map((series, idx) => ({
    x: series.x,
    y: series.y,
    mode: "lines",
    name: series.title || `Ампл #${idx + 1}`,
    line: { width: 3 },
    yaxis: "y" // левая ось
  }));

  // Трейсы для фазы (правая ось)
  const phaseTraces = phaseData.map((series, idx) => ({
    x: series.x,
    y: series.y,
    mode: "lines",
    name: series.title || `Фаза #${idx + 1}`,
    line: { width: 3, dash: "dash" },
    yaxis: "y2"
  }));

  const allTraces = [...amplitudeTraces, ...phaseTraces];

  // Логарифм X (часто ЛАФЧХ идёт по лог шкале)
  // Если нужно, можете вывести из axisSettings,
  // или всегда "log" для ЛАФЧХ
  const xType = "log";

  // Настройки layout
  const layout = {
    title: "ЛАФЧХ (Амплитуда + Фаза)",
    xaxis: {
      type: xType,
      title: "ω, рад/с"
    },
    yaxis: {
      title: "20LogA, дБ/дек",
      range: [-250, 100],
      autorange: false
    },
    yaxis2: {
      title: "φ, °",
      overlaying: "y",
      side: "right",
      range: [100, -292],
      autorange: false
    },
    font: { family: "Arial", size: 14 },
    legend: { orientation: "h", x: 0, y: -0.2 },
    autosize: true
  };

  return (
    <Plot
      data={allTraces}
      layout={layout}
      config={{ responsive: true, displaylogo: false }}
      style={{ width: "100%", height: "100%" }}
    />
  );
};

export default PlotlyGraph;
