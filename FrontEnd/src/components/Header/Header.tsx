import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../store";
import { setActiveDirection } from "../../store/slices/directionSlice";
import Logo from "./Logo";
import { CiMenuBurger } from "react-icons/ci";
import HeadButton from "./Headbutton.tsx";

const Header: React.FC = () => {
  const dispatch = useDispatch();
  const activeDirection = useSelector((state: RootState) => state.direction.activeDirection);

  // Список направлений (можно вынести в initialState, если нужно)
  const directions = ["OA", "ТАУ Лин", "ТАУ Нелин", "ТДЗ"];

  const handleClick = (dir: string) => {
    dispatch(setActiveDirection(dir));
  };

  return (
    <header className="header">
      <div className="header-left">
        <Logo size={50} />
      </div>
      <div className="header-right">
        <nav>
          <ul className="nav-buttons">
            {directions.map((label) => (
              <li key={label}>
                <HeadButton
                  label={label}
                  isActive={activeDirection === label}
                  onClick={() => handleClick(label)}
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
