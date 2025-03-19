import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../store";
import Panel from "../Panel/Panel";
import TipeLabButton from "./TipeLabButton";
import { setActiveGraphForLab } from "../../store/slices/directionSlice";
import PlotlyGraph from "../PlotlyGraph";

const MainContent: React.FC = () => {
  const dispatch = useDispatch();
  const { directions, activeDirection, activeLab } = useSelector(
    (state: RootState) => state.direction
  );

  // Находим текущее направление и лабораторную работу
  const currentDir = directions.find((dir) => dir.name === activeDirection);
  const labData = currentDir?.labs.find((l) => l.full === activeLab);

  if (!labData) {
    return (
      <div className="main">
        <div className="left-content">
          <h2>Не выбрана лабораторная работа</h2>
        </div>
        <div className="right-content">
          <Panel />
        </div>
      </div>
    );
  }

  const { full, graphs, activeGraph, graphStorage, graphAxes } = labData;
  // Настройки осей
  const axisSettings = graphAxes?.[activeGraph] || {
    xLabel: "X",
    yLabel: "Y",
    logX: false
  };

  const handleSelectGraph = (graphName: string) => {
    dispatch(setActiveGraphForLab({ labFull: full, graph: graphName }));
  };

  // Сформируем список кнопок: если есть "ЛАФЧХ (амплитуда)" и "ЛАФЧХ (фаза)",
  // то объединим их в одну кнопку "ЛАФЧХ".
  let displayGraphs: string[] = [];
  if (
    graphs.includes("ЛАФЧХ (амплитуда)") &&
    graphs.includes("ЛАФЧХ (фаза)")
  ) {
    // убираем "ЛАФЧХ (амплитуда)" и "ЛАФЧХ (фаза)"
    displayGraphs = graphs.filter(
      (g) => g !== "ЛАФЧХ (амплитуда)" && g !== "ЛАФЧХ (фаза)"
    );
    // добавляем общую "ЛАФЧХ"
    if (!displayGraphs.includes("ЛАФЧХ")) {
      displayGraphs.push("ЛАФЧХ");
    }
  } else {
    displayGraphs = graphs;
  }

  // Определяем, надо ли рисовать "ЛАФЧХ".
  const isCombinedLAFCH = (activeGraph === "ЛАФЧХ");

  // Если это "ЛАФЧХ", берём данные из graphStorage["ЛАФЧХ (амплитуда)"] и ["ЛАФЧХ (фаза)"]
  const lafchAmplitude = graphStorage["ЛАФЧХ (амплитуда)"] || [];
  const lafchPhase = graphStorage["ЛАФЧХ (фаза)"] || [];

  // Если граф не "ЛАФЧХ", просто берём currentSeries
  const currentSeries = graphStorage[activeGraph] || [];

  return (
    <div className="main">
      <div className="left-content">
        <div className="top-bar">
          <h2>{full}</h2>
          <div className="buttons">
            {displayGraphs.map((g) => (
              <TipeLabButton
                key={g}
                label={g}
                isActive={g === activeGraph}
                onClick={() => handleSelectGraph(g)}
              />
            ))}
          </div>
        </div>

        <div className="graph-area">
          <PlotlyGraph
            graphName={activeGraph}
            axisSettings={axisSettings}
            dataSeries={currentSeries}
            // Если "ЛАФЧХ" – передаем амплитуду/фазу. Иначе нет.
            lafchAmplitude={isCombinedLAFCH ? lafchAmplitude : undefined}
            lafchPhase={isCombinedLAFCH ? lafchPhase : undefined}
          />
        </div>
      </div>

      <div className="right-content">
        <Panel />
      </div>
    </div>
  );
};

export default MainContent;
