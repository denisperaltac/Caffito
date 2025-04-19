import React, { useState } from "react";
import { Link } from "react-router-dom";

const NavigationMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { path: "/inventario/gestion-stock", label: "Gestión de Stock" },
    { path: "/inventario/movimiento-stock", label: "Movimiento Stock" },
    { path: "/inventario/productos", label: "Productos" },
    { path: "/inventario/etiquetas", label: "Etiquetas" },
    { path: "/inventario/proveedor", label: "Proveedor" },
    { path: "/inventario/categorias", label: "Categorías" },
    { path: "/inventario/marcas", label: "Marcas" },
    { path: "/inventario/rubro", label: "Rubro" },
    { path: "/inventario/impuesto", label: "Impuesto" },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1 focus:outline-none"
      >
        <span>Menú</span>
        <svg
          className={`h-5 w-5 transform transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NavigationMenu;
