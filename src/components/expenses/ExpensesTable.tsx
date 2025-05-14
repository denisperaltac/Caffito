import React from "react";
import { formatDate } from "../../utils/formatters";
import { formatCurrency } from "../../utils/formatters";
import { CategoriaFormat } from "../common/CategoriaFormat";

export const ExpensesTable = ({
  gastos,
  handleSort,
  handleDelete,
  setSelectedGasto,
  setShowModal,
}: {
  gastos: any[];
  handleSort: any;
  handleDelete: (id: number) => void;
  setSelectedGasto: (gasto: any) => void;
  setShowModal: (show: boolean) => void;
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => handleSort("id")}
            >
              ID
            </th>
            <th
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => handleSort("name")}
            >
              Nombre
            </th>
            <th
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => handleSort("monto")}
            >
              Monto
            </th>
            <th
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => handleSort("categoriaId")}
            >
              Categoría
            </th>
            <th
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => handleSort("proveedorId")}
            >
              Proveedor
            </th>
            <th
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => handleSort("fecha")}
            >
              Fecha
            </th>
            <th
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => handleSort("pagado")}
            >
              Estado
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {gastos?.map((gasto) => {
            let { icon, color } = CategoriaFormat(
              gasto.categoria?.name || "Sin categoría"
            );

            return (
              <tr key={gasto.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {gasto.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {gasto.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatCurrency(gasto.monto)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {gasto.categoria?.name ? (
                    <span
                      className={`flex flex-row items-center justify-between gap-2 px-2 py-1 w-full h-full rounded-lg`}
                      style={{ backgroundColor: color }}
                    >
                      {gasto.categoria?.name} {icon}
                    </span>
                  ) : (
                    <span>Sin Categoria</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {gasto.proveedor?.name || "Sin proveedor"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(gasto.fecha)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      gasto.pagado
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {gasto.pagado ? "Pagado" : "Pendiente"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => {
                      setSelectedGasto(gasto);
                      setShowModal(true);
                    }}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(gasto.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
