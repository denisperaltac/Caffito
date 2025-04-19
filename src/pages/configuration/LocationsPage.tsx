import React, { useState, useEffect } from "react";
import { Location, Department, Province } from "../../types/configuration";
import { configurationService } from "../../services/configurationService";

const LocationsPage: React.FC = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null
  );
  const [formData, setFormData] = useState<Omit<Location, "id">>({
    nombre: "",
    descripcion: "",
    departamentoId: "",
    activo: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [locationsData, departmentsData, provincesData] = await Promise.all(
        [
          configurationService.getLocations(),
          configurationService.getDepartments(),
          configurationService.getProvinces(),
        ]
      );
      setLocations(locationsData);
      setDepartments(departmentsData);
      setProvinces(provincesData);
      setError(null);
    } catch (err) {
      setError("Error al cargar los datos");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      await configurationService.createLocation(formData);
      setShowModal(false);
      setFormData({
        nombre: "",
        descripcion: "",
        departamentoId: "",
        activo: true,
      });
      loadData();
    } catch (err) {
      setError("Error al crear la localidad");
      console.error(err);
    }
  };

  const handleUpdate = async () => {
    if (!selectedLocation) return;

    try {
      await configurationService.updateLocation(selectedLocation.id, formData);
      setShowModal(false);
      setSelectedLocation(null);
      setFormData({
        nombre: "",
        descripcion: "",
        departamentoId: "",
        activo: true,
      });
      loadData();
    } catch (err) {
      setError("Error al actualizar la localidad");
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("¿Está seguro de que desea eliminar esta localidad?")) {
      return;
    }

    try {
      await configurationService.deleteLocation(id);
      loadData();
    } catch (err) {
      setError("Error al eliminar la localidad");
      console.error(err);
    }
  };

  const handleEdit = (location: Location) => {
    setSelectedLocation(location);
    setFormData({
      nombre: location.nombre,
      descripcion: location.descripcion,
      departamentoId: location.departamentoId,
      activo: location.activo,
    });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedLocation) {
      handleUpdate();
    } else {
      handleCreate();
    }
  };

  const getDepartmentName = (departamentoId: string) => {
    const department = departments.find((d) => d.id === departamentoId);
    return department ? department.nombre : "Desconocido";
  };

  const getProvinceName = (departamentoId: string) => {
    const department = departments.find((d) => d.id === departamentoId);
    if (!department) return "Desconocida";

    const province = provinces.find((p) => p.id === department.provinciaId);
    return province ? province.nombre : "Desconocida";
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
        <h1 className="text-2xl font-bold text-gray-800">Localidades</h1>
        <button
          onClick={() => {
            setSelectedLocation(null);
            setFormData({
              nombre: "",
              descripcion: "",
              departamentoId: "",
              activo: true,
            });
            setShowModal(true);
          }}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Nueva Localidad
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
                Departamento
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Provincia
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
            {locations.map((location) => (
              <tr key={location.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {location.nombre}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {location.descripcion}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {getDepartmentName(location.departamentoId)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {getProvinceName(location.departamentoId)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      location.activo
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {location.activo ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleEdit(location)}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(location.id)}
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
                {selectedLocation ? "Editar Localidad" : "Nueva Localidad"}
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
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Departamento
                  </label>
                  <select
                    value={formData.departamentoId}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        departamentoId: e.target.value,
                      })
                    }
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  >
                    <option value="">Seleccione un departamento</option>
                    {departments.map((department) => (
                      <option key={department.id} value={department.id}>
                        {department.nombre} - {getProvinceName(department.id)}
                      </option>
                    ))}
                  </select>
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
                    {selectedLocation ? "Actualizar" : "Crear"}
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

export default LocationsPage;
