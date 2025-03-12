import React, { useState } from "react";
import Logo from "./Logo"; // Импортируем новый компонентimport { CiMenuBurger } from "react-icons/ci";
import HeadButton from "./Headbutton"; // Импортируем новый компонент
import { CiMenuBurger } from "react-icons/ci";

const Header: React.FC = () => {
  const [activeButton, setActiveButton] = useState("ТАУ Лин"); // Следим за активной кнопкой

  return (
    <header className="header">
      <div className="header-left">
        <Logo size={50}/> {/* Используем новый компонент */}
      </div>
      <div className="header-right">
        <nav>
          <ul className="nav-buttons">
            {["OA", "ТАУ Лин", "ТАУ Нелин", "ТДЗ"].map((label) => (
              <li key={label}>
                <HeadButton
                  label={label}
                  isActive={activeButton === label}
                  onClick={() => setActiveButton(label)}
                />
              </li>
            ))}
          </ul>
        </nav>
        <button className="menu-button">
          <CiMenuBurger size={20} />
        </button>
      </div>
    </header>
  );
};

export default Header;
