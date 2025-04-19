import React from "react";
import { Outlet, Link } from "react-router-dom";

const ConfigurationPage: React.FC = () => {
  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-4">Configuración</h2>
          <nav className="space-y-2">
            <Link
              to="/configuracion/puntos-venta"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
            >
              Puntos de Venta
            </Link>
            <Link
              to="/configuracion/promocion"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
            >
              Promoción
            </Link>
            <Link
              to="/configuracion/tipo-pago"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
            >
              Tipo Pago
            </Link>
            <Link
              to="/configuracion/provincia"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
            >
              Provincia
            </Link>
            <Link
              to="/configuracion/departamento"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
            >
              Departamento
            </Link>
            <Link
              to="/configuracion/localidad"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
            >
              Localidad
            </Link>
            <Link
              to="/configuracion/tipo-documento"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
            >
              Tipo Documento
            </Link>
            <Link
              to="/configuracion/organizacion"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
            >
              Organización
            </Link>
            <Link
              to="/configuracion/condicion-iva"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
            >
              Condición IVA
            </Link>
            <Link
              to="/configuracion/tipo-comprobante"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
            >
              Tipo Comprobante
            </Link>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        <Outlet />
      </div>
    </div>
  );
};

export default ConfigurationPage;
