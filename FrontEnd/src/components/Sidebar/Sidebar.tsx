import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../store";
import { setActiveLab } from "../../store/slices/directionSlice";
import LabButton from "./LabButton";
import { GoGraph } from "react-icons/go";

const Sidebar: React.FC = () => {
  const dispatch = useDispatch();
  const { directions, activeDirection, activeLab } = useSelector(
    (state: RootState) => state.direction
  );

  // Ищем объект направления в массиве
  const currentDir = directions.find((dir) => dir.name === activeDirection);
  const labs = currentDir ? currentDir.labs : [];

  return (
    <nav className="sidebar">
      {labs.map(({ short, full }) => (
        <LabButton
          key={full}
          icon={<GoGraph />}
          text={short}
          title={full}
          isActive={activeLab === full}
          onClick={() => dispatch(setActiveLab(full))}
        />
      ))}
    </nav>
  );
};

export default Sidebar;
