import { useState } from "react";
import { Modal } from "../common/Modal";
import { Cliente } from "../../services/clientService";

const ModalEditClient = ({
  client,
  open,
  onClose,
}: {
  client: Cliente | null;
  open: boolean;
  onClose: () => void;
}) => {
  const [formData, setFormData] = useState<Cliente | null>(client);
  return (
    <Modal open={open} onClose={onClose} size="w-1/2 h-1/2">
      {formData && (
        <div>
          <h1>Edit Client</h1>
          <form>
            <div>
              <label htmlFor="nombre">Nombre</label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={(e) =>
                  setFormData({ ...formData, nombre: e.target.value })
                }
              />
            </div>
            <div>
              <label htmlFor="apellido">Apellido</label>
              <input
                type="text"
                id="apellido"
                name="apellido"
                value={formData.apellido}
                onChange={(e) =>
                  setFormData({ ...formData, apellido: e.target.value })
                }
              />
            </div>
            <button type="submit">Save</button>
          </form>
        </div>
      )}
    </Modal>
  );
};

export default ModalEditClient;
