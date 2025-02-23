import React from "react";
import LabButton from "./LabButton";
import { GoGraph } from "react-icons/go";

interface SidebarProps {
  activeLab: string | null;
  setActiveLab: (lab: string | null) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeLab, setActiveLab }) => {
  const buttonData = [
    { short: "1 ЛР", full: "1 ЛР: Дифференциальные уравнения" },
    { short: "2 ЛР", full: "2 ЛР: Аперодические звенья" },
    { short: "3 ЛР", full: "3 ЛР: Аперодические звенья" },
    { short: "4 ЛР", full: "4 ЛР: Колебательные звенья" },
    { short: "5 ЛР", full: "5 ЛР: Исследование переходных процессов" },
    { short: "6 ЛР", full: "6 ЛР: Замкнутая система управления" }
  ];

  return (
    <nav className="sidebar">
      {buttonData.map(({ short, full }) => (
        <LabButton
          key={full}
          icon={<GoGraph />}
          text={short} // Показываем только "1 ЛР"
          title={full} // Полное название при наведении
          isActive={activeLab === full}
          onClick={() => setActiveLab(full)}
        />
      ))}
    </nav>
  );
};

export default Sidebar;
