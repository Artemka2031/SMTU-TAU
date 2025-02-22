import React from "react";

interface LabButtonProps {
  icon: React.ReactNode;
  text: string;
  onClick?: () => void;
  isActive?: boolean;
  title?: string; // ✅ Добавляем `title`
}

const LabButton: React.FC<LabButtonProps> = ({ icon, text, onClick, isActive = false, title }) => {
  return (
    <button className={`lab-button ${isActive ? "active" : ""}`} onClick={onClick} title={title}>
      <span className="icon">{icon}</span>
      <span className="text">{text}</span>
    </button>
  );
};

export default LabButton;
