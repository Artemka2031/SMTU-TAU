import React from "react";
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "../../store";
import Panel from "../Panel/Panel";
import TipeLabButton from "./TipeLabButton";
import {setActiveGraphForLab} from "../../store/slices/directionSlice";
import PlotlyGraph from "../PlotlyGraph";

const MainContent: React.FC = () => {
    const dispatch = useDispatch();
    const {directions, activeDirection, activeLab} = useSelector(
        (state: RootState) => state.direction
    );

    const currentDir = directions.find((dir) => dir.name === activeDirection);
    const labData = currentDir?.labs.find((l) => l.full === activeLab);

    if (!labData) {
        return (
            <div className="main">
                <div className="left-content">
                    <h2>Не выбрана лабораторная работа</h2>
                </div>
                <div className="right-content">
                    <Panel/>
                </div>
            </div>
        );
    }

    const {full, graphs, activeGraph, graphStorage, graphAxes, nonlinearities, selectedNonlinearity} = labData;

    console.log("MainContent: graphStorage:", graphStorage);
    console.log("MainContent: activeGraph:", activeGraph);
    console.log("MainContent: nonlinearities:", nonlinearities);
    console.log("MainContent: selectedNonlinearity:", selectedNonlinearity);

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
        dispatch(setActiveGraphForLab({labFull: full, graph: graphName}));
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
                <Panel/>
            </div>
        </div>
    );
};

export default MainContent;