import React from "react";
import {
  FaTimes,
  FaMoneyBillWave,
  FaCreditCard,
  FaExchangeAlt,
} from "react-icons/fa";
import { FaRegRectangleList } from "react-icons/fa6";
import { LuTruck } from "react-icons/lu";
import { Caja } from "../../services/cajaService";
import { formatCurrency } from "../../utils/formatters";

interface CashierDetailsModalProps {
  caja: Caja;
  onClose: () => void;
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

const getTipoPagoIcon = (nombre: string) => {
  switch (nombre.toLowerCase().replace(/\s+/g, "")) {
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

const getTipoPagoColor = (nombre: string) => {
  switch (nombre.toLowerCase().replace(/\s+/g, "")) {
    case "efectivo":
      return "bg-green-100 text-green-800";
    case "tarjetadebito":
      return "bg-blue-100 text-blue-800";
    case "tarjetacredito":
      return "bg-purple-100 text-purple-800";
    case "cuentacorriente":
      return "bg-red-100 text-red-800";
    default:
      return "bg-yellow-100 text-gray-800";
  }
};

const CashierDetailsModal: React.FC<CashierDetailsModalProps> = ({
  caja,
  onClose,
}) => {
  const totalIngreso = caja.flujoCajas.reduce(
    (sum, flujo) => sum + flujo.pendiente,
    0
  );
  const totalIngresoDeclarado = caja.flujoCajas.reduce(
    (sum, flujo) => sum + flujo.ingresoEfectivo,
    0
  );
  const totalDiferencia = caja.flujoCajas.reduce(
    (sum, flujo) => sum + flujo.diferencia,
    0
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-11/12 max-w-4xl max-h-[90vh] overflow-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Detalles de Caja #{caja.id}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <span className="w-6 h-6">
                <FaTimes />
              </span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <p className="text-sm text-gray-500">Usuario</p>
              <p className="font-medium">{caja.userLogin}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Punto de Venta</p>
              <p className="font-medium">{caja.puntoDeVentaNombre}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Fecha Inicio</p>
              <p className="font-medium">
                {formatDate(caja.fecha).date} {formatDate(caja.fecha).time}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Fecha Cierre</p>
              <p className="font-medium">
                {formatDate(caja.fechaCierre).date}{" "}
                {formatDate(caja.fechaCierre).time}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Inicio</p>
              <p className="font-medium">{formatCurrency(caja.inicio)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Cierre</p>
              <p className="font-medium">{formatCurrency(caja.cierre || 0)}</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo Pago
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ingreso sistema
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ingreso declarado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Diferencia
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-300">
                {caja.flujoCajas.map((flujo) => (
                  <tr key={flujo.id}>
                    <td className="px-6 py-2 whitespace-nowrap text-sm">
                      <div
                        className={`flex items-center space-x-2 px-3 py-1 rounded-full w-fit ${getTipoPagoColor(
                          flujo.tipoPagoNombre
                        )}`}
                      >
                        <span>{getTipoPagoIcon(flujo.tipoPagoNombre)}</span>
                        <span>{flujo.tipoPagoNombre.trim()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(flujo.pendiente)}
                    </td>
                    <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(flujo.ingresoEfectivo)}
                    </td>
                    <td className="px-6 py-2 whitespace-nowrap text-sm">
                      <span
                        className={`font-medium ${
                          flujo.diferencia <= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {formatCurrency(flujo.diferencia * -1)}
                      </span>
                    </td>
                  </tr>
                ))}
                <tr className="bg-gray-300">
                  <td className="px-6 py-2 whitespace-nowrap text-md font-bold text-gray-900">
                    Total
                  </td>
                  <td className="px-6 py-2 whitespace-nowrap text-md font-bold text-gray-900">
                    {formatCurrency(totalIngreso)}
                  </td>
                  <td className="px-6 py-2 whitespace-nowrap text-md font-bold text-gray-900">
                    {formatCurrency(totalIngresoDeclarado)}
                  </td>
                  <td className="px-6 py-2 whitespace-nowrap text-md">
                    <span
                      className={`font-semibold ${
                        totalDiferencia >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {formatCurrency(totalDiferencia)}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CashierDetailsModal;
