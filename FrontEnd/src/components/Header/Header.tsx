import React from "react";
import { SlAnchor } from "react-icons/sl";
import { CiMenuBurger } from "react-icons/ci";

const Header: React.FC = () => {
  return (
    <header className="header">
      <div className="header-left">
        <SlAnchor className="header-logo" size={40}/>      
        <h1 >КСАИ</h1>
      </div>
      <div className="header-right">
        <nav>
          <ul style={{ display: "flex", gap: "16px", listStyle: "none", padding: 0 }}>
          <li><button onClick={() => alert("OA Clicked!")}>OA</button></li>
          <li><button onClick={() => alert("ТАУ Лин Clicked!")}>ТАУ Лин</button></li>
          <li><button onClick={() => alert("ТАУ Нелин Clicked!")}>ТАУ Нелин</button></li>
          <li><button onClick={() => alert("ТДЗ Clicked!")}>ТДЗ</button></li>
          </ul>
        </nav>
        <button><CiMenuBurger className="header-logo" size={20}/>      
        </button> {/* Кнопка бургер-меню или другое действие */}
      </div>
    </header>
  );
};

export default Header;
