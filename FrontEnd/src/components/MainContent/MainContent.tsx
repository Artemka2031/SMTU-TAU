import React from 'react';
import Panel from '../Panel/Panel';

const MainContent: React.FC = () => {
  return (
    <div className="main">
      <div className="left-content">
        <h2>Левая часть</h2>
        <p>Здесь может быть контент, графики, таблицы и т. д.</p>
      </div>
      <div className="right-content">
        <Panel/>
      </div>
    </div>
  );
};

export default MainContent;
