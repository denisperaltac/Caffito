import React, { useState, useEffect } from "react";
import { configurationService } from "../../services/configurationService";
import { PointOfSale } from "../../types/configuration";

const PointsOfSalePage: React.FC = () => {
  const [pointsOfSale, setPointsOfSale] = useState<PointOfSale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedPointOfSale, setSelectedPointOfSale] =
    useState<PointOfSale | null>(null);
  const [formData, setFormData] = useState<Omit<PointOfSale, "id">>({
    nombre: "",
    direccion: "",
    telefono: "",
    activo: true,
    observaciones: "",
  });

  useEffect(() => {
    loadPointsOfSale();
  }, []);

  const loadPointsOfSale = async () => {
    try {
      setLoading(true);
      const data = await configurationService.getPointsOfSale();
      setPointsOfSale(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al cargar los puntos de venta"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      await configurationService.createPointOfSale(formData);
      setShowModal(false);
      setFormData({
        nombre: "",
        direccion: "",
        telefono: "",
        activo: true,
        observaciones: "",
      });
      await loadPointsOfSale();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al crear el punto de venta"
      );
    }
  };

  const handleUpdate = async () => {
    if (!selectedPointOfSale) return;
    try {
      await configurationService.updatePointOfSale(
        selectedPointOfSale.id,
        formData
      );
      setShowModal(false);
      setSelectedPointOfSale(null);
      setFormData({
        nombre: "",
        direccion: "",
        telefono: "",
        activo: true,
        observaciones: "",
      });
      await loadPointsOfSale();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al actualizar el punto de venta"
      );
    }
  };

  const handleDelete = async (id: string) => {
    if (
      !window.confirm("¿Está seguro de que desea eliminar este punto de venta?")
    )
      return;
    try {
      await configurationService.deletePointOfSale(id);
      await loadPointsOfSale();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al eliminar el punto de venta"
      );
    }
  };

  const handleEdit = (pointOfSale: PointOfSale) => {
    setSelectedPointOfSale(pointOfSale);
    setFormData({
      nombre: pointOfSale.nombre,
      direccion: pointOfSale.direccion,
      telefono: pointOfSale.telefono,
      activo: pointOfSale.activo,
      observaciones: pointOfSale.observaciones || "",
    });
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Puntos de Venta</h1>
        <button
          onClick={() => {
            setSelectedPointOfSale(null);
            setFormData({
              nombre: "",
              direccion: "",
              telefono: "",
              activo: true,
              observaciones: "",
            });
            setShowModal(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Nuevo Punto de Venta
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Dirección
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Teléfono
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {pointsOfSale.map((pointOfSale) => (
              <tr key={pointOfSale.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {pointOfSale.nombre}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {pointOfSale.direccion}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {pointOfSale.telefono}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      pointOfSale.activo
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {pointOfSale.activo ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleEdit(pointOfSale)}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(pointOfSale.id)}
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {selectedPointOfSale ? "Editar" : "Nuevo"} Punto de Venta
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) =>
                      setFormData({ ...formData, nombre: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Dirección
                  </label>
                  <input
                    type="text"
                    value={formData.direccion}
                    onChange={(e) =>
                      setFormData({ ...formData, direccion: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Teléfono
                  </label>
                  <input
                    type="text"
                    value={formData.telefono}
                    onChange={(e) =>
                      setFormData({ ...formData, telefono: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Estado
                  </label>
                  <select
                    value={formData.activo ? "true" : "false"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        activo: e.target.value === "true",
                      })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="true">Activo</option>
                    <option value="false">Inactivo</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Observaciones
                  </label>
                  <textarea
                    value={formData.observaciones}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        observaciones: e.target.value,
                      })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    rows={3}
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Cancelar
                </button>
                <button
                  onClick={selectedPointOfSale ? handleUpdate : handleCreate}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {selectedPointOfSale ? "Actualizar" : "Crear"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PointsOfSalePage;
