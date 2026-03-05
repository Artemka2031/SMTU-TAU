"use client";

import React from "react";

interface GraphButtonProps {
  text: string;
  icon: React.ReactNode;
  onClick?: () => void;
}

const GraphButton: React.FC<GraphButtonProps> = ({ text, icon, onClick }) => {
  return (
    <button className="graph-button" onClick={onClick}>
      <span className="icon">{icon}</span>
      {text}
    </button>
  );
};

export default GraphButton;
