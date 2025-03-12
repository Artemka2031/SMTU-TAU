import React, { useState } from 'react';
import Header from './components/Header/Header';
import MainContent from './components/MainContent/MainContent';
import Sidebar from "./components/Sidebar/Sidebar";


const App: React.FC = () => {
  const [activeLab, setActiveLab] = useState<string | null>(null); // Состояние активной лабораторной работы

  return (
    <div className="grid-container">
      <Header />
      <Sidebar activeLab={activeLab} setActiveLab={setActiveLab} />
      {activeLab && <MainContent activeLab={activeLab} />} {/* Передаем активную ЛР */}
    </div>
  );
};

export default App;
