import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../store";
import {
  addGraph,
  clearGraphs,
  updateLabParameter,
  updateNote
} from "../../store/slices/directionSlice";

import ParameterInput from "./ParameterInput";
import NoteInput from "./NoteInput";
import GraphButton from "./GraphButton";
import DeleteButton from "./DeleteButton";
import { FaChartLine } from "react-icons/fa";

const Panel: React.FC = () => {
  const dispatch = useDispatch();
  const { directions, activeDirection, activeLab } = useSelector(
    (state: RootState) => state.direction
  );

  // Ищем текущую ЛР
  const currentDir = directions.find((dir) => dir.name === activeDirection);
  const labData = currentDir?.labs.find((l) => l.full === activeLab);

  return (
    <div className="panel">
      <h2>
        <b>Панель параметров</b>
      </h2>

      {/* Если ЛР не выбрана, показываем заглушку, но при этом "панель" сохраняем */}
      {!labData ? (
        <p>Выберите лабораторную работу</p>
      ) : (
        <>
          {/* Параметры */}
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
                      newValue: newVal,
                    })
                  )
                }
              />
            ))}
          </div>

          {/* Примечание */}
          <NoteInput
            note={labData.note}
            onChangeNote={(newNote) =>
              dispatch(
                updateNote({
                  labFull: labData.full,
                  newNote,
                })
              )
            }
          />

          {/* Кнопки внизу */}
          <div className="bottom-block">
            <GraphButton
              text="Добавить график"
              icon={<FaChartLine />}
              onClick={() => dispatch(addGraph({ labFull: labData.full }))}
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
