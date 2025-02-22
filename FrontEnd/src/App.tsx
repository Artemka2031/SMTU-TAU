import React from 'react';
import Header from './components/Header/Header';
import Sidebar from './components/Sidebar/Siderbar';
import MainContent from './components/MainContent/MainContent';

const App: React.FC = () => {
  return (
    <div className="grid-container">
      <Header />
      <Sidebar />
      <MainContent />
    </div>
  );
};

export default App;
