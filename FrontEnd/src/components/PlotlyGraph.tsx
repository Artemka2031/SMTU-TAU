import React from "react";
import Plot from "react-plotly.js";

// Описание серии
interface GraphData {
  id: number;
  title: string;
  x: number[];
  y: number[];
}

// Настройки осей
interface AxisSettings {
  xLabel: string;
  yLabel: string;
  logX: boolean;
}

interface PlotlyGraphProps {
  dataSeries: GraphData[];
  graphName: string; // "ПХ", "АЧХ", ...
  axisSettings: AxisSettings; // { xLabel, yLabel, logX }
}

const PlotlyGraph: React.FC<PlotlyGraphProps> = ({
  dataSeries,
  graphName,
  axisSettings
}) => {
  // Формируем трейсы
  const traces = dataSeries.map((series) => ({
    x: series.x,
    y: series.y,
    mode: "lines",
    name: series.title, // "График (ПХ) №1"
    line: {
      width: 4 // толщина линий
    }
  }));

  // Логарифм X
  const xType = axisSettings.logX ? "log" : "linear";

  // Настройки layout
  const layout = {
    title: `Активный график: ${graphName}`,
    xaxis: {
      title: axisSettings.xLabel, // "Частота, рад/с", "Время", ...
      type: xType,
      titlefont: { size: 16, family: "Arial" },
      tickfont: { size: 14 }
    },
    yaxis: {
      title: axisSettings.yLabel,
      titlefont: { size: 16, family: "Arial" },
      tickfont: { size: 14 }
    },
    font: {
      family: "Arial",
      size: 14
    },
    // Легенда снизу
    legend: {
      font: { size: 14 },
      orientation: "h", // horizontal
      x: 0,
      y: -0.2 // сдвиг под график
    },
    autosize: true
  };

  const config = {
    responsive: true,
    displaylogo: false
  };

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <Plot
        data={traces}
        layout={layout}
        config={config}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
};

export default PlotlyGraph;
