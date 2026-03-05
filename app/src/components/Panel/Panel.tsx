"use client";

import React from "react";
import { FaChartLine } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import {
  addGraph,
  calculateLab,
  clearGraphs,
  setNonlinearity,
  updateLabParameter,
  updateNote,
} from "@/store/slices/directionSlice";

const Panel: React.FC = () => {
  const dispatch = useAppDispatch();
  const { directions, activeDirection, activeLab, isLoading, error } = useAppSelector(
    (state) => state.direction
  );

  const currentDir = directions.find((dir) => dir.name === activeDirection);
  const labData = currentDir?.labs.find((l) => l.full === activeLab);

  const selectedNonlinearity = useAppSelector(
    (state) =>
      state.direction.directions
        .find((dir) => dir.name === activeDirection)
        ?.labs.find((l) => l.full === activeLab)?.selectedNonlinearity
  );

  const handleAddGraph = () => {
    if (!labData || !currentDir) return;

    dispatch(addGraph({ labFull: labData.full }));

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
      dispatch(setNonlinearity({ labFull: labData.full, nonlinearity }));
    }
  };

  return (
    <Card className="flex h-full flex-col overflow-hidden rounded-none border-0 shadow-none">
      <CardHeader className="px-5 pb-2 pt-4 md:px-6 md:pb-3 md:pt-6">
        <CardTitle className="text-base md:text-lg">Параметры</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 space-y-4 overflow-x-hidden overflow-y-auto px-5 pb-4 pt-0 md:px-6 md:pb-5">
        {!labData ? (
          <p className="text-muted-foreground">Выберите лабораторную работу</p>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-2 [@media(min-width:360px)]:grid-cols-2">
              {labData.parameters.map((param) => (
                <div key={param.name} className="rounded-md border bg-background/60 p-2">
                  <label className="mb-1 block text-[11px] font-medium text-muted-foreground sm:text-xs">
                    {param.name}
                  </label>
                  <Input
                    type="text"
                    inputMode="decimal"
                    value={param.value}
                    onChange={(e) =>
                      dispatch(
                        updateLabParameter({
                          labFull: labData.full,
                          paramName: param.name,
                          newValue: e.target.value,
                        })
                      )
                    }
                    className="h-8 min-w-0 px-2 text-sm"
                  />
                </div>
              ))}
            </div>

            {activeDirection === "ТАУ Нелин" &&
              labData.nonlinearities &&
              labData.nonlinearities.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Нелинейности</h3>
                  <div className="grid grid-cols-1 gap-1.5 xl:grid-cols-2">
                    {labData.nonlinearities.map((nl) => (
                      <Button
                        key={nl}
                        variant={
                          selectedNonlinearity === nl ? "default" : "outline"
                        }
                        className="h-auto min-h-8 w-full justify-start whitespace-normal break-words px-2 py-1.5 text-left text-[11px] leading-snug"
                        onClick={() => handleSelectNonlinearity(nl)}
                      >
                        {nl}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Заметки</label>
              <Textarea
                value={labData.note}
                onChange={(e) =>
                  dispatch(
                    updateNote({
                      labFull: labData.full,
                      newNote: e.target.value,
                    })
                  )
                }
                rows={3}
                className="resize-none"
              />
            </div>
          </>
        )}
      </CardContent>
      {labData && (
        <CardFooter className="shrink-0 border-t bg-card px-5 py-4 md:px-6">
          <div className="flex w-full flex-col gap-2">
            <Button
              onClick={handleAddGraph}
              disabled={isLoading}
              className="w-full min-w-0 whitespace-nowrap"
            >
              <FaChartLine className="mr-2 h-4 w-4" />
              {isLoading ? "Расчёт..." : "Добавить график"}
            </Button>
            <Button
              variant="destructive"
              className="w-full min-w-0"
              disabled={isLoading}
              onClick={() =>
                dispatch(clearGraphs({ labFull: labData.full }))
              }
            >
              Очистить
            </Button>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        </CardFooter>
      )}
    </Card>
  );
};

export default Panel;
