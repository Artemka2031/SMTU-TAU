import React from "react";

interface TipeLabButtonProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const TipeLabButton: React.FC<TipeLabButtonProps> = ({ label, isActive, onClick }) => {
  return (
    <button className={`tipe-lab-button ${isActive ? "active" : ""}`} onClick={onClick}>
      {label}
    </button>
  );
};

export default TipeLabButton;
