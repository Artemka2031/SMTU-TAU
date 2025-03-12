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

  // Находим текущее направление
  const currentDir = directions.find((dir) => dir.name === activeDirection);
  // Находим текущую ЛР
  const labData = currentDir?.labs.find((lab) => lab.full === activeLab);

  // Если ЛР не выбрана
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

  // Извлекаем нужные поля
  const { full, graphs, activeGraph, graphStorage, graphAxes } = labData;

  // Серии (GraphData[]) для активного графика
  const currentSeries = graphStorage[activeGraph] || [];

  // Настройки осей для активного графика
  const axisSettings = graphAxes?.[activeGraph] || {
    xLabel: "X",
    yLabel: "Y",
    logX: false
  };

  // Переключение типа графика
  const handleSelectGraph = (graphName: string) => {
    dispatch(setActiveGraphForLab({ labFull: full, graph: graphName }));
  };

  return (
    <div className="main">
      {/* Левая часть */}
      <div className="left-content">
        <div className="top-bar">
          <h2>{full}</h2>
          <div className="buttons">
            {graphs.map((g) => (
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
            dataSeries={currentSeries}
            graphName={activeGraph}
            axisSettings={axisSettings}  // Передаём настройки осей
          />
        </div>
      </div>

      {/* Правая часть */}
      <div className="right-content">
        <Panel />
      </div>
    </div>
  );
};

export default MainContent;
