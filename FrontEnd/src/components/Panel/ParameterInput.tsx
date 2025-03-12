import React from 'react';

interface ParameterInputProps {
  paramName: string;
  paramValue: string;
  onChangeValue: (newValue: string) => void;
}

const ParameterInput: React.FC<ParameterInputProps> = ({
  paramName,
  paramValue,
  onChangeValue
}) => {
  return (
    <div className="parameter-input">
      <label>{paramName}</label>
      <input
        type="text"
        value={paramValue}
        onChange={(e) => onChangeValue(e.target.value)}
      />
    </div>
  );
};

export default ParameterInput;
