import { useState } from "react";
import {
  FaEdit,
  FaTrash,
  FaCheck,
  FaTimes,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaIdCard,
  FaUserAlt,
  FaStore,
  FaBriefcase,
  FaToggleOn,
  FaCog,
} from "react-icons/fa";
import { Tooltip } from "react-tooltip";
import { Cliente } from "../../services/clientService";
import { SortField } from "../../types/cliente";
import { ModalEditClient } from "./ModalEditClient";
import { ModalDeactivateClient } from "./ModalDeactivateClient";

interface TableClientsProps {
  loadClientes: () => Promise<void>;
  sortDirection: string;
  sortField: string;
  setSortField: (field: string) => void;
  setSortDirection: (direction: string) => void;
  clientes: Cliente[];
}
export const TableClients = ({
  loadClientes,
  sortDirection,
  sortField,
  setSortField,
  setSortDirection,
  clientes,
}: TableClientsProps) => {
  const [selectedClient, setSelectedClient] = useState<Cliente | null>(null);
  const [open, setOpen] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);

  const handleEdit = (cliente: Cliente) => {
    setSelectedClient(cliente);
    setOpen(true);
  };

  const handleDelete = async (cliente: Cliente) => {
    setSelectedClient(cliente);
    setOpenDelete(true);
  };

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const renderSortIcon = (field: SortField) => {
    if (field !== sortField) {
      return <FaSort className="w-4 h-4 text-gray-400" />;
    }
    return sortDirection === "asc" ? (
      <FaSortUp className="w-4 h-4 text-blue-600" />
    ) : (
      <FaSortDown className="w-4 h-4 text-blue-600" />
    );
  };

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden w-[95vw] overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th
              className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-300"
              onClick={() => handleSort("id")}
            >
              <div className="flex items-center space-x-1 md:gap-2">
                <FaIdCard className="w-4 h-4" />
                <span>ID</span>
                {renderSortIcon("id")}
              </div>
            </th>
            <th
              className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-300"
              onClick={() => handleSort("nombre")}
            >
              <div className="flex items-center space-x-1 md:gap-2">
                <FaUserAlt className="w-4 h-4" />
                <span>Nombre</span>
                {renderSortIcon("nombre")}
              </div>
            </th>
            <th
              className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-300"
              onClick={() => handleSort("apellido")}
            >
              <div className="flex items-center space-x-1 md:gap-2">
                <FaUserAlt className="w-4 h-4" />
                <span>Apellido</span>
                {renderSortIcon("apellido")}
              </div>
            </th>
            <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
              <div className="flex items-center space-x-1 md:gap-2">
                <FaIdCard className="w-4 h-4" />
                <span>Documento</span>
              </div>
            </th>
            <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
              <div className="flex items-center space-x-2">
                <FaStore className="w-4 h-4" />
                <FaBriefcase className="w-4 h-4" />
                <span>Roles</span>
              </div>
            </th>
            <th
              className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-300"
              onClick={() => handleSort("activo")}
            >
              <div className="flex items-center space-x-1 md:gap-2">
                <FaToggleOn className="w-4 h-4" />
                <span>Activo</span>
                {renderSortIcon("activo")}
              </div>
            </th>
            <th className="px-6 py-3 text-right text-sm font-medium text-gray-500 uppercase tracking-wider">
              <div className="flex items-center justify-end space-x-1 md:gap-2">
                <FaCog className="w-4 h-4" />
                <span>Acciones</span>
              </div>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {clientes?.map((cliente) => (
            <tr key={cliente.id} className="hover:bg-gray-50">
              <td className="px-6 py-2 lg:py-3 whitespace-nowrap text-sm text-gray-900">
                {cliente.id}
              </td>
              <td className="px-6 py-2 lg:py-3 whitespace-nowrap text-sm text-gray-900">
                {cliente.nombre.trim()}
              </td>
              <td className="px-6 py-2 lg:py-3 whitespace-nowrap text-sm text-gray-900">
                {cliente.apellido.trim()}
              </td>
              <td className="px-6 py-2 lg:py-3 whitespace-nowrap text-sm text-gray-900">
                {cliente.tipoDocumentoNombre
                  ? `${
                      cliente.tipoDocumentoNombre
                    } - ${cliente.numeroDocumento.trim()}`
                  : cliente.numeroDocumento?.trim() || "-"}
              </td>
              <td className="px-6 py-2 lg:py-3 whitespace-nowrap text-sm text-gray-900">
                <div className="flex items-center space-x-4">
                  <div
                    className="flex items-center space-x-1 md:gap-2"
                    data-tooltip-id={`mayorista-${cliente.id}`}
                    data-tooltip-content={
                      cliente.mayorista ? "Mayorista" : "No es mayorista"
                    }
                  >
                    <FaStore
                      className={`w-5 h-5 ${
                        cliente.mayorista ? "text-blue-600" : "text-gray-400"
                      }`}
                    />
                  </div>
                  <Tooltip id={`mayorista-${cliente.id}`} />
                  <div
                    className="flex items-center space-x-1 md:gap-2"
                    data-tooltip-id={`empleado-${cliente.id}`}
                    data-tooltip-content={
                      cliente.empleado ? "Empleado" : "No es empleado"
                    }
                  >
                    <FaBriefcase
                      className={`w-5 h-5 ${
                        cliente.empleado ? "text-green-600" : "text-gray-400"
                      }`}
                    />
                  </div>
                  <Tooltip id={`empleado-${cliente.id}`} />
                </div>
              </td>
              <td className="px-6 py-2 lg:py-3 whitespace-nowrap text-sm text-gray-900">
                {cliente.activo ? (
                  <FaCheck className="w-5 h-5 text-green-600" />
                ) : (
                  <FaTimes className="w-5 h-5 text-red-600" />
                )}
              </td>
              <td className="px-6 py-2 lg:py-3 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex items-center justify-end space-x-2">
                  <button
                    onClick={() => handleEdit(cliente)}
                    className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                    data-tooltip-id={`edit-${cliente.id}`}
                    data-tooltip-content="Editar cliente"
                  >
                    <FaEdit className="w-5 h-5" />
                  </button>
                  <Tooltip id={`edit-${cliente.id}`} />

                  <button
                    onClick={() => handleDelete(cliente)}
                    className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                    data-tooltip-id={`delete-${cliente.id}`}
                    data-tooltip-content="Eliminar cliente"
                  >
                    <FaTrash className="w-5 h-5" />
                  </button>
                  <Tooltip id={`delete-${cliente.id}`} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <ModalEditClient
        client={selectedClient}
        open={open}
        onClose={() => setOpen(false)}
        loadClientes={loadClientes}
      />
      <ModalDeactivateClient
        client={selectedClient || ({} as Cliente)}
        open={openDelete}
        onClose={() => setOpenDelete(false)}
        loadClientes={loadClientes}
      />
    </div>
  );
};
