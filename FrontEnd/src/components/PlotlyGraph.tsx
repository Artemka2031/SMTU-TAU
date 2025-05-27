import React from "react";
// @ts-ignore
import Plot from "react-plotly.js";

interface GraphData {
  id: number;
  title: string;
  x: number[];
  y: number[];
}

interface AxisSettings {
  xLabel: string;
  yLabel: string;
  logX: boolean;
}

interface PlotlyGraphProps {
  graphName: string;
  dataSeries: GraphData[];
  lafchAmplitude?: GraphData[];
  lafchPhase?: GraphData[];
  axisSettings: AxisSettings;
  lafchAxisSettings?: {
    amplitude: AxisSettings;
    phase: AxisSettings;
  };
}

const PlotlyGraph: React.FC<PlotlyGraphProps> = React.memo(
  ({
    graphName,
    dataSeries,
    lafchAmplitude,
    lafchPhase,
    axisSettings,
    lafchAxisSettings,
  }) => {
    console.log("PlotlyGraph: axisSettings:", axisSettings);
    if (lafchAxisSettings) {
      console.log("PlotlyGraph: lafchAxisSettings:", lafchAxisSettings);
    }

    if (graphName !== "ЛАФЧХ" && (!Array.isArray(dataSeries) || dataSeries.length === 0)) {
      return <div>Нет данных для графика {graphName}</div>;
    }

    if (
      graphName === "ЛАФЧХ" &&
      (!Array.isArray(lafchAmplitude) || lafchAmplitude.length === 0) &&
      (!Array.isArray(lafchPhase) || lafchPhase.length === 0)
    ) {
      return <div>Нет данных для ЛАФЧХ (амплитуда или фаза)</div>;
    }

    if (graphName !== "ЛАФЧХ") {
      const traces = dataSeries.map((series, idx) => ({
        x: series.x,
        y: series.y,
        mode: "lines",
        name: series.title || `График #${idx + 1}`,
        line: { width: 4 },
      }));

      const xType = axisSettings.logX ? "log" : "linear";

      const layout = {
        title: `Активный график: ${graphName}`,
        xaxis: {
          title: {
            text: axisSettings.xLabel,
            standoff: 20,
          },
          type: xType,
        },
        yaxis: {
          title: {
            text: axisSettings.yLabel,
            standoff: 20,
          },
        },
        legend: {
          orientation: "h",
          x: 0,
          y: -0.2,
        },
        autosize: true,
        margin: { l: 60, r: 60, t: 60, b: 60 },
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

    const amplitudeData = lafchAmplitude || [];
    const phaseData = lafchPhase || [];

    const amplitudeTraces = amplitudeData.map((series, idx) => ({
      x: series.x,
      y: series.y,
      mode: "lines",
      name: series.title || `Ампл #${idx + 1}`,
      line: { width: 3 },
      yaxis: "y",
    }));

    const phaseTraces = phaseData.map((series, idx) => ({
      x: series.x,
      y: series.y,
      mode: "lines",
      name: series.title || `Фаза #${idx + 1}`,
      line: { width: 3, dash: "dash" },
      yaxis: "y2",
    }));

    const allTraces = [...amplitudeTraces, ...phaseTraces];

    const xType = lafchAxisSettings?.amplitude.logX ? "log" : "linear";

    const layout = {
      title: "ЛАФЧХ (Амплитуда + Фаза)",
      xaxis: {
        type: xType,
        title: {
          text: lafchAxisSettings?.amplitude.xLabel || "Частота, рад/с",
          standoff: 20,
        },
      },
      yaxis: {
        title: {
          text: lafchAxisSettings?.amplitude.yLabel || "дБ",
          standoff: 20,
        },
        range: [-250, 100],
        autorange: false,
      },
      yaxis2: {
        title: {
          text: lafchAxisSettings?.phase.yLabel || "°",
          standoff: 20,
        },
        overlaying: "y",
        side: "right",
        range: [100, -292],
        autorange: false,
      },
      legend: { orientation: "h", x: 0, y: -0.2 },
      autosize: true,
      margin: { l: 60, r: 60, t: 60, b: 60 },
    };

    return (
      <Plot
        data={allTraces}
        layout={layout}
        config={{ responsive: true, displaylogo: false }}
        style={{ width: "100%", height: "100%" }}
      />
    );
  }
);

export default PlotlyGraph;