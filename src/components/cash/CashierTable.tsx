import React from "react";
import {
  FaStore,
  FaCheckCircle,
  FaEye,
  FaExchangeAlt,
  FaTrash,
} from "react-icons/fa";
import { Tooltip } from "react-tooltip";
import { Caja } from "../../services/cajaService";
import Loader from "../common/Loader";

interface CashierTableProps {
  cajas: Caja[];
  onView: (caja: Caja) => void;
  onMovements: (caja: Caja) => void;
  onDelete: (caja: Caja) => void;
}

const formatDate = (dateString: string | null) => {
  if (!dateString) return { date: "-", time: "-" };
  const date = new Date(dateString);
  return {
    date: date.toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }),
    time: date.toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
};

const getShift = (dateString: string | null) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  const hour = date.getHours();
  return hour < 12 ? "M" : "T";
};

const formatCurrency = (amount: number | null) => {
  if (amount === null) return "-";
  return amount.toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
  });
};

const CashierTable: React.FC<CashierTableProps> = ({
  cajas,
  onView,
  onMovements,
  onDelete,
}) => {
  return (
    <div className="min-w-[95vw]">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
              User
            </th>
            <th className="px-4 py-2 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">
              Ubicación
            </th>
            <th className="px-4 py-2 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">
              Estado
            </th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
              Fecha inicio
            </th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
              Fecha cierre
            </th>
            <th className="px-4 py-2 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">
              Turno
            </th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
              Inicio
            </th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
              Total ingreso
            </th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
              Cierre
            </th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
              Arqueo
            </th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {cajas?.map((caja) => (
            <tr key={caja.id}>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                {caja.userLogin}
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                <div
                  data-tooltip-id={`punto-venta-${caja.id}`}
                  data-tooltip-content={caja.puntoDeVentaNombre}
                  className="flex items-center justify-center"
                >
                  <span className="text-gray-500 hover:text-gray-700 cursor-help">
                    <FaStore className="w-6 h-6" />
                  </span>
                </div>
                <Tooltip id={`punto-venta-${caja.id}`} />
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                <div
                  data-tooltip-id={`estado-${caja.id}`}
                  data-tooltip-content={
                    caja.enproceso ? "En proceso" : "Cerrado"
                  }
                  className="flex items-center justify-center"
                >
                  {caja.enproceso ? (
                    <span className="cursor-help">
                      <Loader size="md" />
                    </span>
                  ) : (
                    <span className="text-green-500 hover:text-green-600 cursor-help">
                      <FaCheckCircle size={24} />
                    </span>
                  )}
                </div>
                <Tooltip id={`estado-${caja.id}`} />
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                <div className="flex flex-col">
                  <span>{formatDate(caja.fecha).date}</span>
                  <span className="text-gray-500 text-sm">
                    {formatDate(caja.fecha).time}
                  </span>
                </div>
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                <div className="flex flex-col">
                  <span>{formatDate(caja.fechaCierre).date}</span>
                  <span className="text-gray-500 text-sm">
                    {formatDate(caja.fechaCierre).time}
                  </span>
                </div>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm flex text-center justify-center text-gray-900">
                <div
                  className={`font-medium text-white flex items-center justify-center p-2 w-8 h-8 rounded-md ${
                    getShift(caja.fecha) === "M"
                      ? "bg-sky-600"
                      : "bg-orange-600"
                  }`}
                >
                  {getShift(caja.fecha)}
                </div>
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                {formatCurrency(caja.inicio)}
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                {formatCurrency(caja.ingreso)}
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                {caja.cierre ? formatCurrency(caja.cierre) : "-"}
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-sm">
                {caja.cierre ? (
                  <span
                    className={`font-medium ${
                      caja.ingreso - caja.cierre >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {formatCurrency(caja.ingreso - caja.cierre)}
                  </span>
                ) : (
                  "-"
                )}
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onView(caja)}
                    className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                    data-tooltip-id={`view-${caja.id}`}
                    data-tooltip-content="Ver detalles"
                  >
                    <FaEye className="w-6 h-6" />
                  </button>
                  <Tooltip id={`view-${caja.id}`} />

                  <button
                    onClick={() => onMovements(caja)}
                    className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-md transition-colors"
                    data-tooltip-id={`mov-${caja.id}`}
                    data-tooltip-content="Ver movimientos"
                  >
                    <FaExchangeAlt className="w-6 h-6" />
                  </button>
                  <Tooltip id={`mov-${caja.id}`} />

                  <button
                    onClick={() => onDelete(caja)}
                    className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                    data-tooltip-id={`delete-${caja.id}`}
                    data-tooltip-content="Eliminar caja"
                  >
                    <FaTrash className="w-6 h-6" />
                  </button>
                  <Tooltip id={`delete-${caja.id}`} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CashierTable;
