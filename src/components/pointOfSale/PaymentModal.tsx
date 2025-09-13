import React, { useEffect, useState } from "react";
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
  onUpdateInteres: (interes: number) => void;
  dineroRecibido: string;
  setDineroRecibido: (dinero: string) => void;
  cliente?: {
    id: number;
    nombre: string;
    apellido: string;
    numeroDocumento?: string;
  } | null;
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
      return "bg-green-500 duration-300 hover:bg-green-600 hover:shadow-xl";
    case "tarjetadebito":
      return "bg-blue-500 duration-300 hover:bg-blue-600 hover:shadow-xl";
    case "tarjetacredito":
      return "bg-purple-500 duration-300 hover:bg-purple-600 hover:shadow-xl";
    case "cuentacorriente":
      return "bg-red-500 duration-300 hover:bg-red-600 hover:shadow-xl";
    default:
      return "bg-yellow-600 duration-300 hover:bg-yellow-700 hover:shadow-xl";
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
  onUpdateInteres,
  dineroRecibido,
  setDineroRecibido,
  cliente,
}) => {
  // Estado para rastrear si el usuario ha modificado manualmente el monto
  const [userModifiedAmount, setUserModifiedAmount] = useState(false);

  // Efecto para autocompletar el monto con el valor restante solo si el usuario no lo ha modificado manualmente
  useEffect(() => {
    if (tipoPagoSeleccionado && !userModifiedAmount) {
      const montoRestante = factura.total - totalPagado;
      setMontoPago(montoRestante.toString());
    }
  }, [tipoPagoSeleccionado, factura.total, totalPagado, userModifiedAmount]);

  // Resetear el flag cuando se cambia el tipo de pago
  useEffect(() => {
    setUserModifiedAmount(false);
  }, [tipoPagoSeleccionado]);

  // Efecto para actualizar el interés cuando cambie el tipo de pago
  useEffect(() => {
    if (tipoPagoSeleccionado) {
      const tipoPago = tiposPago.find((t) => t.id === tipoPagoSeleccionado);
      if (tipoPago) {
        const nombreTipoPago = tipoPago.nombre
          .toLowerCase()
          .replace(/\s+/g, "");
        if (nombreTipoPago === "tarjetacredito") {
          // Aplicar 10% de interés para tarjeta de crédito
          const interes = factura.subtotal * 0.1;
          onUpdateInteres(interes);
        } else {
          // Quitar interés para otros tipos de pago
          onUpdateInteres(0);
        }
      }
    }
  }, [tipoPagoSeleccionado, tiposPago, factura.subtotal, onUpdateInteres]);

  // Función para verificar si un tipo de pago debe estar deshabilitado
  const isTipoPagoDisabled = (tipoNombre: string) => {
    const nombreNormalizado = tipoNombre.toLowerCase().replace(/\s+/g, "");
    const esCuentaCorriente = nombreNormalizado === "cuentacorriente";
    const esCuentaCorrienteProveedor =
      nombreNormalizado === "cuentacorrienteproveedor";

    // Deshabilitar cuenta corriente si no hay cliente o es consumidor final
    if (esCuentaCorriente || esCuentaCorrienteProveedor) {
      if (!cliente) return true;
      if (cliente.nombre.toLowerCase().includes("consumidor final"))
        return true;
    }

    return false;
  };

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

  const isConsumidorFinal =
    cliente?.nombre === "CONSUMIDOR FINAL                                  ";

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
      <div className="relative top-20 mx-auto p-5 border w-[80%] shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Tipo Pago
          </h3>

          {/* Información del Cliente */}
          {cliente && (
            <div
              className={`bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 ${
                isConsumidorFinal ? "bg-red-50 border-red-200" : "bg-blue-50"
              }`}
            >
              <div className="flex items-center justify-between">
                {isConsumidorFinal ? (
                  <h4 className="text-md font-semibold text-red-600">
                    Consumidor Final
                  </h4>
                ) : (
                  <>
                    <div>
                      <h4 className="text-md font-semibold text-blue-800 mb-1">
                        Cliente: {cliente.nombre} {cliente.apellido}
                      </h4>
                      {cliente.numeroDocumento && (
                        <p className="text-sm text-blue-600">
                          DNI: {cliente.numeroDocumento}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Cliente Seleccionado
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
          <div className="mb-4">
            <div className="flex flex-col gap-4">
              <div>
                <div className="grid grid-cols-5 gap-4">
                  {tiposPagoOrdenados.map((tipo) => {
                    const isDisabled = isTipoPagoDisabled(tipo.nombre);
                    return (
                      <button
                        key={tipo.id}
                        onClick={() =>
                          !isDisabled && setTipoPagoSeleccionado(tipo.id)
                        }
                        disabled={isDisabled}
                        className={`flex items-center border-4 justify-center px-4 py-2 rounded-lg text-white transition-all duration-200 ${
                          isDisabled
                            ? "bg-gray-400 cursor-not-allowed opacity-50"
                            : tipoPagoSeleccionado === tipo.id
                            ? `${getTipoPagoColor(
                                tipo.nombre
                              )} scale-105 shadow-lg border-black`
                            : `${getTipoPagoColor(
                                tipo.nombre
                              )} opacity-70 border-transparent hover:opacity-100 `
                        }`}
                        title={
                          isDisabled
                            ? "No disponible para Consumidor Final"
                            : ""
                        }
                      >
                        {getTipoPagoIcon(tipo.nombre)}
                        <span className="text-sm md:text-lg">
                          {tipo.nombre ===
                          "CUENTA CORRIENTE PROVEEDOR              "
                            ? "CUENTA C. PROVEEDOR"
                            : tipo.nombre}
                        </span>
                        {tipo.nombre.toLowerCase().replace(/\s+/g, "") ===
                          "tarjetacredito" && (
                          <span className="ml-1 text-xs bg-white bg-opacity-20 px-1 py-0.5 rounded">
                            +10%
                          </span>
                        )}
                      </button>
                    );
                  })}
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
                    onChange={(e) => {
                      setMontoPago(e.target.value);
                      setUserModifiedAmount(true);
                    }}
                    className="w-full bg-gray-100 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ingrese el monto"
                  />
                </div>
                <div className="flex items-end justify-center">
                  <button
                    onClick={() => {
                      agregarPago();
                      setUserModifiedAmount(false);
                    }}
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
                        <div className="flex items-center">
                          <span>{pago.tipoPagoNombre.trim()}</span>
                          {pago.tipoPagoNombre
                            .trim()
                            .toLowerCase()
                            .replace(/\s+/g, "") === "tarjetacredito" && (
                            <span className="ml-2 bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                              +10% interés
                            </span>
                          )}
                        </div>
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
          <div className="flex flex-row gap-4 justify-between">
            {/* New Comprobante Fields */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Tipo Comprobante
                </label>
                <div className="flex flex-col space-y-2">
                  {tipoComprobantes.map((tipo) => (
                    <button
                      key={tipo.id}
                      onClick={() => setTipoComprobanteId(tipo.id)}
                      className={`w-full px-4 py-3 border-2 rounded-lg font-medium transition-all duration-200 ${
                        tipoComprobanteId === tipo.id
                          ? "border-blue-500 bg-blue-50 text-blue-700 shadow-lg transform scale-105"
                          : "border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50"
                      }`}
                    >
                      {tipo.nombre}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Tipo Documento
                </label>
                <div className="flex flex-col space-y-2">
                  {tipoDocumentos.map((tipo) => (
                    <button
                      key={tipo.id}
                      onClick={() => setTipoDocumentoId(tipo.id)}
                      className={`w-full px-4 py-3 border-2 rounded-lg font-medium transition-all duration-200 ${
                        tipoDocumentoId === tipo.id
                          ? "border-green-500 bg-green-50 text-green-700 shadow-lg transform scale-105"
                          : "border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50"
                      }`}
                    >
                      {tipo.nombre}
                    </button>
                  ))}
                </div>
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
            <div className="mt-4 w-96">
              <div className="flex justify-between">
                <span className="text-lg text-gray-600">Subtotal:</span>
                <span className="text-lg text-gray-600">
                  {formatCurrency(factura.subtotal)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-lg text-gray-600">Interés:</span>
                <span className="text-lg text-gray-600">
                  {formatCurrency(factura.interes)}
                </span>
              </div>
              {factura.interes > 0 && (
                <span className="flex text-sm text-purple-600 font-medium justify-end mb-2">
                  (Tarjeta de Crédito +10%)
                </span>
              )}
              <div className="flex justify-between mb-2">
                <span className="text-lg text-gray-600">Descuento:</span>
                <span className="text-lg text-gray-600">
                  {formatCurrency(factura.descuento)}
                </span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-2xl">Total:</span>
                <span className="text-2xl font-semibold">
                  {formatCurrency(factura.total)}
                </span>
              </div>
              <div className="flex justify-between gap-4 mb-2">
                <div className="text-left">
                  <div className="text-sm text-gray-600 mb-1">Paga con:</div>
                  <div className="relative">
                    <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-lg font-semibold text-gray-600">
                      $
                    </span>
                    <input
                      type="number"
                      value={dineroRecibido}
                      onChange={(e) => setDineroRecibido(e.target.value)}
                      className="w-32 pl-6 pr-2 py-1 text-lg font-semibold text-right border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600 mb-1">Vuelto:</div>
                  <div className="text-lg font-semibold text-green-600">
                    {parseFloat(dineroRecibido) > factura.total
                      ? formatCurrency(
                          parseFloat(dineroRecibido) - factura.total
                        )
                      : formatCurrency(0)}
                  </div>
                </div>
              </div>
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
