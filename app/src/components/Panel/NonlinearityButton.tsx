"use client";

import React from "react";

interface NonlinearityButtonProps {
  label: string;
  isSelected: boolean;
  onClick: () => void;
}

const NonlinearityButton: React.FC<NonlinearityButtonProps> = ({
  label,
  isSelected,
  onClick,
}) => {
  return (
    <button
      className={`nonlinearity-button ${isSelected ? "active" : ""}`}
      onClick={onClick}
    >
      {label}
    </button>
  );
};

export default NonlinearityButton;
