"use client";

import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { setActiveGraphForLab } from "@/store/slices/directionSlice";
import { Panel } from "@/components/Panel";
import PanelShell from "@/components/Panel/PanelShell";
import EChartsGraph from "@/components/EChartsGraph";

const MainContent: React.FC = () => {
  const dispatch = useAppDispatch();
  const { directions, activeDirection, activeLab } = useAppSelector(
    (state) => state.direction
  );

  const currentDir = directions.find((dir) => dir.name === activeDirection);
  const labData = currentDir?.labs.find((l) => l.full === activeLab);

  if (!labData) {
    return (
      <div className="relative flex min-h-0 flex-1 min-w-0">
        <div className="flex-1 min-h-0 min-w-0 flex flex-col p-3 overflow-hidden md:p-4">
          <div className="mb-3 sm:mb-4">
            <h2 className="text-base font-semibold sm:text-xl">Область графика</h2>
          </div>
          <div className="relative flex-1 min-h-[16rem] rounded-xl border border-dashed border-border/70 bg-muted/20">
            <div className="absolute inset-0 flex items-center justify-center p-4 text-center text-sm text-muted-foreground">
              Выберите лабораторную работу, чтобы построить график
            </div>
          </div>
        </div>

        <PanelShell>
          <Panel />
        </PanelShell>
      </div>
    );
  }

  const { full, graphs, activeGraph, graphStorage, graphAxes } = labData;

  const axisSettings = graphAxes?.[activeGraph] || {
    xLabel: "X",
    yLabel: "Y",
    logX: false,
  };

  const lafchAxisSettings = {
    amplitude: graphAxes?.["ЛАФЧХ (амплитуда)"] || {
      xLabel: "Частота, рад/с",
      yLabel: "дБ",
      logX: true,
    },
    phase: graphAxes?.["ЛАФЧХ (фаза)"] || {
      xLabel: "Частота, рад/с",
      yLabel: "°",
      logX: true,
    },
  };

  const handleSelectGraph = (graphName: string) => {
    dispatch(setActiveGraphForLab({ labFull: full, graph: graphName }));
  };

  // Объединение ЛАФЧХ графиков
  let displayGraphs: string[] = [];
  if (
    graphs.includes("ЛАФЧХ (амплитуда)") &&
    graphs.includes("ЛАФЧХ (фаза)")
  ) {
    displayGraphs = graphs.filter(
      (g) => g !== "ЛАФЧХ (амплитуда)" && g !== "ЛАФЧХ (фаза)"
    );
    if (!displayGraphs.includes("ЛАФЧХ")) {
      displayGraphs.push("ЛАФЧХ");
    }
  } else {
    displayGraphs = graphs;
  }

  const isCombinedLAFCH = activeGraph === "ЛАФЧХ";

  const lafchAmplitude = Array.isArray(graphStorage["ЛАФЧХ (амплитуда)"])
    ? graphStorage["ЛАФЧХ (амплитуда)"]
    : [];
  const lafchPhase = Array.isArray(graphStorage["ЛАФЧХ (фаза)"])
    ? graphStorage["ЛАФЧХ (фаза)"]
    : [];
  const currentSeries = Array.isArray(graphStorage[activeGraph])
    ? graphStorage[activeGraph]
    : [];
  return (
    <div className="relative flex min-h-0 flex-1 min-w-0">
      <div className="flex-1 min-h-0 min-w-0 flex flex-col p-3 overflow-hidden md:p-4">
        <div className="mb-2">
          <Tabs
            value={activeGraph}
            onValueChange={handleSelectGraph}
            className="w-full min-w-0 sm:w-auto"
          >
            <div className="w-full overflow-x-auto pb-1">
              <TabsList className="inline-flex h-auto min-h-9 w-max min-w-full justify-start gap-1 sm:min-w-0">
                {displayGraphs.map((g) => (
                  <TabsTrigger
                    key={g}
                    value={g}
                    className="h-auto min-h-8 shrink-0 px-2 py-1 text-[11px] leading-tight whitespace-normal sm:text-xs"
                  >
                    {g}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
          </Tabs>
        </div>

        <div className="flex-1 min-h-0">
          <div className="h-full min-h-[16rem] rounded-xl border border-border/80 bg-card/70 p-2 sm:p-3">
            <EChartsGraph
              graphName={activeGraph}
              axisSettings={axisSettings}
              dataSeries={currentSeries}
              lafchAmplitude={isCombinedLAFCH ? lafchAmplitude : undefined}
              lafchPhase={isCombinedLAFCH ? lafchPhase : undefined}
              lafchAxisSettings={isCombinedLAFCH ? lafchAxisSettings : undefined}
            />
          </div>
        </div>
      </div>
      <PanelShell>
        <Panel />
      </PanelShell>
    </div>
  );
};

export default MainContent;
