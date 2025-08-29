import { useState } from "react";
import { Modal } from "../common/Modal";
import { Cliente, clientService } from "../../services/clientService";
import { Input } from "../common/Input";

const TypeDocument = [
  {
    id: 3,
    codigo: "96",
    nombre: "DNI",
  },
  {
    id: 1,
    codigo: "99",
    nombre: "OTRO",
  },
  {
    id: 2,
    codigo: "80",
    nombre: "CUIT",
  },
];

interface FormErrors {
  nombre?: string;
  apellido?: string;
  numeroDocumento?: string;
}

export const ModalAddClient = ({
  open,
  onClose,
  loadClientes,
}: {
  open: boolean;
  onClose: () => void;
  loadClientes: () => void;
}) => {
  const [formData, setFormData] = useState<Cliente | any>({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    direccion: "",
    activo: true,
    tipoDocumentoId: 3,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [disabledBtn, setDisabledBtn] = useState<boolean>(false);

  const validateName = (name: string) => {
    if (name.length < 3) {
      setErrors((prev) => ({
        ...prev,
        nombre: "El nombre debe tener al menos 3 caracteres",
      }));
      return false;
    }
    setErrors((prev) => ({ ...prev, nombre: undefined }));
    return true;
  };

  const validateLastname = (lastname: string) => {
    if (lastname.length < 3) {
      setErrors((prev) => ({
        ...prev,
        apellido: "El apellido debe tener al menos 3 caracteres",
      }));
      return false;
    }
    setErrors((prev) => ({ ...prev, apellido: undefined }));
    return true;
  };

  const validateDocument = (document: string) => {
    if (!document) {
      setErrors((prev) => ({
        ...prev,
        numeroDocumento: "El número de documento es requerido",
      }));
      return false;
    }
    if (document.length < 7) {
      setErrors((prev) => ({
        ...prev,
        numeroDocumento:
          "El número de documento debe tener al menos 7 caracteres",
      }));
      return false;
    }
    setErrors((prev) => ({ ...prev, numeroDocumento: undefined }));
    return true;
  };

  const handleSave = async () => {
    if (formData) {
      const isNameValid = validateName(formData.nombre);
      const isLastnameValid = validateLastname(formData.apellido);
      const isDocumentValid = validateDocument(formData.numeroDocumento);

      if (!isNameValid || !isLastnameValid || !isDocumentValid) {
        return;
      }

      setDisabledBtn(true);
      try {
        await clientService.createCliente(formData);
        loadClientes();
        onClose();
      } catch (error) {
        console.error("Error al actualizar:", error);
      } finally {
        setDisabledBtn(false);
      }
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="w-auto h-auto"
      onSave={handleSave}
      disabledBtn={disabledBtn}
    >
      <div className="flex flex-col w-full h-full gap-4">
        <h2 className="text-2xl font-bold">Agregar Cliente</h2>
        <form className="gap-4 grid lg:grid-cols-2 grid-cols-1 py-4">
          <div>
            <Input
              label="Nombre"
              name="nombre"
              type="text"
              value={formData?.nombre}
              onChange={(e) => {
                const newName = e.target.value;
                setFormData({ ...formData, nombre: newName });
                validateName(newName);
              }}
              className={
                errors.nombre ? "border-red-500 w-[350px]" : "w-[350px]"
              }
            />
            {errors.nombre && (
              <p className="text-red-500 text-sm mt-1">{errors.nombre}</p>
            )}
          </div>

          <div>
            <Input
              label="Apellido"
              name="apellido"
              type="text"
              className={
                errors.apellido ? "border-red-500 w-[350px]" : "w-[350px]"
              }
              value={formData?.apellido}
              onChange={(e) => {
                const newLastname = e.target.value;
                setFormData({ ...formData, apellido: newLastname });
                validateLastname(newLastname);
              }}
            />
            {errors.apellido && (
              <p className="text-red-500 text-sm mt-1">{errors.apellido}</p>
            )}
          </div>

          <Input
            label="Email"
            name="email"
            type="email"
            className="w-[350px]"
            value={formData?.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
          />
          <Input
            label="Teléfono"
            name="telefono"
            type="tel"
            className="w-[350px]"
            value={formData?.telefono}
            onChange={(e) =>
              setFormData({ ...formData, telefono: e.target.value })
            }
          />

          <div className="flex flex-row gap-2">
            <select
              name="tipoDocumento"
              onChange={(e) =>
                setFormData({
                  ...formData,
                  tipoDocumentoId: parseInt(e.target.value),
                })
              }
              className="w-[80px] h-[42px] py-2 mt-8 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:shadow-lg font-['Poppins'] duration-300"
            >
              {TypeDocument.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.nombre}
                </option>
              ))}
            </select>
            <div>
              <Input
                label="Número de Documento"
                name="numeroDocumento"
                type="text"
                className={
                  errors.numeroDocumento
                    ? "border-red-500 w-[260px]"
                    : "w-[260px]"
                }
                value={formData?.numeroDocumento}
                onChange={(e) => {
                  const newDocument = e.target.value;
                  setFormData({ ...formData, numeroDocumento: newDocument });
                  validateDocument(newDocument);
                }}
              />
              {errors.numeroDocumento && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.numeroDocumento}
                </p>
              )}
            </div>
          </div>
        </form>
      </div>
    </Modal>
  );
};
