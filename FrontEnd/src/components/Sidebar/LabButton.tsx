import React from "react";

interface LabButtonProps {
  icon: React.ReactNode; // Иконка (может быть SVG или компонент)
  text: string; // Текст кнопки
  onClick?: () => void; // Обработчик клика (опционально)
}

const LabButton: React.FC<LabButtonProps> = ({ icon, text, onClick }) => {
  return (
    <button className="lab-button" onClick={onClick}>
      <span className="icon">{icon}</span>
      <span className="text">{text}</span>
    </button>
  );
};

export default LabButton;
