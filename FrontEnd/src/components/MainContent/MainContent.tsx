import React from 'react';
import Panel from '../Panel/Panel';

const MainContent: React.FC = () => {
  return (
    <div className="main">
      <div className="left-content">
        {/* Верхняя часть (заголовок + кнопки) */}
        <div className="top-bar">
          <h2>Название лабоаторной работы</h2>
          <div className="buttons">
            <button className="active">ПХ</button>
            <span className="divider">|</span>
            <button>АЧХ</button>
            <span className="divider">|</span>
            <button>ФЧХ</button>
            <span className="divider">|</span>
            <button>АФЧХ</button>
            <span className="divider">|</span>
            <button>ЛАФЧХ</button>
          </div>
        </div>

        {/* Нижняя часть (график) */}
        <div className="graph-area">
          <p>Здесь будет график...</p>
        </div>
      </div>

      {/* Правая панель */}
      <div className="right-content">
        <Panel />
      </div>
    </div>
  );
};

export default MainContent;
