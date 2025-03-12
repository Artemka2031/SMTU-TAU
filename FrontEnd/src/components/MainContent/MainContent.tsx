import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../store";
import Panel from "../Panel/Panel";
import TipeLabButton from "./TipeLabButton";
import { setActiveGraphForLab } from "../../store/slices/directionSlice";

const MainContent: React.FC = () => {
  const dispatch = useDispatch();
  const { directions, activeDirection, activeLab } = useSelector(
    (state: RootState) => state.direction
  );

  // Находим текущую ЛР
  const currentDir = directions.find((dir) => dir.name === activeDirection);
  const labData = currentDir?.labs.find((lab) => lab.full === activeLab);

  if (!labData) {
    return (
      <div className="main">
        <p>Выберите лабораторную работу</p>
      </div>
    );
  }

  const { full, graphs = [], activeGraph = "", graphLog = [] } = labData;

  // При клике на график -> диспатчим setActiveGraphForLab
  const handleSelectGraph = (graph: string) => {
    dispatch(setActiveGraphForLab({ labFull: full, graph }));
  };

  return (
    <div className="main">
      <div className="left-content">
        {/* Верхняя часть (заголовок + кнопки) */}
        <div className="top-bar">
          <h2 title={full}>{full}</h2>
          <div className="buttons">
            {graphs.map((g) => (
              <TipeLabButton
                key={g}
                label={g}
                isActive={activeGraph === g}  // сравниваем с labData.activeGraph
                onClick={() => handleSelectGraph(g)}
              />
            ))}
          </div>
        </div>

        {/* Нижняя часть (график) */}
        <div className="graph-area">
          {/* Показываем выбранный график */}
          <p>Здесь будет график: {activeGraph}</p>

          {/* Вывод лога "добавленных" или "очищенных" графиков */}
          <div style={{ marginTop: "20px" }}>
            <p><b>Лог действий:</b></p>
            {graphLog.length === 0 ? (
              <p>Пока нет добавленных графиков</p>
            ) : (
              graphLog.map((msg, idx) => <div key={idx}>{msg}</div>)
            )}
          </div>
        </div>
      </div>

      <div className="right-content">
        <Panel />
      </div>
    </div>
  );
};

export default MainContent;
