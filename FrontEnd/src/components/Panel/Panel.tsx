import { AppDispatch, RootState } from "../../store";
import { useDispatch, useSelector } from "react-redux";
import {
  addGraph,
  updateLabParameter,
  updateNote,
  clearGraphs, calculateLab
} from "../../store/slices/directionSlice.ts";
import ParameterInput from "./ParameterInput.tsx";
import NoteInput from "./NoteInput.tsx";
import GraphButton from "./GraphButton.tsx";
import DeleteButton from "./DeleteButton.tsx";
import { FaChartLine } from "react-icons/fa";

const Panel: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { directions, activeDirection, activeLab } = useSelector(
    (state: RootState) => state.direction
  );

  const currentDir = directions.find((dir) => dir.name === activeDirection);
  const labData = currentDir?.labs.find((l) => l.full === activeLab);

  const handleAddGraph = () => {
    if (!labData) return;

    // Отправка действия на добавление графика в graphStorage
    dispatch(addGraph({ labFull: labData.full }));

    // Создаем тело запроса для расчета графиков
    const bodyParams = Object.fromEntries(
      labData.parameters.map((p) => [p.name, p.value])
    );

    // Отправка запроса на расчет графиков
    dispatch(
      calculateLab({
        directionId: currentDir?.id || 0,
        labId: labData.id,
        bodyParams
      })
    );
  };

  return (
    <div className="panel">
      <h2>
        <b>Панель параметров</b>
      </h2>

      {!labData ? (
        <p>Выберите лабораторную работу</p>
      ) : (
        <>
          <div className="parameters">
            {labData.parameters.map((param) => (
              <ParameterInput
                key={param.name}
                paramName={param.name}
                paramValue={param.value}
                onChangeValue={(newVal) =>
                  dispatch(
                    updateLabParameter({
                      labFull: labData.full,
                      paramName: param.name,
                      newValue: newVal
                    })
                  )
                }
              />
            ))}
          </div>

          <NoteInput
            note={labData.note}
            onChangeNote={(newNote) =>
              dispatch(
                updateNote({
                  labFull: labData.full,
                  newNote
                })
              )
            }
          />

          <div className="bottom-block">
            <GraphButton
              text="Добавить график"
              icon={<FaChartLine />}
              onClick={handleAddGraph}
            />
            <DeleteButton
              onDelete={() => dispatch(clearGraphs({ labFull: labData.full }))}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default Panel;
