import React, { useEffect } from "react";
import { FaTrash, FaPlus } from "react-icons/fa";
import { formatCurrency } from "../../utils/formatters";
import { FaMoneyBillWave, FaCreditCard, FaExchangeAlt } from "react-icons/fa";
import { FaRegRectangleList } from "react-icons/fa6";
import { LuTruck } from "react-icons/lu";
import { Pago } from "../../types/configuration";
import Loader from "../common/Loader";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFinalize: () => void;
  tiposPago: Array<{ id: string; nombre: string }>;
  tipoPagoSeleccionado: string;
  setTipoPagoSeleccionado: (tipo: string) => void;
  montoPago: string;
  setMontoPago: (monto: string) => void;
  pagos: Pago[];
  agregarPago: () => void;
  removePago: (index: number) => void;
  factura: {
    subtotal: number;
    interes: number;
    descuento: number;
    total: number;
  };
  totalPagado: number;
  loadingBtn: boolean;
  tipoComprobantes: Array<{ id: number; nombre: string }>;
  tipoDocumentos: Array<{ id: number; nombre: string }>;
  tipoComprobanteId: number;
  setTipoComprobanteId: (id: number) => void;
  tipoDocumentoId: number;
  setTipoDocumentoId: (id: number) => void;
  nroDocumento: string;
  setNroDocumento: (nro: string) => void;
}

const getTipoPagoIcon = (nombre: string) => {
  switch (nombre.toLowerCase().replace(/\s+/g, "")) {
    case "efectivo":
      return (
        <span className="mr-2">
          <FaMoneyBillWave />
        </span>
      );
    case "tarjetadebito":
      return (
        <span className="mr-2">
          <FaCreditCard />
        </span>
      );
    case "tarjetacredito":
      return (
        <span className="mr-2">
          <FaExchangeAlt />
        </span>
      );
    case "cuentacorriente":
      return (
        <span className="mr-2">
          <FaRegRectangleList />
        </span>
      );
    default:
      return (
        <span className="mr-2">
          <LuTruck />
        </span>
      );
  }
};

