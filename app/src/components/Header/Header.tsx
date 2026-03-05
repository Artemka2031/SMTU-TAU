"use client";

import React from "react";
import { MdOutlineScience } from "react-icons/md";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { setActiveDirection } from "@/store/slices/directionSlice";

const Header: React.FC = () => {
  const dispatch = useAppDispatch();
  const { activeDirection, directions, activeLab } = useAppSelector(
    (state) => state.direction
  );
  const directionNames = directions.map((d) => d.name);

  const handleClick = (dir: string) => {
    dispatch(setActiveDirection(dir));
  };

  return (
    <header className="flex items-center justify-between px-4 h-14 border-b bg-background">
      <div className="flex min-w-0 items-center gap-3">
        <MdOutlineScience size={32} className="text-primary" />
        <span className="font-bold text-lg shrink-0">КСАИ</span>
        {activeLab && (
          <span className="hidden min-w-0 truncate text-sm text-muted-foreground sm:block">
            {activeLab}
          </span>
        )}
      </div>
      <div className="flex min-w-0 items-center gap-2">
        <nav className="hidden md:flex gap-1 overflow-x-auto max-w-[70vw]">
          {directionNames.map((label) => (
            <Button
              key={label}
              variant={activeDirection === label ? "default" : "ghost"}
              size="sm"
              className="shrink-0"
              onClick={() => handleClick(label)}
            >
              {label}
            </Button>
          ))}
        </nav>
        <div className="w-44 md:hidden">
          <Select value={activeDirection} onValueChange={handleClick}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Выберите тему" />
            </SelectTrigger>
            <SelectContent align="end">
              {directionNames.map((label) => (
                <SelectItem key={label} value={label}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </header>
  );
};

export default Header;
