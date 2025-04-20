import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaBoxes,
  FaExchangeAlt,
  FaChartLine,
  FaClipboardList,
  FaTags,
  FaTruck,
  FaLayerGroup,
  FaTag,
  FaPercentage,
} from "react-icons/fa";

const InventarioMenu: React.FC<{
  getNavItemClass: (path: string) => string;
}> = ({ getNavItemClass }) => {
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
      path: "/inventario/gestion-stock",
      label: "Gestión de Stock",
      icon: FaBoxes,
    },
    {
      path: "/inventario/movimiento-stock",
      label: "Movimiento Stock",
      icon: FaExchangeAlt,
    },
    { path: "/inventario/productos", label: "Productos", icon: FaBoxes },
    { path: "/inventario/etiquetas", label: "Etiquetas", icon: FaTags },
    { path: "/inventario/proveedor", label: "Proveedor", icon: FaTruck },
    { path: "/inventario/categorias", label: "Categorías", icon: FaLayerGroup },
    { path: "/inventario/marcas", label: "Marcas", icon: FaTag },
    { path: "/inventario/rubro", label: "Rubro", icon: FaLayerGroup },
    { path: "/inventario/impuesto", label: "Impuesto", icon: FaPercentage },
  ];

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={getNavItemClass("/inventario")}
      >
        <FaBoxes className="w-5 h-5" />
        <span className="hidden lg:inline">Inventario</span>
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
            return (
              <Link
                key={item.path}
                to={item.path}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setIsOpen(false)}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default InventarioMenu;
