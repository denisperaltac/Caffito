import React, { useState, useEffect } from "react";
import { Supplier } from "../../types/inventory";
import { inventoryService } from "../../services/inventoryService";

const SuppliersPage: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(
    null
  );
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(20);
  const [totalSuppliers, setTotalSuppliers] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [countLoading, setCountLoading] = useState(false);

  useEffect(() => {
    fetchSuppliers();
  }, [currentPage]);

  useEffect(() => {
    fetchSuppliersCount();
  }, []);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const data = await inventoryService.getSuppliers(currentPage, pageSize);
      setSuppliers(data);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSuppliersCount = async () => {
    try {
      setCountLoading(true);
      const count = await inventoryService.getSuppliersCount();
      setTotalSuppliers(count);
      setTotalPages(Math.ceil(count / pageSize));
    } catch (error) {
      console.error("Error fetching suppliers count:", error);
    } finally {
      setCountLoading(false);
    }
  };

  const handleCreate = async (supplierData: Omit<Supplier, "id">) => {
    try {
      await inventoryService.createSupplier(supplierData);
      fetchSuppliers();
      fetchSuppliersCount();
    } catch (error) {
      console.error("Error creating supplier:", error);
    }
  };

  const handleUpdate = async (id: number, supplierData: Partial<Supplier>) => {
    try {
      await inventoryService.updateSupplier(id, supplierData);
      fetchSuppliers();
      fetchSuppliersCount();
    } catch (error) {
      console.error("Error updating supplier:", error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await inventoryService.deleteSupplier(id);
      fetchSuppliers();
      fetchSuppliersCount();
    } catch (error) {
      console.error("Error deleting supplier:", error);
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
        <h1 className="text-2xl font-bold">Proveedores</h1>
        <button
          onClick={() => {
            setSelectedSupplier(null);
            setShowModal(true);
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Agregar Proveedor
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Teléfono
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ubicación
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {suppliers.map((supplier) => (
              <tr key={supplier.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {supplier.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {supplier.nombreProveedor.trim()}
                  </div>
                  <div className="text-sm text-gray-500">
                    {supplier.calle.trim() && supplier.numeroCalle.trim()
                      ? `${supplier.calle.trim()} ${supplier.numeroCalle.trim()}`
                      : supplier.calle.trim() ||
                        supplier.numeroCalle.trim() ||
                        "Sin dirección"}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {supplier.telefono.trim() || "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {supplier.email.trim() || "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {supplier.localidadId.nombre.trim()}
                    </span>
                    <span className="text-xs text-gray-400">
                      {supplier.localidadId.departamentoId.nombre.trim()},{" "}
                      {supplier.localidadId.departamentoId.provinciaId.nombre.trim()}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => {
                      setSelectedSupplier(supplier);
                      setShowModal(true);
                    }}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(supplier.id)}
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

      {/* Paginación mejorada */}
      <div className="flex justify-between items-center mt-4">
        <div className="text-sm text-gray-700">
          Mostrando {suppliers.length} de{" "}
          {countLoading ? "..." : totalSuppliers} proveedores
          {totalPages > 0 && !countLoading && (
            <span className="ml-2 text-gray-500">
              (Página {currentPage + 1} de {totalPages})
            </span>
          )}
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
            disabled={currentPage === 0}
            className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Anterior
          </button>
          <span className="px-3 py-1 text-sm text-gray-700">
            Página {currentPage + 1}
          </span>
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage >= totalPages - 1}
            className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Siguiente
          </button>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {selectedSupplier ? "Editar Proveedor" : "Nuevo Proveedor"}
              </h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const supplierData = {
                    nombreProveedor: formData.get("nombreProveedor") as string,
                    calle: formData.get("calle") as string,
                    numeroCalle: formData.get("numeroCalle") as string,
                    telefono: formData.get("telefono") as string,
                    email: formData.get("email") as string,
                    localidadId: {
                      id: parseInt(formData.get("localidadId") as string),
                      nombre: formData.get("localidadNombre") as string,
                      departamentoId: {
                        id: parseInt(formData.get("departamentoId") as string),
                        nombre: formData.get("departamentoNombre") as string,
                        provinciaId: {
                          id: parseInt(formData.get("provinciaId") as string),
                          nombre: formData.get("provinciaNombre") as string,
                        },
                      },
                    },
                  };

                  if (selectedSupplier) {
                    handleUpdate(selectedSupplier.id, supplierData);
                  } else {
                    handleCreate(supplierData);
                  }
                  setShowModal(false);
                }}
                className="mt-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Nombre del Proveedor *
                    </label>
                    <input
                      type="text"
                      name="nombreProveedor"
                      defaultValue={selectedSupplier?.nombreProveedor}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      name="telefono"
                      defaultValue={selectedSupplier?.telefono}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Calle
                    </label>
                    <input
                      type="text"
                      name="calle"
                      defaultValue={selectedSupplier?.calle}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Número de Calle
                    </label>
                    <input
                      type="text"
                      name="numeroCalle"
                      defaultValue={selectedSupplier?.numeroCalle}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                  </div>
                  <div className="mb-4 md:col-span-2">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      defaultValue={selectedSupplier?.email}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                  </div>
                </div>

                <div className="border-t pt-4 mt-4">
                  <h4 className="text-md font-semibold text-gray-800 mb-4">
                    Ubicación
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-bold mb-2">
                        Provincia *
                      </label>
                      <input
                        type="text"
                        name="provinciaNombre"
                        defaultValue={
                          selectedSupplier?.localidadId?.departamentoId
                            ?.provinciaId?.nombre
                        }
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        required
                      />
                      <input
                        type="hidden"
                        name="provinciaId"
                        defaultValue={
                          selectedSupplier?.localidadId?.departamentoId
                            ?.provinciaId?.id
                        }
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-bold mb-2">
                        Departamento *
                      </label>
                      <input
                        type="text"
                        name="departamentoNombre"
                        defaultValue={
                          selectedSupplier?.localidadId?.departamentoId?.nombre
                        }
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        required
                      />
                      <input
                        type="hidden"
                        name="departamentoId"
                        defaultValue={
                          selectedSupplier?.localidadId?.departamentoId?.id
                        }
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-bold mb-2">
                        Localidad *
                      </label>
                      <input
                        type="text"
                        name="localidadNombre"
                        defaultValue={selectedSupplier?.localidadId?.nombre}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        required
                      />
                      <input
                        type="hidden"
                        name="localidadId"
                        defaultValue={selectedSupplier?.localidadId?.id}
                      />
                    </div>
                  </div>
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
                    {selectedSupplier ? "Actualizar" : "Crear"}
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

export default SuppliersPage;
