import React from "react";
import { Link, useLocation } from "react-router-dom";
import NavigationMenu from "./NavigationMenu";
import logo from "../assets/LogoCaffito.png";

const Navigation: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const getNavItemClass = (path: string) => {
    const baseClass = "px-3 py-2 rounded-md text-sm font-medium";
    const isActive =
      path === "/" ? currentPath === "/" : currentPath.startsWith(path);

    if (isActive) {
      if (path === "/") return `${baseClass} bg-blue-600 text-white`;
      if (path === "/inventario")
        return `${baseClass} bg-indigo-600 text-white`;
      if (path === "/caja") return `${baseClass} bg-green-600 text-white`;
      if (path === "/ventas") return `${baseClass} bg-purple-600 text-white`;
      if (path === "/configuracion")
        return `${baseClass} bg-yellow-600 text-white`;
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
                  Inicio
                </Link>
                <div className={getNavItemClass("/inventario")}>
                  <NavigationMenu />
                </div>
                <Link to="/caja/cierres" className={getNavItemClass("/caja")}>
                  Caja
                </Link>
                <Link to="/ventas" className={getNavItemClass("/ventas")}>
                  Ventas
                </Link>
                <Link
                  to="/configuracion"
                  className={getNavItemClass("/configuracion")}
                >
                  Configuración
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
