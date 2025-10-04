import React, { useState, useEffect } from "react";
import {
  FaTimes,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaMoneyBillWave,
  FaCreditCard,
  FaExchangeAlt,
} from "react-icons/fa";
import { FaRegRectangleList } from "react-icons/fa6";
import { LuTruck } from "react-icons/lu";
import axiosInstance from "../../config/axiosConfig";
import { API_URL } from "../../constants/api";
import { Caja } from "../../services/cajaService";
import InvoiceDetailsModal from "./InvoiceDetailsModal";
import Loader from "../common/Loader";
import { Pagination } from "../common/Pagination";

interface CajaRenglon {
  id: number;
  ingreso: number;
  egreso: number;
  descripcion: string;
  cajaId: number;
  tipoMovimientoId: number;
  facturaId: number;
  tipoPagoId: number;
  tipoMovimientoNombre: string;
  tipoPagoNombre: string;
  fechaCreacion?: string | null;
}

interface CashierMovementsModalProps {
  caja: Caja;
  onClose: () => void;
}

const ITEMS_PER_PAGE = 8;

const formatCurrency = (amount: number) => {
  return amount?.toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
  });
};

const formatDateTime = (iso?: string | null) => {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString("es-AR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const normalizePaymentName = (nombre?: string) =>
  (nombre || "").toLowerCase().replace(/\s+/g, "");

const getTipoPagoIcon = (nombre?: string) => {
  switch (normalizePaymentName(nombre)) {
    case "efectivo":
      return <FaMoneyBillWave />;
    case "tarjetadebito":
      return <FaCreditCard />;
    case "tarjetacredito":
      return <FaExchangeAlt />;
    case "cuentacorriente":
      return <FaRegRectangleList />;
    default:
      return <LuTruck />;
  }
};

const getTipoPagoColor = (nombre?: string) => {
  switch (normalizePaymentName(nombre)) {
    case "efectivo":
      return "bg-green-500 hover:bg-green-600";
    case "tarjetadebito":
      return "bg-blue-500 hover:bg-blue-600";
    case "tarjetacredito":
      return "bg-purple-500 hover:bg-purple-600";
    case "cuentacorriente":
      return "bg-red-500 hover:bg-red-600";
    default:
      return "bg-yellow-500 hover:bg-yellow-600";
  }
};

interface SortConfig {
  key: string;
  direction: "asc" | "desc";
}

const CashierMovementsModal: React.FC<CashierMovementsModalProps> = ({
  caja,
  onClose,
}) => {
  const [movimientos, setMovimientos] = useState<CajaRenglon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: "id",
    direction: "desc",
  });
  const [selectedFacturaId, setSelectedFacturaId] = useState<number | null>(
    null
  );

  useEffect(() => {
    loadMovimientos();
  }, [caja.id, currentPage, sortConfig]);

  const loadMovimientos = async () => {
    try {
      setLoading(true);
      const [movimientosResponse, countResponse] = await Promise.all([
        axiosInstance.get<CajaRenglon[]>(
          `${API_URL}/caja-renglons?page=${currentPage}&size=${ITEMS_PER_PAGE}&cajaId.equals=${caja.id}&sort=${sortConfig.key},${sortConfig.direction}&sort=id`
        ),
        axiosInstance.get<number>(
          `${API_URL}/caja-renglons/count?cajaId.equals=${caja.id}`
        ),
      ]);
      setMovimientos(movimientosResponse.data);
      setTotalItems(countResponse.data);
      setError(null);
    } catch (err) {
      setError("Error al cargar los movimientos");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (key: string) => {
    setCurrentPage(0); // Reset to first page when sorting
    setSortConfig((prevConfig) => ({
      key,
      direction:
        prevConfig.key === key && prevConfig.direction === "asc"
          ? "desc"
          : "asc",
    }));
  };

  const getSortIcon = (key: string) => {
    if (sortConfig.key !== key) {
      return (
        <span className="ml-1 text-gray-400">
          <FaSort />
        </span>
      );
    }
    return sortConfig.direction === "asc" ? (
      <span className="ml-1 text-blue-500">
        <FaSortUp />
      </span>
    ) : (
      <span className="ml-1 text-blue-500">
        <FaSortDown />
      </span>
    );
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < Math.ceil(totalItems / ITEMS_PER_PAGE)) {
      setCurrentPage(newPage);
    }
  };

  const handleFacturaClick = (facturaId: number) => {
    setSelectedFacturaId(facturaId);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-[95vw] h-[95vh] overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            Movimientos de Caja #{caja.id}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <span className="text-xl">
              <FaTimes />
            </span>
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded m-4">
            {error}
          </div>
        )}

        <div className="p-4 overflow-auto h-[90%]">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <Loader size="lg" />
            </div>
          ) : (
            <div className="flex flex-col justify-between h-full overflow-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {/* <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort("id")}
                    >
                      <div className="flex items-center">
                        ID
                        {getSortIcon("id")}
                      </div>
                    </th> */}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hover:bg-gray-100">
                      <div className="flex items-center">Fecha / Hora</div>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort("ingreso")}
                    >
                      <div className="flex items-center">
                        Ingreso
                        {getSortIcon("ingreso")}
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort("egreso")}
                    >
                      <div className="flex items-center">
                        Egreso
                        {getSortIcon("egreso")}
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort("descripcion")}
                    >
                      <div className="flex items-center">
                        Descripción
                        {getSortIcon("descripcion")}
                      </div>
                    </th>

                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort("tipoMovimientoNombre")}
                    >
                      <div className="flex items-center">
                        Tipo Movimiento
                        {getSortIcon("tipoMovimientoNombre")}
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort("facturaId")}
                    >
                      <div className="flex items-center">
                        Factura
                        {getSortIcon("facturaId")}
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort("tipoPagoNombre")}
                    >
                      <div className="flex items-center">
                        Tipo Pago
                        {getSortIcon("tipoPagoNombre")}
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {movimientos?.map((movimiento) => (
                    <tr key={movimiento.id} className="hover:bg-gray-50">
                      {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {movimiento.id}
                      </td> */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDateTime(movimiento.fechaCreacion)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(movimiento.ingreso)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(movimiento.egreso)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {movimiento.descripcion?.trim()}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {movimiento.tipoMovimientoNombre?.trim()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {movimiento.facturaId ? (
                          <button
                            onClick={() =>
                              handleFacturaClick(movimiento.facturaId)
                            }
                            className="text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            {movimiento.facturaId}
                          </button>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {movimiento.tipoPagoNombre ? (
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-white text-xs font-medium transition-colors duration-200 ${getTipoPagoColor(
                              movimiento.tipoPagoNombre
                            )}`}
                          >
                            <span className="mr-1">
                              {getTipoPagoIcon(movimiento.tipoPagoNombre)}
                            </span>
                            <span>{movimiento.tipoPagoNombre.trim()}</span>
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div>
                <Pagination
                  currentPage={currentPage}
                  totalItems={totalItems}
                  setCurrentPage={handlePageChange}
                  totalPages={Math.ceil(totalItems / ITEMS_PER_PAGE)}
                />
              </div>
            </div>
          )}
        </div>
      </div>
      {selectedFacturaId && (
        <InvoiceDetailsModal
          facturaId={selectedFacturaId}
          onClose={() => setSelectedFacturaId(null)}
        />
      )}
    </div>
  );
};

export default CashierMovementsModal;
