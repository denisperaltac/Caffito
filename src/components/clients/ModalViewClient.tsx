import React from "react";
import {
  FaTimes,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaStore,
  FaBriefcase,
  FaCheck,
  FaTimes as FaTimesIcon,
} from "react-icons/fa";
import { Cliente } from "../../types/cliente";

interface ModalViewClientProps {
  cliente: Cliente | null;
  open: boolean;
  onClose: () => void;
}

export const ModalViewClient: React.FC<ModalViewClientProps> = ({
  cliente,
  open,
  onClose,
}) => {
  if (!open || !cliente) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-[90%] max-w-2xl shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl leading-6 font-medium text-gray-900">
              Detalles del Cliente
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <FaTimes className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Información básica */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-lg font-semibold text-gray-800 mb-3">
                Información Personal
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600">
                    ID
                  </label>
                  <p className="text-lg text-gray-900">{cliente.id}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">
                    Nombre Completo
                  </label>
                  <p className="text-lg text-gray-900">
                    {cliente.nombre} {cliente.apellido}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">
                    Tipo de Documento
                  </label>
                  <p className="text-lg text-gray-900">
                    {cliente.tipoDocumentoNombre || "No especificado"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">
                    Número de Documento
                  </label>
                  <p className="text-lg text-gray-900">
                    {cliente.numeroDocumento || "No especificado"}
                  </p>
                </div>
              </div>
            </div>

            {/* Información de contacto */}
            {(cliente.email || cliente.telefono) && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-lg font-semibold text-gray-800 mb-3">
                  Información de Contacto
                </h4>
                <div className="space-y-3">
                  {cliente.email && (
                    <div className="flex items-center space-x-3">
                      <FaEnvelope className="w-5 h-5 text-blue-600" />
                      <span className="text-gray-900">{cliente.email}</span>
                    </div>
                  )}
                  {cliente.telefono && (
                    <div className="flex items-center space-x-3">
                      <FaPhone className="w-5 h-5 text-green-600" />
                      <span className="text-gray-900">{cliente.telefono}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Dirección */}
            {(cliente.calle || cliente.numeroCalle || cliente.piso) && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-lg font-semibold text-gray-800 mb-3">
                  Dirección
                </h4>
                <div className="flex items-start space-x-3">
                  <FaMapMarkerAlt className="w-5 h-5 text-red-600 mt-1" />
                  <div className="text-gray-900">
                    {cliente.calle && (
                      <p>
                        {cliente.calle} {cliente.numeroCalle}
                      </p>
                    )}
                    {cliente.piso && <p>Piso: {cliente.piso}</p>}
                    {cliente.localidadId && (
                      <p>
                        {cliente.localidadId.nombre},{" "}
                        {cliente.localidadId.departamentoId.nombre},{" "}
                        {cliente.localidadId.departamentoId.provinciaId.nombre}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Roles y estado */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-lg font-semibold text-gray-800 mb-3">
                Roles y Estado
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-3">
                  <FaStore
                    className={`w-5 h-5 ${
                      cliente.mayorista ? "text-blue-600" : "text-gray-400"
                    }`}
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-600">
                      Mayorista
                    </label>
                    <p className="text-lg text-gray-900">
                      {cliente.mayorista ? "Sí" : "No"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <FaBriefcase
                    className={`w-5 h-5 ${
                      cliente.empleado ? "text-green-600" : "text-gray-400"
                    }`}
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-600">
                      Empleado
                    </label>
                    <p className="text-lg text-gray-900">
                      {cliente.empleado ? "Sí" : "No"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {cliente.activo ? (
                    <FaCheck className="w-5 h-5 text-green-600" />
                  ) : (
                    <FaTimesIcon className="w-5 h-5 text-red-600" />
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-600">
                      Estado
                    </label>
                    <p
                      className={`text-lg font-medium ${
                        cliente.activo ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {cliente.activo ? "Activo" : "Inactivo"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-8">
            <button
              onClick={onClose}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
