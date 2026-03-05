"use client";

import React, { useMemo } from "react";
import ReactECharts from "echarts-for-react";
import type { EChartsOption } from "echarts";

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

interface EChartsGraphProps {
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

const COLORS = [
  "#5470c6",
  "#91cc75",
  "#fac858",
  "#ee6666",
  "#73c0de",
  "#3ba272",
  "#fc8452",
  "#9a60b4",
  "#ea7ccc",
];

const DEFAULT_GRID = {
  left: "10%",
  right: "10%",
  bottom: "15%",
  top: "15%",
};

const EChartsGraph: React.FC<EChartsGraphProps> = React.memo(
  ({
    graphName,
    dataSeries,
    lafchAmplitude,
    lafchPhase,
    axisSettings,
    lafchAxisSettings,
  }) => {
    const option: EChartsOption = useMemo(() => {
      // Для обычных графиков
      if (graphName !== "ЛАФЧХ") {
        if (!Array.isArray(dataSeries) || dataSeries.length === 0) {
          return {
            tooltip: {
              trigger: "axis",
              axisPointer: { type: "cross" },
            },
            graphic: {
              type: "text",
              left: "center",
              top: "middle",
              style: {
                text: `Нет данных для графика ${graphName}`,
                fill: "#6b7280",
                fontSize: 14,
              },
            },
            grid: DEFAULT_GRID,
            xAxis: {
              type: axisSettings.logX ? "log" : ("value" as const),
              name: axisSettings.xLabel,
              nameLocation: "middle",
              nameGap: 30,
            },
            yAxis: {
              type: "value" as const,
              name: axisSettings.yLabel,
              nameLocation: "middle",
              nameGap: 50,
            },
            series: [],
          };
        }

        const series = dataSeries.map((s, idx) => ({
          name: s.title || `График #${idx + 1}`,
          type: "line" as const,
          data: s.x.map((xi, i) => [xi, s.y[i]]),
          showSymbol: false,
          lineStyle: { width: 2 },
          color: COLORS[idx % COLORS.length],
        }));

        return {
          tooltip: {
            trigger: "axis",
            axisPointer: { type: "cross" },
          },
          legend: {
            data: series.map((s) => s.name),
            bottom: 0,
          },
          grid: DEFAULT_GRID,
          xAxis: {
            type: axisSettings.logX ? "log" : ("value" as const),
            name: axisSettings.xLabel,
            nameLocation: "middle",
            nameGap: 30,
          },
          yAxis: {
            type: "value" as const,
            name: axisSettings.yLabel,
            nameLocation: "middle",
            nameGap: 50,
          },
          series,
        };
      }

      // Для ЛАФЧХ (комбинированный график)
      const amplitudeData = lafchAmplitude || [];
      const phaseData = lafchPhase || [];

      if (amplitudeData.length === 0 && phaseData.length === 0) {
        return {
          title: {
            text: "ЛАФЧХ (Амплитуда + Фаза)",
            left: "center",
          },
          tooltip: {
            trigger: "axis",
            axisPointer: { type: "cross" },
          },
          graphic: {
            type: "text",
            left: "center",
            top: "middle",
            style: {
              text: "Нет данных для ЛАФЧХ",
              fill: "#6b7280",
              fontSize: 14,
            },
          },
          grid: DEFAULT_GRID,
          xAxis: {
            type: lafchAxisSettings?.amplitude.logX ? "log" : ("value" as const),
            name: lafchAxisSettings?.amplitude.xLabel || "Частота, рад/с",
            nameLocation: "middle",
            nameGap: 30,
          },
          yAxis: [
            {
              type: "value" as const,
              name: lafchAxisSettings?.amplitude.yLabel || "дБ",
              nameLocation: "middle",
              nameGap: 50,
              position: "left",
            },
            {
              type: "value" as const,
              name: lafchAxisSettings?.phase.yLabel || "°",
              nameLocation: "middle",
              nameGap: 50,
              position: "right",
            },
          ],
          series: [],
        };
      }

      const amplitudeSeries = amplitudeData.map((s, idx) => ({
        name: s.title || `Ампл #${idx + 1}`,
        type: "line" as const,
        data: s.x.map((xi, i) => [xi, s.y[i]]),
        showSymbol: false,
        lineStyle: { width: 2 },
        yAxisIndex: 0,
        color: COLORS[idx % COLORS.length],
      }));

      const phaseSeries = phaseData.map((s, idx) => ({
        name: s.title || `Фаза #${idx + 1}`,
        type: "line" as const,
        data: s.x.map((xi, i) => [xi, s.y[i]]),
        showSymbol: false,
        lineStyle: { width: 2, type: "dashed" as const },
        yAxisIndex: 1,
        color: COLORS[(amplitudeData.length + idx) % COLORS.length],
      }));

      return {
        title: {
          text: "ЛАФЧХ (Амплитуда + Фаза)",
          left: "center",
        },
        tooltip: {
          trigger: "axis",
          axisPointer: { type: "cross" },
        },
        legend: {
          data: [...amplitudeSeries, ...phaseSeries].map((s) => s.name),
          bottom: 0,
        },
        grid: DEFAULT_GRID,
        xAxis: {
          type: lafchAxisSettings?.amplitude.logX
            ? "log"
            : ("value" as const),
          name: lafchAxisSettings?.amplitude.xLabel || "Частота, рад/с",
          nameLocation: "middle",
          nameGap: 30,
        },
        yAxis: [
          {
            type: "value" as const,
            name: lafchAxisSettings?.amplitude.yLabel || "дБ",
            nameLocation: "middle",
            nameGap: 50,
            position: "left",
          },
          {
            type: "value" as const,
            name: lafchAxisSettings?.phase.yLabel || "°",
            nameLocation: "middle",
            nameGap: 50,
            position: "right",
          },
        ],
        series: [...amplitudeSeries, ...phaseSeries],
      };
    }, [
      graphName,
      dataSeries,
      lafchAmplitude,
      lafchPhase,
      axisSettings,
      lafchAxisSettings,
    ]);

    return (
      <ReactECharts
        option={option}
        notMerge={true}
        style={{ width: "100%", height: "100%" }}
        opts={{ renderer: "canvas" }}
      />
    );
  }
);

EChartsGraph.displayName = "EChartsGraph";

export default EChartsGraph;
