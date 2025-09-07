import React, { useState, useEffect } from "react";
import { FaMoneyBillWave, FaCreditCard, FaExchangeAlt } from "react-icons/fa";
import { FaRegRectangleList } from "react-icons/fa6";
import { LuTruck } from "react-icons/lu";
import { formatCurrency } from "../../utils/formatters";
import { FaDollarSign } from "react-icons/fa";
import { CierreCajaItem } from "../../services/cajaService";
import { Button } from "../common/Button";
import Loader from "../common/Loader";
import { toast } from "react-hot-toast";

interface ClosuresModalProps {
  closingAmount: number;
  setClosingAmount: (amount: number) => void;
  handleCloseCaja: (items: CierreCajaItem[]) => void;
  showCloseModal: boolean;
  setShowCloseModal: (show: boolean) => void;
  currentCaja: any;
}

interface PaymentType {
  id: string;
  nombre: string;
  amount: number;
  tipoPagoId: number;
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
      return "bg-gray-500 hover:bg-gray-600";
  }
};

const ClosuresModal: React.FC<ClosuresModalProps> = ({
  setClosingAmount,
  handleCloseCaja,
  showCloseModal,
  setShowCloseModal,
  currentCaja,
}) => {
  const [paymentTypes, setPaymentTypes] = useState<PaymentType[]>([
    { id: "1", nombre: "Efectivo", amount: 0, tipoPagoId: 1 },
    { id: "2", nombre: "Tarjeta Debito", amount: 0, tipoPagoId: 2 },
    { id: "3", nombre: "Tarjeta Credito", amount: 0, tipoPagoId: 3 },
    { id: "4", nombre: "Cuenta Corriente", amount: 0, tipoPagoId: 4 },
    { id: "5", nombre: "Cuenta Corriente Proveedor", amount: 0, tipoPagoId: 5 },
  ]);

  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [inputErrors, setInputErrors] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const sum = paymentTypes.reduce((acc, curr) => acc + (curr.amount || 0), 0);
    setTotalAmount(sum);
    setClosingAmount(sum);
  }, [paymentTypes]);

  const handleAmountChange = (id: string, amount: number) => {
    const updatedTypes = paymentTypes.map((type) =>
      type.id === id ? { ...type, amount } : type
    );
    setPaymentTypes(updatedTypes);

    // Validate input - only check for negative values
    const errors = { ...inputErrors };
    errors[id] = amount < 0;
    setInputErrors(errors);
  };

  const handleCloseCajaSubmit = async () => {
    try {
      setLoading(true);
      const cierreItems: CierreCajaItem[] = paymentTypes.map((type) => ({
        ingresoEfectivo: type.amount,
        tipoPagoNombre: type.nombre.padEnd(40, " "),
        tipoPagoId: type.tipoPagoId,
      }));

      await handleCloseCaja(cierreItems);
      toast.success("Caja cerrada exitosamente");
    } catch (error) {
      toast.error("Error al cerrar la caja");
      console.error("Error al cerrar la caja:", error);
    } finally {
      setLoading(false);
    }
  };

  const hasErrors = Object.values(inputErrors).some((error) => error);
  const allInputsFilled =
    paymentTypes.every((type) => {
      const amount = type.amount || 0;
      return amount >= 0 && amount !== undefined && amount !== null;
    }) && paymentTypes.some((type) => (type.amount || 0) > 0);

  if (!showCloseModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-[600px]">
        <h2 className="text-xl font-bold mb-4">Cerrar Caja</h2>

        <div className="space-y-4 mb-6">
          {paymentTypes.map((type) => (
            <div key={type.id} className="flex items-center space-x-4">
              <div
                className={`flex items-center justify-center px-4 py-2 rounded-lg text-white transition-all duration-200 w-80 cursor-default ${getTipoPagoColor(
                  type.nombre
                )}`}
              >
                <span className="mr-2">{getTipoPagoIcon(type.nombre)}</span>
                <span>{type.nombre}</span>
              </div>
              <div className="flex-1">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaDollarSign className="text-gray-500" />
                  </div>
                  <input
                    type="number"
                    value={type.amount || ""}
                    onChange={(e) =>
                      handleAmountChange(type.id, Number(e.target.value))
                    }
                    className={`w-full pl-8 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      inputErrors[type.id]
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                {inputErrors[type.id] && (
                  <p className="text-red-500 text-sm mt-1">
                    El monto no puede ser negativo
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t pt-4 mb-6 flex flex-col justify-end w-full items-end text-2xl">
          <p className="text-2xl text-black font-bold">
            Total: {formatCurrency(totalAmount)}
          </p>
          <p className="text-base text-gray-500">
            Esperado: {formatCurrency(currentCaja?.ingreso || 0)}
          </p>
          <p
            className={`text-base ${
              totalAmount - (currentCaja?.ingreso || 0) > 0
                ? "text-green-500"
                : "text-red-500"
            }`}
          >
            Diferencia:{" "}
            {formatCurrency(totalAmount - (currentCaja?.ingreso || 0))}
          </p>
        </div>

        <div className="flex justify-end space-x-4">
          <Button
            color="gray"
            text="Cancelar"
            onClick={() => setShowCloseModal(false)}
          />
          <Button
            color="blue"
            disabled={hasErrors || !allInputsFilled || loading}
            onClick={handleCloseCajaSubmit}
          >
            {loading ? <Loader size="sm" /> : "Cerrar Caja"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ClosuresModal;
