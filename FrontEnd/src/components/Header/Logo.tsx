import React from "react";
// import { SlAnchor } from "react-icons/sl"; // Или замените на вашу иконку
import { MdOutlineScience } from "react-icons/md";
// import { MdScience } from "react-icons/md";
import { DiAtom } from "react-icons/di";

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
