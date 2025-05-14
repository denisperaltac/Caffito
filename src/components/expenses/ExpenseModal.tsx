import React, { useState, useEffect } from "react";
import { Gasto } from "../../types/expenses";
import { expensesService } from "../../services/expensesService";
import { Input } from "../common/Input";
import { Modal } from "../common/Modal";
import { toast } from "react-hot-toast";

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  expense?: Gasto | null;
}

interface Proveedor {
  id: number;
  name: string;
}

interface Categoria {
  id: number;
  name: string;
}

const ExpenseModal: React.FC<ExpenseModalProps> = ({
  isOpen,
  onClose,
  onSave,
  expense,
}) => {
  const [formData, setFormData] = useState<Partial<Gasto>>({
    name: "",
    monto: undefined,
    fecha: new Date().toISOString().split("T")[0],
    hora: new Date().toTimeString().slice(0, 5),
    notes: "",
    pagado: false,
    categoria: undefined,
    proveedor: undefined,
  });

  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [proveedoresData, categoriasData] = await Promise.all([
          expensesService.getGastosProveedor(),
          expensesService.getGastosCategory(),
        ]);
        setProveedores(proveedoresData);
        setCategorias(categoriasData);
      } catch (error) {
        console.error("Error al cargar los datos:", error);
      }
    };

    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  useEffect(() => {
    if (expense) {
      setFormData({
        ...expense,
        fecha: new Date(expense.fecha).toISOString().split("T")[0],
      });
    } else {
      setFormData({
        name: "",
        monto: undefined,
        fecha: new Date().toISOString().split("T")[0],
        hora: new Date().toTimeString().slice(0, 5),
        notes: "",
        pagado: false,
        categoria: undefined,
        proveedor: undefined,
      });
    }
  }, [expense]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validación de campos requeridos
    if (!formData.name?.trim()) {
      toast.error("El nombre es requerido");
      return;
    }

    if (!formData.monto || formData.monto <= 0) {
      toast.error("El monto debe ser mayor a 0");
      return;
    }

    if (!formData.categoria?.id) {
      toast.error("La categoría es requerida");
      return;
    }

    try {
      if (expense?.id) {
        await expensesService.updateGasto({
          ...formData,
          id: expense.id,
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
      size="w-1/2 h-full"
    >
      <div className="flex flex-col gap-4 justify-start items-center w-full h-full">
        <div className="flex h-[10%] mt-4 flex-row justify-between w-full">
          <h2 className="text-2xl">
            {expense ? "Editar Gasto" : "Nuevo Gasto"}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="w-full grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="name" className="text-sm font-medium">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              className="w-full p-2 border rounded-md"
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="monto" className="text-sm font-medium">
              Monto <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                $
              </span>
              <input
                id="monto"
                name="monto"
                type="number"
                min="0.01"
                step="0.01"
                value={formData.monto === undefined ? "" : formData.monto}
                className="w-full p-2 pl-7 border rounded-md"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    monto:
                      e.target.value === ""
                        ? undefined
                        : Number(e.target.value),
                  })
                }
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="categoriaId" className="text-sm font-medium">
              Categoría <span className="text-red-500">*</span>
            </label>
            <select
              id="categoriaId"
              name="categoriaId"
              value={formData.categoria?.id || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  categoria: e.target.value
                    ? { id: Number(e.target.value) }
                    : undefined,
                })
              }
              className="w-full p-2 border rounded-md overflow-y-auto"
            >
              <option value="">Seleccione una categoría</option>
              {categorias.map((categoria) => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="proveedorId" className="text-sm font-medium">
              Proveedor
            </label>
            <select
              id="proveedorId"
              name="proveedorId"
              value={formData.proveedor?.id || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  proveedor: e.target.value
                    ? { id: Number(e.target.value) }
                    : undefined,
                })
              }
              className="w-full p-2 border rounded-md overflow-y-auto"
            >
              <option value="">Seleccione un proveedor</option>
              {proveedores.map((proveedor) => (
                <option key={proveedor.id} value={proveedor.id}>
                  {proveedor.name}
                </option>
              ))}
            </select>
          </div>

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
