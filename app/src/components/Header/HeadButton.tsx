"use client";

import React from "react";

interface HeadButtonProps {
  label: string;
  onClick?: () => void;
  isActive?: boolean;
}

const HeadButton: React.FC<HeadButtonProps> = ({
  label,
  onClick,
  isActive = false,
}) => {
  return (
    <button
      className={`head-button ${isActive ? "active" : ""}`}
      onClick={onClick}
    >
      {label}
    </button>
  );
};

export default HeadButton;
