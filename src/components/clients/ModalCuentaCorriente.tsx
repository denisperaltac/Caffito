import React, { useState, useEffect } from "react";
import {
  FaTimes,
  FaEye,
  FaDownload,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import {
  Cliente,
  CuentaCorriente,
  SaldoCuentaCorriente,
} from "../../types/cliente";
import { API_URL } from "../../constants/api";
import axiosInstance from "../../config/axiosConfig";
import Loader from "../common/Loader";
import { formatCurrency } from "../../utils/formatters";

interface ModalCuentaCorrienteProps {
  cliente: Cliente | null;
  open: boolean;
  onClose: () => void;
}

export const ModalCuentaCorriente: React.FC<ModalCuentaCorrienteProps> = ({
  cliente,
  open,
  onClose,
}) => {
  const [cuentaCorriente, setCuentaCorriente] = useState<CuentaCorriente[]>([]);
  const [saldo, setSaldo] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estados de paginación
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    if (open && cliente) {
      setCurrentPage(0); // Resetear a la primera página
      loadCuentaCorriente();
    }
  }, [open, cliente]);

  useEffect(() => {
    if (open && cliente) {
      loadCuentaCorriente();
    }
  }, [currentPage, pageSize]);

  const loadCuentaCorriente = async () => {
    if (!cliente) return;

    try {
      setLoading(true);
      setError(null);

      const [cuentaData, saldoData] = await Promise.all([
        axiosInstance.get<CuentaCorriente[]>(
          `${API_URL}/cuenta-corrientes?page=${currentPage}&size=${pageSize}&clienteId.equals=${cliente.id}&sort=id,desc`
        ),
        axiosInstance.get<SaldoCuentaCorriente>(
          `${API_URL}/cuenta-corrientes/${cliente.id}/saldo`
        ),
      ]);

      setCuentaCorriente(cuentaData.data);
      setSaldo(saldoData.data.saldo);

      // Obtener el total de elementos del header X-Total-Count
      const totalCount =
        cuentaData.headers["x-total-count"] || cuentaData.data.length;
      setTotalItems(parseInt(totalCount));
      setTotalPages(Math.ceil(parseInt(totalCount) / pageSize));
    } catch (err) {
      setError("Error al cargar la cuenta corriente");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-AR");
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(0); // Resetear a la primera página
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(0, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(0, endPage - maxVisiblePages + 1);
    }

    // Botón anterior
    pages.push(
      <button
        key="prev"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 0}
        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <FaChevronLeft className="w-4 h-4" />
      </button>
    );

    // Primera página
    if (startPage > 0) {
      pages.push(
        <button
          key="first"
          onClick={() => handlePageChange(0)}
          className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border-t border-b border-gray-300 hover:bg-gray-50"
        >
          1
        </button>
      );
      if (startPage > 1) {
        pages.push(
          <span
            key="dots1"
            className="px-3 py-2 text-sm text-gray-500 bg-white border-t border-b border-gray-300"
          >
            ...
          </span>
        );
      }
    }

    // Páginas visibles
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-2 text-sm font-medium border-t border-b border-gray-300 ${
            i === currentPage
              ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
              : "bg-white text-gray-500 hover:bg-gray-50"
          }`}
        >
          {i + 1}
        </button>
      );
    }

    // Última página
    if (endPage < totalPages - 1) {
      if (endPage < totalPages - 2) {
        pages.push(
          <span
            key="dots2"
            className="px-3 py-2 text-sm text-gray-500 bg-white border-t border-b border-gray-300"
          >
            ...
          </span>
        );
      }
      pages.push(
        <button
          key="last"
          onClick={() => handlePageChange(totalPages - 1)}
          className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border-t border-b border-gray-300 hover:bg-gray-50"
        >
          {totalPages}
        </button>
      );
    }

    // Botón siguiente
    pages.push(
      <button
        key="next"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages - 1}
        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-r-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <FaChevronRight className="w-4 h-4" />
      </button>
    );

    return (
      <div className="flex items-center justify-between mt-6">
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-700">
            Mostrando {currentPage * pageSize + 1} a{" "}
            {Math.min((currentPage + 1) * pageSize, totalItems)} de {totalItems}{" "}
            resultados
          </span>
          <select
            value={pageSize}
            onChange={(e) => handlePageSizeChange(parseInt(e.target.value))}
            className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={5}>5 por página</option>
            <option value={10}>10 por página</option>
            <option value={20}>20 por página</option>
            <option value={50}>50 por página</option>
          </select>
        </div>
        <div className="flex">{pages}</div>
      </div>
    );
  };

  if (!open || !cliente) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-[90%] max-w-6xl shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Cuenta Corriente - {cliente.nombre} {cliente.apellido}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <FaTimes className="w-6 h-6" />
            </button>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <div className="mb-4 p-4 bg-blue-50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-blue-800">
                Saldo Actual:
              </span>
              <span
                className={`text-2xl font-bold ${
                  saldo >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {formatCurrency(saldo)}
              </span>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader size="lg" />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Detalle
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Debe
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Haber
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Saldo
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {cuentaCorriente.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(item.fechaHora)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {item.detalle.trim()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                          {item.debe > 0 ? (
                            <span className="text-red-600 font-medium">
                              {formatCurrency(item.debe)}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                          {item.haber > 0 ? (
                            <span className="text-green-600 font-medium">
                              {formatCurrency(item.haber)}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                          <span
                            className={
                              item.saldo >= 0
                                ? "text-green-600"
                                : "text-red-600"
                            }
                          >
                            {formatCurrency(item.saldo)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {renderPagination()}
            </>
          )}

          <div className="flex justify-end mt-6">
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
