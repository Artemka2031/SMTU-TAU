import React from "react";

interface NonlinearityButtonProps {
    label: string;
    isSelected: boolean;
    onClick: () => void;
}

const NonlinearityButton: React.FC<NonlinearityButtonProps> = ({label, isSelected, onClick}) => {
    const handleClick = () => {
        console.log(`Клик по кнопке нелинейности: ${label}, isSelected: ${isSelected}`);
        onClick();
    };

    return (
        <button
            className={`nonlinearity-button ${isSelected ? "active" : ""}`}
            onClick={handleClick}
        >
            {label}
        </button>
    );
};

export default NonlinearityButton;