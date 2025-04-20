import React, { useState, useEffect } from "react";
import {
  FaEdit,
  FaTrash,
  FaUser,
  FaUserTie,
  FaCheck,
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaIdCard,
  FaUserAlt,
  FaFileAlt,
  FaStore,
  FaBriefcase,
  FaToggleOn,
  FaCog,
} from "react-icons/fa";
import { Tooltip } from "react-tooltip";
import Loader from "../../components/common/Loader";
import {
  clientService,
  Cliente,
  GetClientesParams,
} from "../../services/clientService";

const ITEMS_PER_PAGE = 10;

type SortField =
  | "id"
  | "nombre"
  | "apellido"
  | "tipoDocumentoNombre"
  | "numeroDocumento"
  | "mayorista"
  | "empleado"
  | "activo";
type SortDirection = "asc" | "desc";

const ClientsPage: React.FC = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [sortField, setSortField] = useState<SortField>("id");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  useEffect(() => {
    loadClientes();
  }, [currentPage, sortField, sortDirection]);

  const loadClientes = async () => {
    try {
      setLoading(true);
      const params: GetClientesParams = {
        page: currentPage,
        size: ITEMS_PER_PAGE,
        sort: `${sortField},${sortDirection}`,
      };

      const [clientesData, count] = await Promise.all([
        clientService.getClientes(params),
        clientService.getCountClientes(),
      ]);

      setClientes(clientesData);
      setTotalItems(count);
      setTotalPages(Math.ceil(count / ITEMS_PER_PAGE));
      setError(null);
    } catch (err) {
      setError("Error al cargar los clientes");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (cliente: Cliente) => {
    // TODO: Implementar edición de cliente
    console.log("Editar cliente:", cliente);
  };

  const handleDelete = async (cliente: Cliente) => {
    if (
      window.confirm(
        `¿Estás seguro de que deseas eliminar al cliente ${cliente.nombre.trim()}?`
      )
    ) {
      try {
        await clientService.deleteCliente(cliente.id);
        await loadClientes();
      } catch (error) {
        console.error("Error al eliminar el cliente:", error);
      }
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
    }
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

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(0, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(0, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-1 rounded-md ${
            currentPage === i
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-700 hover:bg-gray-300"
          }`}
        >
          {i + 1}
        </button>
      );
    }

    return (
      <div className="flex items-center justify-center space-x-2 mt-4">
        <button
          onClick={() => handlePageChange(0)}
          disabled={currentPage === 0}
          className="p-2 rounded-md bg-white text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="w-4 h-4">
            <FaChevronLeft />
          </span>
        </button>
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 0}
          className="p-2 rounded-md bg-white text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Anterior
        </button>
        {startPage > 0 && (
          <>
            <button
              onClick={() => handlePageChange(0)}
              className="px-3 py-1 rounded-md bg-white text-gray-700 hover:bg-gray-300"
            >
              1
            </button>
            {startPage > 1 && <span className="px-2">...</span>}
          </>
        )}
        {pages}
        {endPage < totalPages - 1 && (
          <>
            {endPage < totalPages - 2 && <span className="px-2">...</span>}
            <button
              onClick={() => handlePageChange(totalPages - 1)}
              className="px-3 py-1 rounded-md bg-white text-gray-700 hover:bg-gray-300"
            >
              {totalPages}
            </button>
          </>
        )}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages - 1}
          className="p-2 rounded-md bg-white text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Siguiente
        </button>
        <button
          onClick={() => handlePageChange(totalPages - 1)}
          disabled={currentPage === totalPages - 1}
          className="p-2 rounded-md bg-white text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="w-4 h-4">
            <FaChevronRight />
          </span>
        </button>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="container px-4 w-[100vw]">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Clientes</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg overflow-hidden w-[95vw]">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-300"
                  onClick={() => handleSort("id")}
                >
                  <div className="flex items-center space-x-1">
                    <FaIdCard className="w-4 h-4" />
                    <span>ID</span>
                    {renderSortIcon("id")}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-300"
                  onClick={() => handleSort("nombre")}
                >
                  <div className="flex items-center space-x-1">
                    <FaUserAlt className="w-4 h-4" />
                    <span>Nombre</span>
                    {renderSortIcon("nombre")}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-300"
                  onClick={() => handleSort("apellido")}
                >
                  <div className="flex items-center space-x-1">
                    <FaUserAlt className="w-4 h-4" />
                    <span>Apellido</span>
                    {renderSortIcon("apellido")}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center space-x-1">
                    <FaIdCard className="w-4 h-4" />
                    <span>Documento</span>
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center space-x-2">
                    <FaStore className="w-4 h-4" />
                    <FaBriefcase className="w-4 h-4" />
                    <span>Roles</span>
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-300"
                  onClick={() => handleSort("activo")}
                >
                  <div className="flex items-center space-x-1">
                    <FaToggleOn className="w-4 h-4" />
                    <span>Activo</span>
                    {renderSortIcon("activo")}
                  </div>
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center justify-end space-x-1">
                    <FaCog className="w-4 h-4" />
                    <span>Acciones</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {clientes?.map((cliente) => (
                <tr key={cliente.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {cliente.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {cliente.nombre.trim()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {cliente.apellido.trim()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {cliente.tipoDocumentoNombre
                      ? `${
                          cliente.tipoDocumentoNombre
                        } - ${cliente.numeroDocumento.trim()}`
                      : cliente.numeroDocumento?.trim() || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center space-x-4">
                      <div
                        className="flex items-center space-x-1"
                        data-tooltip-id={`mayorista-${cliente.id}`}
                        data-tooltip-content={
                          cliente.mayorista ? "Mayorista" : "No es mayorista"
                        }
                      >
                        <FaStore
                          className={`w-5 h-5 ${
                            cliente.mayorista
                              ? "text-blue-600"
                              : "text-gray-400"
                          }`}
                        />
                      </div>
                      <Tooltip id={`mayorista-${cliente.id}`} />
                      <div
                        className="flex items-center space-x-1"
                        data-tooltip-id={`empleado-${cliente.id}`}
                        data-tooltip-content={
                          cliente.empleado ? "Empleado" : "No es empleado"
                        }
                      >
                        <FaBriefcase
                          className={`w-5 h-5 ${
                            cliente.empleado
                              ? "text-green-600"
                              : "text-gray-400"
                          }`}
                        />
                      </div>
                      <Tooltip id={`empleado-${cliente.id}`} />
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {cliente.activo ? (
                      <FaCheck className="w-5 h-5 text-green-600" />
                    ) : (
                      <FaTimes className="w-5 h-5 text-red-600" />
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
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
        </div>
      </div>

      {renderPagination()}
      <div className="text-center text-sm text-gray-500 mt-2">
        Mostrando {clientes?.length} de {totalItems} clientes
      </div>
    </div>
  );
};

export default ClientsPage;
