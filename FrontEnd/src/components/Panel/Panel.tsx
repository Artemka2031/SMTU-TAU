import React from 'react';
import ParameterInput from './ParameterInput';
import NoteInput from './NoteInput';
import GraphButton from './GraphButton';
import DeleteButton from './DeleteButton';
import { FaChartLine, FaImage, FaDownload } from 'react-icons/fa';

const Panel: React.FC = () => {
  const handleDelete = () => {
    console.log('Delete clicked');
  };

  return (
    <div className="panel">
        <h2><b>Панель параметров</b></h2>

      {/* Блок параметров располагается вверху */}
      <div className="parameters">
        <ParameterInput label="K" />
        <ParameterInput label="Xm" />
        <ParameterInput label="T" />
        <ParameterInput label="W0" />
        <ParameterInput label="Wn" />
        <ParameterInput label="Шаг" />
        <ParameterInput label="t" />
{/* 
        <ParameterInput label="Хуй" />
        <ParameterInput label="t" /> */}
      </div>

      {/* Блок с примечанием и кнопками – прижат к низу */}
      <div className="bottom-block">
        <NoteInput note="Примечание..." />
        <GraphButton text="Добавть график" icon={<FaChartLine />} />
        <GraphButton text="Экспорт PNG" icon={<FaImage />} />
        <GraphButton text="Экспорт SVG" icon={<FaDownload />} />
        <DeleteButton onDelete={handleDelete} />
      </div>
    </div>
  );
};

export default Panel;
