import React from "react";
import logo from "./Image 16(1).png";

const Header: React.FC = () => {
  return (
    <header className="header">
      <div className="header-left">
        <img src={logo} alt="Логотип" className="header-logo" />
        <h1>КСАИ</h1>
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
        <button>Меню</button> {/* Кнопка бургер-меню или другое действие */}
      </div>
    </header>
  );
};

export default Header;
