import React, { useState, useEffect } from "react";
import { FaTimes, FaSave, FaMoneyBillWave } from "react-icons/fa";
import { formatCurrency } from "../../utils/formatters";
import { Cliente } from "../../types/cliente";
import {
  cuentaCorrienteService,
  CuentaCorriente as CuentaCorrienteType,
} from "../../services/cuentaCorrienteService";
import { toast } from "react-hot-toast";
import Loader from "../common/Loader";
import axiosInstance from "../../config/axiosConfig";
import { API_URL } from "../../constants/api";
import InvoiceDetailsModal from "../cash/InvoiceDetailsModal";

interface ModalPagoCuentaCorrienteProps {
  cliente: Cliente | null;
  open: boolean;
  onClose: () => void;
}

interface TipoPago {
  id: number;
  nombre: string;
  interes: number;
}

export const ModalPagoCuentaCorriente: React.FC<
  ModalPagoCuentaCorrienteProps
> = ({ cliente, open, onClose }) => {
  const [tiposPago, setTiposPago] = useState<TipoPago[]>([]);
  const [tipoPagoSeleccionado, setTipoPagoSeleccionado] =
    useState<TipoPago | null>(null);
  const [monto, setMonto] = useState("");
  const [interes, setInteres] = useState(0);
  const [pagoTotal, setPagoTotal] = useState(0);
  const [saldo, setSaldo] = useState(0);
  const [cuentaCorrientes, setCuentaCorrientes] = useState<
    CuentaCorrienteType[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [loadingPago, setLoadingPago] = useState(false);
  const [loadingSaldo, setLoadingSaldo] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedFacturaId, setSelectedFacturaId] = useState<number | null>(
    null
  );
  const itemsPerPage = 8;

  useEffect(() => {
    if (open && cliente) {
      console.log("Modal abierto para cliente:", cliente.id, cliente.nombre);
      loadTiposPago();
      loadSaldo();
      loadCuentaCorrientes();
    }
  }, [open, cliente]);

  useEffect(() => {
    if (open && cliente) {
      loadCuentaCorrientes();
      // También recargar el saldo cuando cambie la página para asegurar datos actualizados
      loadSaldo();
    }
  }, [currentPage]);

  useEffect(() => {
    if (tipoPagoSeleccionado && monto) {
      const montoNum = parseFloat(monto) || 0;
      const interesCalculado = montoNum * tipoPagoSeleccionado.interes;
      setInteres(interesCalculado);
      setPagoTotal(montoNum + interesCalculado);
    } else {
      setInteres(0);
      setPagoTotal(parseFloat(monto) || 0);
    }
  }, [tipoPagoSeleccionado, monto]);

  const loadTiposPago = async () => {
    try {
      const tiposFiltrados = await cuentaCorrienteService.getTiposPago();
      setTiposPago(tiposFiltrados);
      if (tiposFiltrados.length > 0) {
        setTipoPagoSeleccionado(tiposFiltrados[0]);
      }
    } catch (error) {
      console.error("Error al cargar tipos de pago:", error);
      toast.error("Error al cargar tipos de pago");
    }
  };

  const loadSaldo = async (showToast: boolean = false) => {
    if (!cliente) return;
    try {
      setLoadingSaldo(true);
      console.log(`Cargando saldo para cliente ID: ${cliente.id}`);

      // Usar la misma implementación que ModalCuentaCorriente.tsx
      const saldoData = await axiosInstance.get(
        `${API_URL}/cuenta-corrientes/${cliente.id}/saldo`
      );

      const saldoValue = saldoData.data.saldo;

      setSaldo(saldoValue);

      if (showToast) {
        toast.success(`Saldo actualizado: ${formatCurrency(saldoValue)}`);
      }
    } catch (error) {
      console.error("Error al cargar saldo:", error);
      toast.error("Error al cargar el saldo del cliente");
      setSaldo(0);
    } finally {
      setLoadingSaldo(false);
    }
  };

  const loadCuentaCorrientes = async () => {
    if (!cliente) return;
    try {
      setLoading(true);
      const response = await cuentaCorrienteService.getMovimientos(
        cliente.id,
        currentPage - 1,
        itemsPerPage
      );
      setCuentaCorrientes(response.data);
      // Intentar obtener el total de items del header
      const totalCount = response.headers["x-total-count"];
      if (totalCount) {
        setTotalItems(parseInt(totalCount));
      } else {
        setTotalItems(response.data.length);
      }
    } catch (error) {
      console.error("Error al cargar cuenta corriente:", error);
      toast.error("Error al cargar cuenta corriente");
    } finally {
      setLoading(false);
    }
  };

  const handleGuardarPago = async () => {
    if (!cliente || !tipoPagoSeleccionado || !monto) {
      toast.error("Complete todos los campos");
      return;
    }

    const montoNum = parseFloat(monto);
    if (montoNum <= 0) {
      toast.error("El monto debe ser mayor a 0");
      return;
    }

    try {
      setLoadingPago(true);
      const pagoData = {
        clienteId: cliente.id,
        haber: montoNum,
        debe: 0,
        fechaHora: null,
      };

      await cuentaCorrienteService.registrarPago(
        pagoData,
        tipoPagoSeleccionado.id
      );

      toast.success("Pago agregado correctamente");

      // Limpiar formulario
      setMonto("");
      setInteres(0);
      setPagoTotal(0);

      // Recargar datos
      loadSaldo(true);
      loadCuentaCorrientes();
    } catch (error) {
      console.error("Error al guardar pago:", error);
      toast.error("Error al guardar el pago");
    } finally {
      setLoadingPago(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleFacturaClick = (facturaId: number) => {
    setSelectedFacturaId(facturaId);
  };

  const extractFacturaId = (detalle: string): number | null => {
    // Buscar patrones como "VENTA 123" o "FACTURA 456"
    const match = detalle.match(/(VENTA|FACTURA)\s+(\d+)/i);
    return match ? parseInt(match[2]) : null;
  };

  if (!open || !cliente) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-[90%] min-h-[90vh] shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Cuenta Corriente - {cliente.nombre} {cliente.apellido}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <FaTimes className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Panel de Pago */}
          <div className="lg:col-span-1 bg-gray-50 p-4 rounded-lg">
            <h4 className="text-lg font-semibold mb-4 flex items-center">
              <FaMoneyBillWave className="mr-2" />
              Agregar Pago
            </h4>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Saldo Actual
                  </label>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {loadingSaldo ? (
                    <div className="flex items-center">
                      <Loader size="sm" />
                      <span className="ml-2">Cargando saldo...</span>
                    </div>
                  ) : (
                    <span
                      className={saldo >= 0 ? "text-red-600" : "text-green-600"}
                    >
                      {formatCurrency(saldo)}
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Pago
                </label>
                <select
                  value={tipoPagoSeleccionado?.id || ""}
                  onChange={(e) => {
                    const tipo = tiposPago.find(
                      (t) => t.id === parseInt(e.target.value)
                    );
                    setTipoPagoSeleccionado(tipo || null);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {tiposPago.map((tipo) => (
                    <option key={tipo.id} value={tipo.id}>
                      {tipo.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monto
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    $
                  </span>
                  <input
                    type="number"
                    value={monto}
                    onChange={(e) => setMonto(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Pago:</span>
                  <span className="font-semibold">
                    {formatCurrency(parseFloat(monto) || 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Interés:</span>
                  <span className="font-semibold text-red-600">
                    {formatCurrency(interes)}
                  </span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between">
                    <span className="text-lg font-bold">Total:</span>
                    <span className="text-lg font-bold text-blue-600">
                      {formatCurrency(pagoTotal)}
                    </span>
                  </div>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Nuevo Saldo:</span>
                    <span className="text-sm font-semibold text-green-600">
                      {formatCurrency(saldo + interes - pagoTotal)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleGuardarPago}
                  disabled={loadingPago || !monto || parseFloat(monto) <= 0}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                  {loadingPago ? (
                    <>
                      <Loader size="sm" />
                      <span className="ml-2">Guardando...</span>
                    </>
                  ) : (
                    <>
                      <FaSave className="mr-2" />
                      Guardar
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Tabla de Movimientos */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border">
              <div className="p-4 border-b">
                <h4 className="text-lg font-semibold">
                  Movimientos de Cuenta Corriente
                </h4>
              </div>

              {loading ? (
                <div className="flex justify-center items-center p-8">
                  <Loader size="lg" />
                </div>
              ) : cuentaCorrientes.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No hay movimientos de cuenta corriente
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            ID
                          </th>
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
                        {cuentaCorrientes.map((movimiento) => (
                          <tr key={movimiento.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {movimiento.id}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {movimiento.fechaHora}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {(() => {
                                const facturaId = extractFacturaId(
                                  movimiento.detalle
                                );
                                if (facturaId) {
                                  return (
                                    <button
                                      onClick={() =>
                                        handleFacturaClick(facturaId)
                                      }
                                      className="text-blue-600 hover:text-blue-800 hover:underline"
                                    >
                                      {movimiento.detalle}
                                    </button>
                                  );
                                }
                                return movimiento.detalle;
                              })()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                              {movimiento.debe > 0
                                ? formatCurrency(movimiento.debe)
                                : "-"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                              {movimiento.haber > 0
                                ? formatCurrency(movimiento.haber)
                                : "-"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold">
                              <span
                                className={
                                  movimiento.saldo >= 0
                                    ? "text-green-600"
                                    : "text-red-600"
                                }
                              >
                                {formatCurrency(movimiento.saldo)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Paginación */}
                  {totalItems > itemsPerPage && (
                    <div className="px-6 py-3 border-t">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-700">
                          Mostrando {(currentPage - 1) * itemsPerPage + 1} a{" "}
                          {Math.min(currentPage * itemsPerPage, totalItems)} de{" "}
                          {totalItems} resultados
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Anterior
                          </button>
                          <span className="px-3 py-1 text-sm border rounded">
                            {currentPage}
                          </span>
                          <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage * itemsPerPage >= totalItems}
                            className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Siguiente
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de detalles de factura */}
      {selectedFacturaId && (
        <InvoiceDetailsModal
          facturaId={selectedFacturaId}
          onClose={() => setSelectedFacturaId(null)}
        />
      )}
    </div>
  );
};
