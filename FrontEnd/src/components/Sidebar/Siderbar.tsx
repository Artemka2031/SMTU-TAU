import React from 'react';
import LabButton from "./LabButton";
import { GoGraph } from "react-icons/go";

const Sidebar: React.FC = () => {
  return (
    <nav className='sidebar'>
      <LabButton icon={<GoGraph />} text="Название Лр" onClick={() => alert("Clicked!")} />
      <LabButton icon={<GoGraph />} text="Название Лр" onClick={() => alert("Clicked!")} />
      <LabButton icon={<GoGraph />} text="Название Лр" onClick={() => alert("Clicked!")} />
      <LabButton icon={<GoGraph />} text="Название Лр" onClick={() => alert("Clicked!")} />
      <LabButton icon={<GoGraph />} text="Название Лр" onClick={() => alert("Clicked!")} />
      <LabButton icon={<GoGraph />} text="Название Лр" onClick={() => alert("Clicked!")} />
      <LabButton icon={<GoGraph />} text="Название Лр" onClick={() => alert("Clicked!")} />
      <LabButton icon={<GoGraph />} text="Название Лр" onClick={() => alert("Clicked!")} />
      <LabButton icon={<GoGraph />} text="Название Лр" onClick={() => alert("Clicked!")} />

    </nav>
  );
};

export default Sidebar;
