import React from "react";
import { SlAnchor } from "react-icons/sl";

interface LogoProps {
  size?: number;
  color?: string;
  text?: string;
}

const Logo: React.FC<LogoProps> = ({ size = 40, color = "#333", text = "КСАиИ" }) => {
  return (
    <div className="logo">
      <SlAnchor className="logo-icon" size={size} color={color} />
      <h1 className="logo-text">{text}</h1>
    </div>
  );
};

export default Logo;
