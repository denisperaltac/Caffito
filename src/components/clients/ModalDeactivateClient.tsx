import { useEffect, useState } from "react";
import { Modal } from "../common/Modal";
import { Cliente, clientService } from "../../services/clientService";
import { Input } from "../common/Input";

export const ModalDeactivateClient = ({
  client,
  open,
  onClose,
  loadClientes,
}: {
  client: Cliente | any;
  open: boolean;
  onClose: () => void;
  loadClientes: () => void;
}) => {
  const [formData, setFormData] = useState<Cliente>(client || ({} as Cliente));
  const [deactivateInput, setDeactivateInput] = useState<string>("");
  const [disabledBtn, setDisabledBtn] = useState<boolean>(false);

  const handleDeactivate = async () => {
    if (formData) {
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
        activo: false,
      });
    }
  }, [client]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="w-2/3 h-2/3"
      onSave={handleDeactivate}
      disabledBtn={
        disabledBtn || deactivateInput !== formData?.nombre?.trimEnd()
      }
      modalDelete={true}
      textBtn="Desactivar"
    >
      {formData && (
        <div className="flex flex-col justify-center w-full h-full items-center gap-4">
          <p className="text-xl mt-2">
            ¿Estás seguro de que deseas desactivar al cliente "
            {formData.nombre?.trimEnd()}"?
          </p>
          <div className="flex flex-col justify-center w-full h-full items-center gap-4">
            <p className="text-md text-center w-full">
              Ingrese el nombre del cliente para confirmar la desactivación
            </p>
            <form className="flex flex-col gap-4">
              <div>
                <Input
                  noAutocomplete
                  name="nombre"
                  placeholder="Nombre del cliente"
                  type="text"
                  value={deactivateInput}
                  onChange={(e) => {
                    setDeactivateInput(e.target.value);
                  }}
                  className={
                    deactivateInput !== "desactivar"
                      ? "ring-red-500 w-[350px]"
                      : ""
                  }
                />
              </div>
            </form>
          </div>
        </div>
      )}
    </Modal>
  );
};
