import React, { useState, useEffect } from "react";
import { Tax } from "../../types/inventory";
import { inventoryService } from "./inventoryService";

const TaxesPage: React.FC = () => {
  const [taxes, setTaxes] = useState<Tax[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedTax, setSelectedTax] = useState<Tax | null>(null);

  useEffect(() => {
    fetchTaxes();
  }, []);

  const fetchTaxes = async () => {
    try {
      const data = await inventoryService.getTaxes();
      setTaxes(data);
    } catch (error) {
      console.error("Error fetching taxes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (taxData: Omit<Tax, "id">) => {
    try {
      await inventoryService.createTax(taxData);
      fetchTaxes();
    } catch (error) {
      console.error("Error creating tax:", error);
    }
  };

  const handleUpdate = async (id: string, taxData: Partial<Tax>) => {
    try {
      await inventoryService.updateTax(id, taxData);
      fetchTaxes();
    } catch (error) {
      console.error("Error updating tax:", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await inventoryService.deleteTax(id);
      fetchTaxes();
    } catch (error) {
      console.error("Error deleting tax:", error);
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
        <h1 className="text-2xl font-bold">Impuestos</h1>
        <button
          onClick={() => {
            setSelectedTax(null);
            setShowModal(true);
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Agregar Impuesto
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Porcentaje
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
            {taxes.map((tax) => (
              <tr key={tax.id}>
                <td className="px-6 py-4 whitespace-nowrap">{tax.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {tax.percentage}%
                </td>
                <td className="px-6 py-4">{tax.description}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      tax.active
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {tax.active ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => {
                      setSelectedTax(tax);
                      setShowModal(true);
                    }}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(tax.id)}
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
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {selectedTax ? "Editar Impuesto" : "Nuevo Impuesto"}
              </h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const taxData = {
                    name: formData.get("name") as string,
                    percentage: Number(formData.get("percentage")),
                    description: formData.get("description") as string,
                    active: formData.get("active") === "true",
                  };

                  if (selectedTax) {
                    handleUpdate(selectedTax.id, taxData);
                  } else {
                    handleCreate(taxData);
                  }
                  setShowModal(false);
                }}
                className="mt-4"
              >
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Nombre
                  </label>
                  <input
                    type="text"
                    name="name"
                    defaultValue={selectedTax?.name}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Porcentaje
                  </label>
                  <input
                    type="number"
                    name="percentage"
                    min="0"
                    max="100"
                    step="0.01"
                    defaultValue={selectedTax?.percentage}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Descripción
                  </label>
                  <textarea
                    name="description"
                    defaultValue={selectedTax?.description}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    rows={3}
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Estado
                  </label>
                  <select
                    name="active"
                    defaultValue={selectedTax?.active ? "true" : "false"}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  >
                    <option value="true">Activo</option>
                    <option value="false">Inactivo</option>
                  </select>
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded mr-2 hover:bg-gray-400"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    {selectedTax ? "Actualizar" : "Crear"}
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

export default TaxesPage;
