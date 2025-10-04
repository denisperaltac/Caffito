import { useState, useEffect } from "react";
import {
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
import InvoiceDetailsModal from "../cash/InvoiceDetailsModal";
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
  clienteId?: number;
  clienteNombre?: string;
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

const CuentasCorrientes = () => {
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
  const [fechaDesde, setFechaDesde] = useState<string>("");
  const [fechaHasta, setFechaHasta] = useState<string>("");

  useEffect(() => {
    loadMovimientos();
  }, [currentPage, sortConfig, fechaDesde, fechaHasta]);

  const loadMovimientos = async () => {
    try {
      setLoading(true);

      // Construir parámetros de fecha
      let fechaParams = "";
      if (fechaDesde) {
        // Convertir a formato ISO con zona horaria
        const fechaDesdeISO = new Date(`${fechaDesde}T00:00:00`).toISOString();
        fechaParams += `&fechaCreacion.greaterThanOrEqual=${fechaDesdeISO}`;
      }
      if (fechaHasta) {
        // Convertir a formato ISO con zona horaria
        const fechaHastaISO = new Date(`${fechaHasta}T23:59:59`).toISOString();
        fechaParams += `&fechaCreacion.lessThanOrEqual=${fechaHastaISO}`;
      }

      const [movimientosResponse, countResponse] = await Promise.all([
        axiosInstance.get<CajaRenglon[]>(
          `${API_URL}/caja-renglons?page=${currentPage}&size=${ITEMS_PER_PAGE}&tipoPagoId.equals=4&sort=${sortConfig.key},${sortConfig.direction}&sort=id${fechaParams}`
        ),
        axiosInstance.get<number>(
          `${API_URL}/caja-renglons/count?tipoPagoId.equals=4${fechaParams}`
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

  const handleFechaChange = () => {
    setCurrentPage(0); // Reset to first page when filtering
  };

  const limpiarFiltros = () => {
    setFechaDesde("");
    setFechaHasta("");
    setCurrentPage(0);
  };

  return (
    <div className="min-w-[95vw]">
      <div className="flex justify-between items-center w-full">
        <h1 className="text-2xl font-bold text-gray-800">
          Ventas a Cuenta Corriente
        </h1>

        {/* Filtros de fecha */}
        <div className="bg-gray-50 p-4 rounded-lg w-full">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <label
                htmlFor="fechaDesde"
                className="text-sm font-medium text-gray-700"
              >
                Desde:
              </label>
              <input
                type="date"
                id="fechaDesde"
                value={fechaDesde}
                onChange={(e) => {
                  setFechaDesde(e.target.value);
                  handleFechaChange();
                }}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center gap-2">
              <label
                htmlFor="fechaHasta"
                className="text-sm font-medium text-gray-700"
              >
                Hasta:
              </label>
              <input
                type="date"
                id="fechaHasta"
                value={fechaHasta}
                onChange={(e) => {
                  setFechaHasta(e.target.value);
                  handleFechaChange();
                }}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <button
              onClick={limpiarFiltros}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors duration-200 text-sm"
            >
              Limpiar Filtros
            </button>

            {(fechaDesde || fechaHasta) && (
              <div className="text-sm text-gray-600">
                Filtros activos:
                {fechaDesde && ` Desde: ${fechaDesde}`}
                {fechaHasta && ` Hasta: ${fechaHasta}`}
              </div>
            )}
          </div>
        </div>
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
                  {/* <th
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
                  </th> */}
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
                    onClick={() => handleSort("clienteNombre")}
                  >
                    <div className="flex items-center">
                      Cliente
                      {getSortIcon("clienteNombre")}
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
                    {/* <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900">
                        {movimiento.id}
                      </td> */}
                    <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900">
                      {formatDateTime(movimiento.fechaCreacion)}
                    </td>
                    <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(movimiento.ingreso)}
                    </td>
                    {/* <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(movimiento.egreso)}
                    </td>
                    <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900">
                      {movimiento.descripcion?.trim()}
                    </td>

                    <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900">
                      {movimiento.tipoMovimientoNombre?.trim()}
                    </td> */}
                    <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900">
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
                    <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900">
                      {movimiento.clienteNombre?.trim() || "-"}
                    </td>
                    <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900">
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
      {selectedFacturaId && (
        <InvoiceDetailsModal
          facturaId={selectedFacturaId}
          onClose={() => setSelectedFacturaId(null)}
        />
      )}
    </div>
  );
};

export default CuentasCorrientes;
