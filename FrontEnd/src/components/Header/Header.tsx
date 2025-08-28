import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../store";
import { setActiveDirection } from "../../store/slices/directionSlice";
import Logo from "./Logo";
import { CiMenuBurger } from "react-icons/ci";
import HeadButton from "./Headbutton.tsx";

const Header: React.FC = () => {
  const dispatch = useDispatch();
  const { activeDirection, directions } = useSelector((state: RootState) => state.direction);
  const directionNames = directions.map((d) => d.name);

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
            {directionNames.map((label) => (
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
