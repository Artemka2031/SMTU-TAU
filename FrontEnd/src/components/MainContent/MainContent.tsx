import React, { useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../store";
import Panel from "../Panel/Panel";
import TipeLabButton from "./TipeLabButton";
import { setActiveGraphForLab, updateGraphStorage, GraphData } from "../../store/slices/directionSlice"; // Импортируем GraphData
import PlotlyGraph from "../PlotlyGraph";

const MainContent: React.FC = () => {
  const dispatch = useDispatch();
  const { directions, activeDirection, activeLab } = useSelector(
    (state: RootState) => state.direction
  );

  const currentDir = directions.find((dir) => dir.name === activeDirection);
  const labData = currentDir?.labs.find((l) => l.full === activeLab);

  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (!labData || !currentDir) return;

    if (hasFetchedRef.current) {
      console.log("Запрос уже выполнен, пропускаем...");
      return;
    }

    const { id, parameters } = labData;
    const directionId = currentDir.id;

    const params = parameters.reduce((acc: { [key: string]: string }, param) => {
      acc[param.name] = param.value;
      return acc;
    }, {});

    console.log("Запрос к API для расчёта графика:", { directionId, labId: id, params });

    hasFetchedRef.current = true;

    fetch(`http://127.0.0.1:8000/api/directions/${directionId}/labs/${id}/calculate/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log("Данные от API для графика:", data);
        const formattedData = Object.keys(data).reduce((acc: { [key: string]: GraphData[] }, graphName) => {
          const graphData = data[graphName];
          if (Array.isArray(graphData)) {
            acc[graphName] = graphData.map((item: any, index: number) => ({
              id: index + 1,
              title: item.desc || `${graphName} #${index + 1}`,
              x: item.x || [],
              y: item.y || [],
            }));
          } else {
            acc[graphName] = [];
          }
          return acc;
        }, {});
        dispatch(updateGraphStorage({ labFull: labData.full, graphData: formattedData }));
      })
      .catch((error) => {
        console.error("Ошибка при запросе данных графика:", error);
        hasFetchedRef.current = false;
      });

    return () => {
      hasFetchedRef.current = false;
    };
  }, [labData?.id, currentDir?.id, dispatch]);

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

  console.log("MainContent: graphAxes:", graphAxes);

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

  console.log("MainContent: axisSettings:", axisSettings);
  console.log("MainContent: lafchAxisSettings:", lafchAxisSettings);

  const handleSelectGraph = (graphName: string) => {
    dispatch(setActiveGraphForLab({ labFull: full, graph: graphName }));
  };

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

  console.log("MainContent: данные для графика:", {
    activeGraph,
    currentSeries,
    lafchAmplitude,
    lafchPhase,
  });

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
            lafchAmplitude={isCombinedLAFCH ? lafchAmplitude : undefined}
            lafchPhase={isCombinedLAFCH ? lafchPhase : undefined}
            lafchAxisSettings={isCombinedLAFCH ? lafchAxisSettings : undefined}
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