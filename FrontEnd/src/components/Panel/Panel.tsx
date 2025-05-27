import React from 'react';
import {AppDispatch, RootState} from "../../store";
import {useDispatch, useSelector} from "react-redux";
import {
    addGraph,
    calculateLab,
    clearGraphs,
    setNonlinearity,
    updateLabParameter,
    updateNote,
} from "../../store/slices/directionSlice";
import ParameterInput from "./ParameterInput";
import NoteInput from "./NoteInput";
import GraphButton from "./GraphButton";
import DeleteButton from "./DeleteButton";
import NonlinearityButton from "./NonlinearityButton";
import {FaChartLine} from "react-icons/fa";

const Panel: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const {directions, activeDirection, activeLab} = useSelector(
        (state: RootState) => state.direction
    );

    const currentDir = directions.find((dir) => dir.name === activeDirection);
    const labData = currentDir?.labs.find((l) => l.full === activeLab);

    // Прямой селектор для selectedNonlinearity
    const selectedNonlinearity = useSelector((state: RootState) =>
        state.direction.directions
            .find((dir) => dir.name === activeDirection)
            ?.labs.find((l) => l.full === activeLab)
            ?.selectedNonlinearity
    );

    const handleAddGraph = () => {
        if (!labData || !currentDir) return;

        dispatch(addGraph({labFull: labData.full}));

        const bodyParams = Object.fromEntries(
            labData.parameters.map((p) => [p.name, p.value])
        );

        dispatch(
            calculateLab({
                directionId: currentDir.id,
                labId: labData.id,
                bodyParams,
                nonlinearity: selectedNonlinearity,
            })
        );
    };

    const handleSelectNonlinearity = (nonlinearity: string) => {
        if (labData) {
            console.log(`Выбор нелинейности: ${nonlinearity}, labFull: ${labData.full}`);
            dispatch(setNonlinearity({labFull: labData.full, nonlinearity}));
        }
    };

    console.log("Panel: activeDirection:", activeDirection);
    console.log("Panel: Текущая нелинейность:", selectedNonlinearity);

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

                    {activeDirection === "ТАУ Нелин" && labData.nonlinearities && labData.nonlinearities.length > 0 && (
                        <div className="nonlinearities">
                            <h3>Нелинейности</h3>
                            <div className="nonlinearity-buttons">
                                {labData.nonlinearities.map((nl) => {
                                    const isSelected = selectedNonlinearity === nl;
                                    console.log(`Кнопка ${nl}: isSelected=${isSelected}`);
                                    return (
                                        <NonlinearityButton
                                            key={nl}
                                            label={nl}
                                            isSelected={isSelected}
                                            onClick={() => handleSelectNonlinearity(nl)}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    )}

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
                            icon={<FaChartLine/>}
                            onClick={handleAddGraph}
                        />
                        <DeleteButton
                            onDelete={() => dispatch(clearGraphs({labFull: labData.full}))}
                        />
                    </div>
                </>
            )}
        </div>
    );
};

// @ts-ignore
export default Panel;