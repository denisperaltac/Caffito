import { Producto } from "../../types/inventory";
import { CategoriaFormat } from "../common/CategoriaFormat";
import { Button } from "../common/Button";

interface TableProductsManagementProps {
  productos: Producto[];
  handleEdit: (producto: Producto) => void;
  handleDelete: (id: number) => void;
}

export const TableProductsManagement = ({
  productos,
  handleEdit,
  handleDelete,
}: TableProductsManagementProps) => {
  return (
    <table className="min-w-full transition-opacity-300 divide-y divide-gray-200 ">
      <thead>
        <tr>
          <th className="px-6 py-3 text-left text-xssm font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
            ID
          </th>
          <th className="px-6 py-3 text-left text-xssm font-medium text-gray-500 uppercase tracking-wider">
            Código Referencia
          </th>
          <th className="px-6 py-3 text-left text-xssm font-medium text-gray-500 uppercase tracking-wider">
            Nombre
          </th>
          <th className="px-6 py-3 text-left text-xssm font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
            Categoría
          </th>
          <th className="px-6 py-3 text-left text-xssm font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
            Marca
          </th>
          <th className="px-6 py-3 text-left text-xssm font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
            Cantidad
          </th>
          <th className="px-6 py-3 text-left text-xssm font-medium text-gray-500 uppercase tracking-wider">
            ($) Costo
          </th>
          <th className="px-6 py-3 text-left text-xssm font-medium text-gray-500 uppercase tracking-wider">
            ($) Venta
          </th>
          <th className="px-6 py-3 text-left text-xssm font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
            ($) May.
          </th>
          <th className="px-6 py-3 text-left text-xssm font-medium text-gray-500 uppercase tracking-wider">
            Acciones
          </th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {productos?.map((producto) => {
          const proveedorActivo =
            producto.productoProveedors.find((pp) => pp.activo) ||
            producto.productoProveedors[0];
          let { icon, color } = CategoriaFormat(
            producto.categoriaId?.nombre?.trim() || "Sin categoría"
          );

          return (
            <tr key={producto.id} className="hover:bg-gray-50">
              <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900 hidden md:table-cell">
                {producto.id}
              </td>
              <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900">
                {producto.codigoReferencia.trim()}
              </td>
              <td className="px-6 py-3">
                <div className="text-sm font-medium text-gray-900">
                  {producto.nombre.trim()}
                </div>
                <div className="text-sm text-gray-500">
                  {producto.descripcion?.trim()}
                </div>
              </td>
              <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900 hidden md:table-cell">
                {producto.categoriaId?.nombre ? (
                  <span
                    className={`flex flex-row items-center justify-between gap-2 px-2 py-1 w-full h-full rounded-lg`}
                    style={{ backgroundColor: color }}
                  >
                    {producto.categoriaId?.nombre.trim()} {icon}
                  </span>
                ) : (
                  <span>Sin Categoria</span>
                )}
              </td>
              <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900 hidden md:table-cell">
                {producto.marcaId.nombre.trim()}
              </td>
              <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900 hidden md:table-cell">
                {producto.cantidad}
              </td>
              <td className="px-6 py-3 font-bold whitespace-nowrap text-base text-gray-900">
                {proveedorActivo?.precioCosto.toLocaleString("es-AR", {
                  style: "currency",
                  currency: "ARS",
                })}
              </td>
              <td className="px-6 py-3 font-bold whitespace-nowrap text-base text-gray-900">
                {proveedorActivo?.precioVenta.toLocaleString("es-AR", {
                  style: "currency",
                  currency: "ARS",
                })}
              </td>
              <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900 hidden md:table-cell">
                {proveedorActivo?.precioMayorista.toLocaleString("es-AR", {
                  style: "currency",
                  currency: "ARS",
                })}
              </td>
              <td className="px-6 py-3 whitespace-nowrap text-sm font-medium">
                <div className="flex gap-2">
                  <Button
                    color="blue"
                    text="Editar"
                    onClick={() => handleEdit(producto)}
                  />
                  <Button
                    color="red"
                    text="Eliminar"
                    onClick={() => handleDelete(producto.id)}
                  />
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};
