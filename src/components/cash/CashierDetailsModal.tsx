import React from "react";
import { FaTimes } from "react-icons/fa";
import { Caja } from "../../services/cajaService";

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

const formatCurrency = (amount: number | null) => {
  if (amount === null) return "-";
  return amount.toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
  });
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

          <div className="grid grid-cols-2 gap-4 mb-6">
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
              <p className="font-medium">{formatCurrency(caja.cierre)}</p>
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
                    Ingreso
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ingreso declarado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Diferencia
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {caja.flujoCajas.map((flujo) => (
                  <tr key={flujo.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {flujo.tipoPagoNombre.trim()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(flujo.pendiente)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(flujo.ingresoEfectivo)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`font-medium ${
                          flujo.diferencia >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {formatCurrency(flujo.diferencia)}
                      </span>
                    </td>
                  </tr>
                ))}
                <tr className="bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                    Total
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                    {formatCurrency(totalIngreso)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                    {formatCurrency(totalIngresoDeclarado)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`font-bold ${
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