const getTipoPagoColor = (nombre: string) => {
  switch (nombre.toLowerCase().replace(/\s+/g, "")) {
    case "efectivo":
      return "bg-green-500 hover:bg-green-600";
    case "tarjetadebito":
      return "bg-blue-500 hover:bg-blue-600";
    case "tarjetacredito":
      return "bg-purple-500 hover:bg-purple-600";
    case "cuentacorriente":
      return "bg-red-500 hover:bg-red-600";
    default:
      return "bg-gray-500 hover:bg-gray-600";
  }
};

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  onFinalize,
  tiposPago,
  tipoPagoSeleccionado,
  setTipoPagoSeleccionado,
  montoPago,
  setMontoPago,
  pagos,
  agregarPago,
  removePago,
  factura,
  totalPagado,
  loadingBtn,
  tipoComprobantes,
  tipoDocumentos,
  tipoComprobanteId,
  setTipoComprobanteId,
  tipoDocumentoId,
  setTipoDocumentoId,
  nroDocumento,
  setNroDocumento,
}) => {
  // Efecto para autocompletar el monto con el valor restante
  useEffect(() => {
    if (tipoPagoSeleccionado && !montoPago) {
      const montoRestante = factura.total - totalPagado;
      setMontoPago(montoRestante.toString());
    }
  }, [tipoPagoSeleccionado, factura.total, totalPagado]);

  // Ordenar los tipos de pago según el orden especificado
  const tiposPagoOrdenados = [...tiposPago].sort((a, b) => {
    const orden: Record<string, number> = {
      efectivo: 1,
      tarjetadebito: 2,
      tarjetacredito: 3,
      cuentacorriente: 4,
      cuentacorrienteproveedor: 5,
    };
    return (
      (orden[a.nombre.toLowerCase().replace(/\s+/g, "")] || 99) -
      (orden[b.nombre.toLowerCase().replace(/\s+/g, "")] || 99)
    );
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
      <div className="relative top-20 mx-auto p-5 border w-[80%] shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Pagos
          </h3>
          <div className="mb-4">
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Tipo Pago
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {tiposPagoOrdenados.map((tipo) => (
                    <button
                      key={tipo.id}
                      onClick={() => setTipoPagoSeleccionado(tipo.id)}
                      className={`flex items-center border-2 border-transparent justify-center px-4 py-2 rounded-lg text-white transition-all duration-200 ${
                        tipoPagoSeleccionado === tipo.id
                          ? `${getTipoPagoColor(
                              tipo.nombre
                            )} scale-105 shadow-lg border-black`
                          : `${getTipoPagoColor(
                              tipo.nombre
                            )} opacity-70 hover:opacity-100`
                      }`}
                    >
                      {getTipoPagoIcon(tipo.nombre)}
                      <span className="text-sm md:text-lg">{tipo.nombre}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-row gap-4 w-full">
                <div className="w-full">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Monto
                  </label>
                  <input
                    type="number"
                    value={montoPago}
                    onChange={(e) => setMontoPago(e.target.value)}
                    className="w-full bg-gray-100 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ingrese el monto"
                  />
                </div>
                <div className="flex items-end justify-center">
                  <button
                    onClick={agregarPago}
                    disabled={
                      !tipoPagoSeleccionado ||
                      !montoPago ||
                      parseFloat(montoPago) <= 0 ||
                      parseFloat(montoPago) > factura.total - totalPagado
                    }
                    className={`flex items-center justify-center px-4 py-2 rounded-lg text-white ${
                      !tipoPagoSeleccionado ||
                      !montoPago ||
                      parseFloat(montoPago) <= 0 ||
                      parseFloat(montoPago) > factura.total - totalPagado
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-blue-500 hover:bg-blue-600"
                    }`}
                  >
                    <span className="mr-2">
                      <FaPlus />
                    </span>
                    Agregar
                  </button>
                </div>
              </div>
            </div>
          </div>

          {pagos.length === 0 ? (
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
              No se encontraron pagos
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo Pago
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Monto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pagos.map((pago, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {pago.tipoPagoNombre.trim()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {formatCurrency(pago.monto)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => removePago(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-4">
            <div className="flex justify-end mb-2">
              <span className="text-xl">
                Subtotal: {formatCurrency(factura.subtotal)}
              </span>
            </div>
            <div className="flex justify-end mb-2">
              <span className="text-xl">
                Interés: {formatCurrency(factura.interes)}
              </span>
            </div>
            <div className="flex justify-end mb-2">
              <span className="text-xl">
                Descuento: -{formatCurrency(factura.descuento)}
              </span>
            </div>
            <div className="flex justify-end mb-4">
              <span className="text-2xl font-bold">
                Total: {formatCurrency(factura.total)}
              </span>
            </div>
          </div>

          {/* New Comprobante Fields */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Tipo Comprobante
              </label>
              <select
                value={tipoComprobanteId}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  setTipoComprobanteId(value);
                }}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {tipoComprobantes.map((tipo) => (
                  <option key={tipo.id} value={tipo.id}>
                    {tipo.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Tipo Documento
              </label>
              <select
                value={tipoDocumentoId}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  console.log("Cambiando tipoDocumentoId a:", value);
                  setTipoDocumentoId(value);
                }}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {tipoDocumentos.map((tipo) => (
                  <option key={tipo.id} value={tipo.id}>
                    {tipo.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Nro. Documento
              </label>
              <input
                type="text"
                value={nroDocumento}
                onChange={(e) => {
                  console.log("Cambiando nroDocumento a:", e.target.value);
                  setNroDocumento(e.target.value);
                }}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ingrese el número de documento"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
            >
              Cancelar
            </button>
            <button
              onClick={onFinalize}
              disabled={totalPagado < factura.total || loadingBtn}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingBtn ? (
                <div className="flex items-center gap-2">
                  <Loader size="sm" />
                  <span>Cargando...</span>
                </div>
              ) : (
                "Finalizar"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
