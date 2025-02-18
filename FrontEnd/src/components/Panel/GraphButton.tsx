import React from 'react';

interface GraphButtonProps {
  text: string;
  icon: React.ReactNode;
}

const GraphButton: React.FC<GraphButtonProps> = ({ text, icon }) => {
  return (
    <button className="graph-button">
      <span className="icon">{icon}</span>
      {text}
    </button>
  );
};

export default GraphButton;
