import React from 'react';

interface ParameterInputProps {
  label: string;
  placeholder?: string;
}

const ParameterInput: React.FC<ParameterInputProps> = ({
  label,
  placeholder = 'Данные'
}) => {
  return (
    <div className="parameter-input">
      <label>{label}</label>
      <input type="text" placeholder={placeholder} />
    </div>
  );
};

export default ParameterInput;
