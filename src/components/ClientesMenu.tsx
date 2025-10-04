import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaUsers, FaList } from "react-icons/fa";

interface ClientesMenuProps {
  getNavItemClass: (path: string) => string;
  showText?: boolean;
  setIsMobileMenuOpen?: (open: boolean) => void;
}

const ClientesMenu: React.FC<ClientesMenuProps> = ({
  getNavItemClass,
  showText = false,
  setIsMobileMenuOpen,
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

  const menuItems = [
    {
      path: "/clientes",
      label: "Clientes",
      icon: FaUsers,
    },
    {
      path: "/clientes/cuentas-corrientes",
      label: "Cuentas Corrientes",
      icon: FaList,
    },
  ];

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={getNavItemClass("/clientes")}
      >
        <FaUsers className="w-5 h-5" />
        <span className="hidden xl:inline">Clientes</span>
        {showText && <span>Clientes</span>}
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
        <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-md shadow-lg py-1 z-50">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 px-4 py-2 text-sm ${
                  isActive
                    ? "bg-pink-100 text-pink-700 font-medium"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                onClick={() => {
                  setIsOpen(false);
                  setIsMobileMenuOpen?.(false);
                }}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ClientesMenu;
