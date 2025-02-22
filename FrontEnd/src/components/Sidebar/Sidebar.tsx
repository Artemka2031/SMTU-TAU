import React from "react";
import LabButton from "./LabButton";
import { GoGraph } from "react-icons/go";

interface SidebarProps {
  activeLab: string | null;
  setActiveLab: (lab: string | null) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeLab, setActiveLab }) => {
  const buttonData = ["1 ЛР: Дифференцирующее звено с замедлением", "2 ЛР: Аперодическое звено звено I порядка", "3 ЛР: Аперодическое звено II порядка", "4 ЛР: Колебательное звено", "5 ЛР: Исследование разомкнутой системы","6 ЛР: Замкнутая система"];

  return (
    <nav className="sidebar">
      {buttonData.map((text) => (
        <LabButton
          key={text}
          icon={<GoGraph />}
          text={text}
          title={text} // ✅ Добавляем `title`
          isActive={activeLab === text}
          onClick={() => setActiveLab(text)}
        />
      ))}
    </nav>
  );
};

export default Sidebar;
