import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Header from './components/Header/Header';
import MainContent from './components/MainContent/MainContent';
import Sidebar from "./components/Sidebar/Sidebar";
import { RootState } from './store';
import { setActiveLab } from './store/slices/directionSlice';

const App: React.FC = () => {
  const dispatch = useDispatch();
  // Считываем activeLab из стейта
  const activeLab = useSelector((state: RootState) => state.direction.activeLab);

  // При необходимости можем определить функцию для установки lab
  const handleSetLab = (lab: string | null) => {
    dispatch(setActiveLab(lab));
  };

  return (
    <div className="grid-container">
      <Header />
      <Sidebar activeLab={activeLab} setActiveLab={handleSetLab} />
      {activeLab && <MainContent activeLab={activeLab} />}
    </div>
  );
};

export default App;
