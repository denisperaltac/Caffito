import React, { useState, useEffect } from "react";
import { Gasto } from "../../types/expenses";
import { expensesService } from "../../services/expensesService";
import { Input } from "../common/Input";
import { Modal } from "../common/Modal";
interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  expense?: Gasto | null;
}

const ExpenseModal: React.FC<ExpenseModalProps> = ({
  isOpen,
  onClose,
  onSave,
  expense,
}) => {
  const [formData, setFormData] = useState<Partial<Gasto>>({
    name: "",
    monto: 0,
    fecha: new Date().toISOString().split("T")[0],
    hora: new Date().toTimeString().slice(0, 5),
    notes: "",
    pagado: false,
  });

  useEffect(() => {
    if (expense) {
      setFormData({
        ...expense,
        fecha: new Date(expense.fecha).toISOString().split("T")[0],
      });
    } else {
      setFormData({
        name: "",
        monto: 0,
        fecha: new Date().toISOString().split("T")[0],
        hora: new Date().toTimeString().slice(0, 5),
        notes: "",
        pagado: false,
      });
    }
  }, [expense]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (expense?.gastoId) {
        await expensesService.updateGasto({
          ...formData,
          gastoId: expense.gastoId,
        });
      } else {
        await expensesService.createGasto(formData);
      }
      onSave();
      onClose();
    } catch (error) {
      console.error("Error al guardar el gasto:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      onSave={handleSubmit}
      textBtn="Guardar"
      size="w-1/3 h-[90%]"
    >
      <div className="flex flex-col gap-4 justify-start items-center w-full h-full">
        <div className="flex h-[10%] mt-4 flex-row justify-between w-full">
          <h2 className="text-2xl">
            {expense ? "Editar Gasto" : "Nuevo Gasto"}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 w-full">
          <Input
            label="Nombre"
            name="name"
            type="text"
            value={formData.name}
            className="w-full"
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />

          <Input
            label="Monto"
            name="monto"
            type="number"
            value={formData.monto}
            className="w-full"
            onChange={(e) =>
              setFormData({ ...formData, monto: Number(e.target.value) })
            }
          />

          <Input
            label="Fecha"
            name="fecha"
            type="date"
            value={formData.fecha}
            className="w-full"
            onChange={(e) =>
              setFormData({ ...formData, fecha: e.target.value })
            }
          />

          <Input
            label="Hora"
            name="hora"
            type="time"
            value={formData.hora}
            className="w-full"
            onChange={(e) => setFormData({ ...formData, hora: e.target.value })}
          />

          <Input
            label="Notas"
            name="notes"
            type="text"
            value={formData.notes}
            className="w-full"
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value })
            }
          />

          <Input
            label="Pagado"
            name="pagado"
            inputType="checkbox"
            value={formData.pagado}
            className="w-6 h-6"
            onChange={(e) =>
              setFormData({ ...formData, pagado: e.target.checked })
            }
          />
        </form>
      </div>
    </Modal>
  );
};

export default ExpenseModal;
