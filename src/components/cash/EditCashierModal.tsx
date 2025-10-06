import React, { useState, useEffect } from "react";
import {
  FaTimes,
  FaMoneyBillWave,
  FaCreditCard,
  FaExchangeAlt,
  FaDollarSign,
} from "react-icons/fa";
import { FaRegRectangleList } from "react-icons/fa6";
import { LuTruck } from "react-icons/lu";
import { Caja, FlujoCaja, cajaService } from "../../services/cajaService";
import Loader from "../common/Loader";
import { formatCurrency } from "../../utils/formatters";
import { Button } from "../common/Button";

interface EditCashierModalProps {
  isOpen: boolean;
  onClose: () => void;
  caja: Caja | null;
  onSave: (updatedCaja: Caja) => void;
}

interface EditableCierreItem {
  tipoPagoId: number;
  tipoPagoNombre: string;
  montoCierre: number;
  montoIngreso: number;
}

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

const EditCashierModal: React.FC<EditCashierModalProps> = ({
  isOpen,
  onClose,
  caja,
  onSave,
}) => {
  const [cierreItems, setCierreItems] = useState<EditableCierreItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen && caja) {
      loadData();
    }
  }, [isOpen, caja]);

  const loadData = async () => {
    if (!caja) return;

    setLoading(true);
    try {
      // Load payment types
      const tiposPagoData = await cajaService.getTiposPago();

      // Create cierre items from flujoCajas
      const items: EditableCierreItem[] = tiposPagoData.map((tipo) => {
        // Find the corresponding flujo for this payment type
        const flujo = caja.flujoCajas.find((f) => f.tipoPagoId === tipo.id);

        return {
          tipoPagoId: tipo.id,
          tipoPagoNombre: tipo.nombre,
          montoCierre: flujo?.ingresoEfectivo || 0,
          montoIngreso: flujo?.ingresoEfectivo || 0, // This is the original amount
        };
      });

      setCierreItems(items);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!caja) return;

    setSaving(true);
    try {
      // Update each flujoCaja individually
      const updatePromises = cierreItems.map(async (item) => {
        const flujo = caja.flujoCajas.find(
          (f) => f.tipoPagoId === item.tipoPagoId
        );
        if (flujo && item.montoCierre !== item.montoIngreso) {
          // Preserve all existing fields and only update ingresoEfectivo
          const updatedFlujo = {
            id: flujo.id,
            ingresoEfectivo: item.montoCierre,
            pendiente: flujo.pendiente,
            egreso: flujo.egreso,
            motivo: flujo.motivo,
            fechaHora: flujo.fechaHora,
            diferencia: flujo.diferencia,
            cajaId: flujo.cajaId,
            tipoPagoId: flujo.tipoPagoId,
            tipoPagoNombre: flujo.tipoPagoNombre,
          };
          console.log("Updating flujoCaja:", updatedFlujo);
          return await cajaService.updateFlujoCaja(updatedFlujo);
        }
        return flujo;
      });

      const updatedFlujoCajas = await Promise.all(updatePromises);

      // Calculate new totals
      const nuevoIngreso = cierreItems.reduce(
        (sum, item) => sum + item.montoCierre,
        0
      );
      const nuevoCierre = caja.cierre
        ? caja.cierre + (nuevoIngreso - caja.ingreso)
        : nuevoIngreso;

      // Update the main caja with new totals
      const updatedCaja: Caja = {
        ...caja,
        flujoCajas: updatedFlujoCajas.filter(
          (f) => f !== undefined
        ) as FlujoCaja[],
        ingreso: nuevoIngreso,
        cierre: nuevoCierre,
      };

      // Call the API to update the main caja totals
      const savedCaja = await cajaService.updateCaja(updatedCaja);

      onSave(savedCaja);
      onClose();
    } catch (error) {
      console.error("Error saving cierre:", error);
    } finally {
      setSaving(false);
    }
  };

  const updateCierreItem = (tipoPagoId: number, montoCierre: number) => {
    setCierreItems((items) =>
      items.map((item) =>
        item.tipoPagoId === tipoPagoId ? { ...item, montoCierre } : item
      )
    );
  };

  if (!isOpen || !caja) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-[600px]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            Editar Montos de Cierre - {caja.userLogin}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes className="w-6 h-6" />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader size="lg" />
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-6">
              {cierreItems.map((item) => (
                <div
                  key={item.tipoPagoId}
                  className="flex items-center space-x-4"
                >
                  <div
                    className={`flex items-center justify-center px-4 py-2 rounded-lg text-white transition-all duration-200 w-80 cursor-default ${getTipoPagoColor(
                      item.tipoPagoNombre
                    )}`}
                  >
                    <span className="mr-2">
                      {getTipoPagoIcon(item.tipoPagoNombre)}
                    </span>
                    <span>{item.tipoPagoNombre}</span>
                  </div>
                  <div className="flex-1">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaDollarSign className="text-gray-500" />
                      </div>
                      <input
                        type="number"
                        step="0.01"
                        value={item.montoCierre || ""}
                        onChange={(e) =>
                          updateCierreItem(
                            item.tipoPagoId,
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0.00"
                        min="0"
                        required
                      />
                    </div>
                    <div className="mt-1 text-sm text-gray-500">
                      Original: {formatCurrency(item.montoIngreso)}
                      {item.montoCierre !== item.montoIngreso && (
                        <span
                          className={`ml-2 ${
                            item.montoCierre - item.montoIngreso >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          (
                          {item.montoCierre - item.montoIngreso >= 0 ? "+" : ""}
                          {formatCurrency(item.montoCierre - item.montoIngreso)}
                          )
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 mb-6 flex flex-col justify-end w-full items-end text-2xl">
              <p className="text-2xl text-black font-semibold">
                Total Nuevo:{" "}
                {formatCurrency(
                  cierreItems.reduce((sum, item) => sum + item.montoCierre, 0)
                )}
              </p>
              <p className="text-base text-gray-500">
                Total Original:{" "}
                {formatCurrency(
                  cierreItems.reduce((sum, item) => sum + item.montoIngreso, 0)
                )}
              </p>
              <p
                className={`text-lg font-semibold ${
                  cierreItems.reduce(
                    (sum, item) => sum + item.montoCierre - item.montoIngreso,
                    0
                  ) >= 0
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              >
                Diferencia:{" "}
                {formatCurrency(
                  cierreItems.reduce(
                    (sum, item) => sum + item.montoCierre - item.montoIngreso,
                    0
                  )
                )}
              </p>
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                color="gray"
                text="Cancelar"
                onClick={onClose}
                disabled={saving}
              />
              <Button
                color="blue"
                disabled={saving || loading}
                onClick={handleSave}
              >
                {saving ? <Loader size="sm" /> : "Guardar Cambios"}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EditCashierModal;
