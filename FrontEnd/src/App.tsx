// SMTU-TAU/FrontEnd/src/App.tsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Header from './components/Header/Header';
import MainContent from './components/MainContent/MainContent';
import Sidebar from './components/Sidebar/Sidebar';
import { RootState } from './store';
import { setDirectionsFromAPI, setActiveLab } from './store/slices/directionSlice';

const App: React.FC = () => {
  const dispatch = useDispatch();
  const { activeLab } = useSelector((state: RootState) => state.direction);

  useEffect(() => {
    console.log("Начало запроса к API для получения направлений...");
    const baseUrl = import.meta.env.VITE_API_BASE_URL as string;
    const url = `${baseUrl}/directions/`;

    fetch(url)
      .then(response => {
        console.log("Статус ответа:", response.status);
        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log("Получены данные:", data);
        dispatch(setDirectionsFromAPI(data));
        if (data.length > 0 && data[0].labs.length > 0) {
          dispatch(setActiveLab(data[0].labs[0].full));
        }
      })
      .catch(error => {
        console.error("Ошибка загрузки направлений:", error);
      });
  }, [dispatch]);

  return (
    <div className="grid-container">
      <Header />
      <Sidebar />
      {activeLab && <MainContent />}
    </div>
  );
};

export default App;
