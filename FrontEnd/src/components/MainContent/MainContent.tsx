import React, { useState } from "react";
import Panel from "../Panel/Panel";
import TipeLabButton from "./TipeLabButton";

interface MainContentProps {
  activeLab: string;
}

const MainContent: React.FC<MainContentProps> = ({ activeLab }) => {
  const [activeButton, setActiveButton] = useState("ПХ");

  return (
    <div className="main">
      <div className="left-content">
        {/* Верхняя часть (заголовок + кнопки) */}
        <div className="top-bar">
          <h2 title={activeLab}>{activeLab}</h2> {/* Подсказка при наведении */}
          <div className="buttons">
            {["ПХ", "АЧХ", "ФЧХ", "АФЧХ", "ЛАФЧХ"].map((label) => (
              <TipeLabButton
                key={label}
                label={label}
                isActive={activeButton === label}
                onClick={() => setActiveButton(label)}
              />
            ))}
          </div>
        </div>

        {/* Нижняя часть (график) */}
        <div className="graph-area">
          <p>Здесь будет график...</p>
        </div>
      </div>

      {/* Правая панель */}
      <div className="right-content">
        <Panel />
      </div>
    </div>
  );
};

export default MainContent;
