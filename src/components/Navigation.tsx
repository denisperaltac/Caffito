import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import InventarioMenu from "./InventarioMenu";
import AccountMenu from "./AccountMenu";
import logo from "../assets/LogoCaffito.png";
import {
  FaHome,
  FaShoppingCart,
  FaCog,
  FaUsers,
  FaMoneyBillWave,
  FaChartBar,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import { FaCashRegister } from "react-icons/fa6";

const Navigation: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
      if (path === "/gastos") return `${baseClass} bg-red-600 text-white`;
      if (path === "/estadisticas")
        return `${baseClass} bg-teal-600 text-white`;
      if (path === "/cuenta") return `${baseClass} bg-orange-600 text-white`;
      return `${baseClass} bg-gray-700 text-white`;
    }

    return `${baseClass} text-gray-300 hover:bg-gray-700 hover:text-white`;
  };

  return (
    <nav className="bg-gray-800 w-full z-50">
      <div className="flex items-center justify-between h-16 w-full overflow-x-auto">
        <div className="flex items-center w-full">
          <div className="flex-shrink-0 px-5">
            <Link to="/" className="text-white font-bold">
              <img src={logo} alt="Logo" className="w-24 h-16" />
            </Link>
          </div>
          <div className="block w-full">
            <div className="flex w-full items-baseline justify-between space-x-4">
              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-4">
                <Link to="/" className={getNavItemClass("/")}>
                  <FaHome className="w-5 h-5" />
                  <span className="hidden xl:inline">Inicio</span>
                </Link>

                <InventarioMenu getNavItemClass={getNavItemClass} />

                <Link to="/caja/cierres" className={getNavItemClass("/caja")}>
                  <FaCashRegister className="w-5 h-5" />
                  <span className="hidden xl:inline">Caja</span>
                </Link>
                <Link to="/ventas" className={getNavItemClass("/ventas")}>
                  <FaShoppingCart className="w-5 h-5" />
                  <span className="hidden xl:inline">Ventas</span>
                </Link>
                <Link to="/clientes" className={getNavItemClass("/clientes")}>
                  <FaUsers className="w-5 h-5" />
                  <span className="hidden xl:inline">Clientes</span>
                </Link>
                <Link to="/gastos" className={getNavItemClass("/gastos")}>
                  <FaMoneyBillWave className="w-5 h-5" />
                  <span className="hidden xl:inline">Gastos</span>
                </Link>
                <Link
                  to="/estadisticas"
                  className={getNavItemClass("/estadisticas")}
                >
                  <FaChartBar className="w-5 h-5" />
                  <span className="hidden xl:inline">Estadísticas</span>
                </Link>
              </div>

              {/* Desktop Account Menu */}
              <div className="hidden md:block">
                <div className="flex items-center space-x-4">
                  <Link
                    to="/configuracion"
                    className={getNavItemClass("/configuracion")}
                  >
                    <FaCog className="w-5 h-5" />
                    <span className="hidden xl:inline">Configuración</span>
                  </Link>

                  <AccountMenu getNavItemClass={getNavItemClass} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center px-4">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-gray-300 hover:text-white p-2"
          >
            {isMobileMenuOpen ? (
              <FaTimes className="w-6 h-6" />
            ) : (
              <FaBars className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-gray-800">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link to="/" className={getNavItemClass("/")}>
              <FaHome className="w-5 h-5" />
              <span>Inicio</span>
            </Link>

            <InventarioMenu getNavItemClass={getNavItemClass} showText />

            <Link to="/caja/cierres" className={getNavItemClass("/caja")}>
              <FaCashRegister className="w-5 h-5" />
              <span>Caja</span>
            </Link>
            <Link to="/ventas" className={getNavItemClass("/ventas")}>
              <FaShoppingCart className="w-5 h-5" />
              <span>Ventas</span>
            </Link>
            <Link to="/clientes" className={getNavItemClass("/clientes")}>
              <FaUsers className="w-5 h-5" />
              <span>Clientes</span>
            </Link>
            <Link to="/gastos" className={getNavItemClass("/gastos")}>
              <FaMoneyBillWave className="w-5 h-5" />
              <span>Gastos</span>
            </Link>
            <Link
              to="/estadisticas"
              className={getNavItemClass("/estadisticas")}
            >
              <FaChartBar className="w-5 h-5" />
              <span>Estadísticas</span>
            </Link>
            <Link
              to="/configuracion"
              className={getNavItemClass("/configuracion")}
            >
              <FaCog className="w-5 h-5" />
              <span>Configuración</span>
            </Link>

            <AccountMenu getNavItemClass={getNavItemClass} showText />
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
