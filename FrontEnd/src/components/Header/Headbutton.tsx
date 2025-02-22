import React from "react";

interface HeadButtonProps {
  label: string;
  onClick?: () => void;
  isActive?: boolean; // Добавляем состояние активности (по умолчанию false)
}

const HeadButton: React.FC<HeadButtonProps> = ({ label, onClick, isActive = false }) => {
  return (
    <button className={`head-button ${isActive ? "active" : ""}`} onClick={onClick}>
      {label}
    </button>
  );
};

export default HeadButton;
