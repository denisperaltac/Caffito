import React, { useState, useEffect } from "react";
import { PaymentType } from "../../types/configuration";
import { configurationService } from "../../services/configurationService";

const PaymentTypesPage: React.FC = () => {
  const [paymentTypes, setPaymentTypes] = useState<PaymentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedPaymentType, setSelectedPaymentType] =
    useState<PaymentType | null>(null);
  const [formData, setFormData] = useState<Omit<PaymentType, "id">>({
    nombre: "",
    descripcion: "",
    activo: true,
  });

  useEffect(() => {
    loadPaymentTypes();
  }, []);

  const loadPaymentTypes = async () => {
    try {
      setLoading(true);
      const data = await configurationService.getPaymentTypes();
      setPaymentTypes(data);
      setError(null);
    } catch (err) {
      setError("Error al cargar los tipos de pago");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      await configurationService.createPaymentType(formData);
      setShowModal(false);
      setFormData({ nombre: "", descripcion: "", activo: true });
      loadPaymentTypes();
    } catch (err) {
      setError("Error al crear el tipo de pago");
      console.error(err);
    }
  };

  const handleUpdate = async () => {
    if (!selectedPaymentType) return;

    try {
      await configurationService.updatePaymentType(
        selectedPaymentType.id,
        formData
      );
      setShowModal(false);
      setSelectedPaymentType(null);
      setFormData({ nombre: "", descripcion: "", activo: true });
      loadPaymentTypes();
    } catch (err) {
      setError("Error al actualizar el tipo de pago");
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (
      !window.confirm("¿Está seguro de que desea eliminar este tipo de pago?")
    ) {
      return;
    }

    try {
      await configurationService.deletePaymentType(id);
      loadPaymentTypes();
    } catch (err) {
      setError("Error al eliminar el tipo de pago");
      console.error(err);
    }
  };

  const handleEdit = (paymentType: PaymentType) => {
    setSelectedPaymentType(paymentType);
    setFormData({
      nombre: paymentType.nombre,
      descripcion: paymentType.descripcion,
      activo: paymentType.activo,
    });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPaymentType) {
      handleUpdate();
    } else {
      handleCreate();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Tipos de Pago</h1>
        <button
          onClick={() => {
            setSelectedPaymentType(null);
            setFormData({ nombre: "", descripcion: "", activo: true });
            setShowModal(true);
          }}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Nuevo Tipo de Pago
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Descripción
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paymentTypes.map((paymentType) => (
              <tr key={paymentType.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {paymentType.nombre}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {paymentType.descripcion}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      paymentType.activo
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {paymentType.activo ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleEdit(paymentType)}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(paymentType.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                {selectedPaymentType
                  ? "Editar Tipo de Pago"
                  : "Nuevo Tipo de Pago"}
              </h3>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) =>
                      setFormData({ ...formData, nombre: e.target.value })
                    }
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Descripción
                  </label>
                  <textarea
                    value={formData.descripcion}
                    onChange={(e) =>
                      setFormData({ ...formData, descripcion: e.target.value })
                    }
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    rows={3}
                  />
                </div>
                <div className="mb-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.activo}
                      onChange={(e) =>
                        setFormData({ ...formData, activo: e.target.checked })
                      }
                      className="form-checkbox h-5 w-5 text-blue-600"
                    />
                    <span className="ml-2 text-gray-700">Activo</span>
                  </label>
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                  >
                    {selectedPaymentType ? "Actualizar" : "Crear"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentTypesPage;
