import { useEffect, useState } from "react";
import { Modal } from "../common/Modal";
import { Cliente, clientService } from "../../services/clientService";
import { Input } from "../common/Input";

export const ModalEditClient = ({
  client,
  open,
  onClose,
  loadClientes,
}: {
  client: Cliente | null;
  open: boolean;
  onClose: () => void;
  loadClientes: () => void;
}) => {
  const [formData, setFormData] = useState<Cliente | null>(client);
  const [nameError, setNameError] = useState<string>("");
  const [disabledBtn, setDisabledBtn] = useState<boolean>(false);

  const validateName = (name: string) => {
    if (name.length < 3) {
      setNameError("El nombre debe tener al menos 3 caracteres");
      return false;
    }
    setNameError("");
    return true;
  };

  const handleSave = async () => {
    if (formData) {
      if (!validateName(formData.nombre)) {
        return;
      }
      setDisabledBtn(true);
      try {
        await clientService.updateCliente(formData);
        loadClientes();
        onClose();
      } catch (error) {
        console.error("Error al actualizar:", error);
      } finally {
        setDisabledBtn(false);
      }
    }
  };

  useEffect(() => {
    if (client) {
      setFormData({
        ...client,
        nombre: client.nombre?.trimEnd(),
        apellido: client.apellido?.trimEnd(),
        direccion: client.direccion?.trimEnd(),
        email: client.email?.trimEnd(),
        telefono: client.telefono?.trimEnd(),
        numeroDocumento: client.numeroDocumento?.trimEnd(),
      });
    }
  }, [client]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="w-[90%] h-[90%]"
      onSave={handleSave}
      disabledBtn={disabledBtn}
    >
      {formData && (
        <div className="flex flex-col w-full h-full  gap-4">
          <h2 className="text-2xl font-bold">Editar Cliente</h2>
          <form className="gap-4 grid grid-cols-2 py-4">
            <div>
              <Input
                label="Nombre"
                name="nombre"
                type="text"
                value={formData.nombre}
                onChange={(e) => {
                  const newName = e.target.value;
                  setFormData({ ...formData, nombre: newName });
                  validateName(newName);
                }}
                className={nameError ? "border-red-500 w-[350px]" : "w-[350px]"}
              />
              {nameError && (
                <p className="text-red-500 text-sm mt-1">{nameError}</p>
              )}
            </div>

            <Input
              label="Apellido"
              name="apellido"
              type="text"
              className="w-[350px]"
              value={formData.apellido}
              onChange={(e) =>
                setFormData({ ...formData, apellido: e.target.value })
              }
            />
            <Input
              label="Email"
              name="email"
              type="email"
              className="w-[350px]"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
            <Input
              label="Teléfono"
              name="telefono"
              type="tel"
              className="w-[350px]"
              value={formData.telefono}
              onChange={(e) =>
                setFormData({ ...formData, telefono: e.target.value })
              }
            />

            <Input
              label="Número de Documento"
              name="numeroDocumento"
              type="text"
              className="w-[350px]"
              value={formData.numeroDocumento}
              onChange={(e) =>
                setFormData({ ...formData, numeroDocumento: e.target.value })
              }
            />
          </form>
        </div>
      )}
    </Modal>
  );
};
