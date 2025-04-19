import React from "react";
import { Link, useLocation } from "react-router-dom";
import InventarioMenu from "./InventarioMenu";
import AccountMenu from "./AccountMenu";
import logo from "../assets/LogoCaffito.png";
import {
  FaHome,
  FaCashRegister,
  FaShoppingCart,
  FaCog,
  FaUsers,
} from "react-icons/fa";

const Navigation: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const getNavItemClass = (path: string) => {
    const baseClass =
      "px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 cursor-pointer";
    const isActive =
      path === "/" ? currentPath === "/" : currentPath.startsWith(path);

    if (isActive) {
      if (path === "/") return `${baseClass} bg-blue-600 text-white`;
      if (path === "/inventario")
        return `${baseClass} bg-indigo-600 text-white`;
      if (path === "/caja") return `${baseClass} bg-green-600 text-white`;
      if (path === "/ventas") return `${baseClass} bg-purple-600 text-white`;
      if (path === "/clientes") return `${baseClass} bg-pink-600 text-white`;
      if (path === "/configuracion")
        return `${baseClass} bg-yellow-600 text-white`;
      if (path === "/cuenta") return `${baseClass} bg-orange-600 text-white`;
      return `${baseClass} bg-gray-700 text-white`;
    }

    return `${baseClass} text-gray-300 hover:bg-gray-700 hover:text-white`;
  };

  return (
    <nav className="bg-gray-800">
      <div className="max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link to="/" className="text-white font-bold">
                <img src={logo} alt="Logo" className="w-24 h-16" />
              </Link>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link to="/" className={getNavItemClass("/")}>
                  <FaHome className="w-5 h-5" />
                  Inicio
                </Link>

                <InventarioMenu getNavItemClass={getNavItemClass} />

                <Link to="/caja/cierres" className={getNavItemClass("/caja")}>
                  <FaCashRegister className="w-5 h-5" />
                  Caja
                </Link>
                <Link to="/ventas" className={getNavItemClass("/ventas")}>
                  <FaShoppingCart className="w-5 h-5" />
                  Ventas
                </Link>
                <Link to="/clientes" className={getNavItemClass("/clientes")}>
                  <FaUsers className="w-5 h-5" />
                  Clientes
                </Link>
                <Link
                  to="/configuracion"
                  className={getNavItemClass("/configuracion")}
                >
                  <FaCog className="w-5 h-5" />
                  Configuración
                </Link>

                <AccountMenu getNavItemClass={getNavItemClass} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
