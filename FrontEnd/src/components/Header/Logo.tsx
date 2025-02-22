import React from "react";
// import { SlAnchor } from "react-icons/sl";
// import { TbAutomaticGearbox } from "react-icons/tb";
import { GiPowerGenerator } from "react-icons/gi";

interface LogoProps {
  size?: number;
  color?: string;
  text?: string;
}

const Logo: React.FC<LogoProps> = ({ size = 40, color = "#333", text = "КСАиИ" }) => {
  return (
    <div className="logo">
      <GiPowerGenerator className="logo-icon" size={size} color={color} />
      {/* <TbAutomaticGearbox className="logo-icon" size={size} color={color} /> */}
      {/* <SlAnchor className="logo-icon" size={size} color={color} /> */}

      <h1 className="logo-text">{text}</h1>
    </div>
  );
};

export default Logo;
