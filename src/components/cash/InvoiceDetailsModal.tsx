import React, { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import axiosInstance from "../../services/axiosInstance";
import { API_URL } from "../../constants/api";

interface FacturaRenglon {
  id: number;
  cantidad: number;
  precioCosto: number;
  precioVenta: number;
  peso: number;
  detalle: string;
  facturaId: number;
  productoId: number;
}

interface Pago {
  id: number;
  monto: number;
  tipoPagoId: number;
  tipoPagoNombre: string;
  facturaId: number;
  cajaId: number | null;
  cuentaCorrienteId: number | null;
}

interface Factura {
  id: number;
  fechaCreacion: string;
  total: number;
  subtotal: number;
  descuento: number;
  interes: number;
  clienteId: number;
  promocionId: number | null;
  comprobanteId: number | null;
  puntoDeVentaId: number;
  facturaRenglons: FacturaRenglon[];
  pagos: Pago[];
  puntoDeVentaNombre: string;
  promocionNombre: string | null;
  clienteNombreApellido: string;
  ticket: string | null;
}

interface InvoiceDetailsModalProps {
  facturaId: number;
  onClose: () => void;
}

const formatCurrency = (amount: number) => {
  return amount.toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
  });
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString("es-AR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

const InvoiceDetailsModal: React.FC<InvoiceDetailsModalProps> = ({
  facturaId,
  onClose,
}) => {
  const [factura, setFactura] = useState<Factura | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFactura();
  }, [facturaId]);

  const loadFactura = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get<Factura>(
        `${API_URL}/facturas/${facturaId}`
      );
      setFactura(response.data);
      setError(null);
    } catch (err) {
      setError("Error al cargar los detalles de la factura");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!factura) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-11/12 max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            Factura {factura.id}
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

        <div className="p-4 overflow-auto max-h-[calc(90vh-12rem)]">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Fecha Creación</p>
                  <p className="font-medium">
                    {formatDate(factura.fechaCreacion)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Punto De Venta</p>
                  <p className="font-medium">{factura.puntoDeVentaNombre}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Cliente</p>
                  <p className="font-medium">{factura.clienteNombreApellido}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Promoción</p>
                  <p className="font-medium">
                    {factura.promocionNombre || "-"}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Detalle</h3>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Detalle
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cantidad
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Precio Costo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Precio Venta
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {factura.facturaRenglons.map((renglon) => (
                      <tr key={renglon.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {renglon.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {renglon.detalle.trim()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {renglon.peso}Kg
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(renglon.precioCosto)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(renglon.precioVenta)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(renglon.precioVenta)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Pagos</h3>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tipo Pago
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Monto
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {factura.pagos.map((pago) => (
                      <tr key={pago.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {pago.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {pago.tipoPagoNombre.trim()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(pago.monto)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="grid grid-cols-2 gap-4 text-right">
                <div>
                  <p className="text-sm text-gray-500">Subtotal</p>
                  <p className="font-medium">
                    {formatCurrency(factura.subtotal)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Interés</p>
                  <p className="font-medium">
                    {formatCurrency(factura.interes)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Descuento</p>
                  <p className="font-medium">
                    {formatCurrency(factura.descuento)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total</p>
                  <p className="font-medium">{formatCurrency(factura.total)}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetailsModal;
