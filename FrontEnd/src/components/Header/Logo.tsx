import React from "react";
import { MdOutlineScience } from "react-icons/md";

interface LogoProps {
  size?: number;
  color?: string;
}

const Logo: React.FC<LogoProps> = ({ size = 50, color = "#333" }) => {
  return (
    <div className="logo">
      <MdOutlineScience size={size} color={color} />
      <span className="logo-text">КСАИ</span>
    </div>
  );
};

export default Logo;
