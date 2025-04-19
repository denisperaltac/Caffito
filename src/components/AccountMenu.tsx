import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaUser, FaCog, FaSignOutAlt, FaUserCircle } from "react-icons/fa";

const AccountMenu: React.FC<{ getNavItemClass: (path: string) => string }> = ({
  getNavItemClass,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const menuRef = useRef<HTMLDivElement>(null);

  // Cerrar el menú cuando cambia la ruta
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Cerrar el menú cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div
      className={getNavItemClass("/cuenta")}
      onClick={() => setIsOpen(!isOpen)}
    >
      <FaUserCircle className="w-5 h-5" />
      <div className="relative" ref={menuRef}>
        <button className="flex items-center gap-2">
          Cuenta
          <svg
            className={`w-4 h-4 transition-transform ${
              isOpen ? "transform rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
            <Link
              to="/cuenta/perfil"
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => setIsOpen(false)}
            >
              <FaUser className="w-4 h-4" />
              Perfil
            </Link>
            <Link
              to="/cuenta/configuracion"
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => setIsOpen(false)}
            >
              <FaCog className="w-4 h-4" />
              Configuración
            </Link>
            <Link
              to="/login"
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => setIsOpen(false)}
            >
              <FaSignOutAlt className="w-4 h-4" />
              Cerrar Sesión
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountMenu;
