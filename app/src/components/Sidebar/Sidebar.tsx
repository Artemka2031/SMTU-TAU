"use client";

import React from "react";
import { GoGraph } from "react-icons/go";
import { Button } from "@/components/ui/button";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { setActiveLab } from "@/store/slices/directionSlice";

const Sidebar: React.FC = () => {
  const dispatch = useAppDispatch();
  const { directions, activeDirection, activeLab } = useAppSelector(
    (state) => state.direction
  );

  const currentDir = directions.find((dir) => dir.name === activeDirection);
  const labs = currentDir ? currentDir.labs : [];

  return (
    <nav className="flex w-full shrink-0 gap-1 overflow-x-auto border-b bg-muted/40 p-1.5 md:h-full md:w-24 md:flex-col md:overflow-x-visible md:overflow-y-auto md:border-b-0 md:border-r md:p-2 lg:w-32">
      {labs.map(({ short, full }) => (
        <Button
          key={full}
          variant={activeLab === full ? "default" : "ghost"}
          className="shrink-0 justify-center gap-1 px-2 md:justify-start md:gap-2"
          title={full}
          onClick={() => dispatch(setActiveLab(full))}
        >
          <GoGraph className="h-4 w-4" />
          <span className="text-xs sm:text-sm">{short}</span>
        </Button>
      ))}
    </nav>
  );
};

export default Sidebar;
