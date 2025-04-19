import React, { useState, useEffect } from "react";
import { configurationService } from "../../services/configurationService";
import { Promotion } from "../../types/configuration";
import { formatDate } from "../../utils/formatters";

const PromotionsPage: React.FC = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(
    null
  );
  const [formData, setFormData] = useState<Omit<Promotion, "id">>({
    nombre: "",
    descripcion: "",
    fechaInicio: new Date(),
    fechaFin: new Date(),
    descuento: 0,
    activo: true,
  });

  useEffect(() => {
    loadPromotions();
  }, []);

  const loadPromotions = async () => {
    try {
      setLoading(true);
      const data = await configurationService.getPromotions();
      setPromotions(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cargar las promociones"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      await configurationService.createPromotion(formData);
      setShowModal(false);
      setFormData({
        nombre: "",
        descripcion: "",
        fechaInicio: new Date(),
        fechaFin: new Date(),
        descuento: 0,
        activo: true,
      });
      await loadPromotions();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al crear la promoción"
      );
    }
  };

  const handleUpdate = async () => {
    if (!selectedPromotion) return;
    try {
      await configurationService.updatePromotion(
        selectedPromotion.id,
        formData
      );
      setShowModal(false);
      setSelectedPromotion(null);
      setFormData({
        nombre: "",
        descripcion: "",
        fechaInicio: new Date(),
        fechaFin: new Date(),
        descuento: 0,
        activo: true,
      });
      await loadPromotions();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al actualizar la promoción"
      );
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("¿Está seguro de que desea eliminar esta promoción?"))
      return;
    try {
      await configurationService.deletePromotion(id);
      await loadPromotions();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al eliminar la promoción"
      );
    }
  };

  const handleEdit = (promotion: Promotion) => {
    setSelectedPromotion(promotion);
    setFormData({
      nombre: promotion.nombre,
      descripcion: promotion.descripcion,
      fechaInicio: promotion.fechaInicio,
      fechaFin: promotion.fechaFin,
      descuento: promotion.descuento,
      activo: promotion.activo,
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
        <h1 className="text-2xl font-bold">Promociones</h1>
        <button
          onClick={() => {
            setSelectedPromotion(null);
            setFormData({
              nombre: "",
              descripcion: "",
              fechaInicio: new Date(),
              fechaFin: new Date(),
              descuento: 0,
              activo: true,
            });
            setShowModal(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Nueva Promoción
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
                Descripción
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha Inicio
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha Fin
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Descuento
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
            {promotions.map((promotion) => (
              <tr key={promotion.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {promotion.nombre}
                </td>
                <td className="px-6 py-4">{promotion.descripcion}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {formatDate(promotion.fechaInicio)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {formatDate(promotion.fechaFin)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {promotion.descuento}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      promotion.activo
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {promotion.activo ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleEdit(promotion)}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(promotion.id)}
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
                {selectedPromotion ? "Editar" : "Nueva"} Promoción
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
                    Descripción
                  </label>
                  <textarea
                    value={formData.descripcion}
                    onChange={(e) =>
                      setFormData({ ...formData, descripcion: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Fecha Inicio
                  </label>
                  <input
                    type="date"
                    value={formData.fechaInicio.toISOString().split("T")[0]}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        fechaInicio: new Date(e.target.value),
                      })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Fecha Fin
                  </label>
                  <input
                    type="date"
                    value={formData.fechaFin.toISOString().split("T")[0]}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        fechaFin: new Date(e.target.value),
                      })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Descuento (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.descuento}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        descuento: parseInt(e.target.value),
                      })
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
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Cancelar
                </button>
                <button
                  onClick={selectedPromotion ? handleUpdate : handleCreate}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {selectedPromotion ? "Actualizar" : "Crear"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromotionsPage;
