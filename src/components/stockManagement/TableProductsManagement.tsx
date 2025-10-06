import { Producto } from "../../types/inventory";
import { CategoriaFormat } from "../common/CategoriaFormat";
import { Button } from "../common/Button";
import { HiOutlinePencilAlt, HiOutlineTrash } from "react-icons/hi";
import { DeleteProductModal } from "./DeleteProductModal";
import { useState } from "react";

interface TableProductsManagementProps {
  productos: Producto[];
  handleEdit: (producto: Producto) => void;
  handleDelete: (id: number, productName?: string) => void;
}

export const TableProductsManagement = ({
  productos,
  handleEdit,
  handleDelete,
}: TableProductsManagementProps) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<{
    id: number;
    name: string;
    brand: string;
  } | null>(null);

  const handleDeleteClick = (producto: Producto) => {
    setProductToDelete({
      id: producto.id,
      name: producto.nombre.trim(),
      brand: producto.marcaId.nombre.trim(),
    });
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (productToDelete) {
      handleDelete(productToDelete.id, productToDelete.name);
      setShowDeleteModal(false);
      setProductToDelete(null);
    }
  };

  const handleCloseModal = () => {
    setShowDeleteModal(false);
    setProductToDelete(null);
  };

  return (
    <>
      <table className="min-w-full transition-opacity-300 divide-y divide-gray-200 ">
        <thead>
          <tr>
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
              Cant.
            </th>
            <th className="px-6 py-3 text-right text-xssm font-medium text-gray-500 uppercase tracking-wider">
              ($) Costo
            </th>
            <th className="px-6 py-3 text-right text-xssm font-medium text-gray-500 uppercase tracking-wider">
              (%)
            </th>
            <th className="px-6 py-3 text-right text-xssm font-medium text-gray-500 uppercase tracking-wider">
              ($) Venta
            </th>
            {/* <th className="px-6 py-3 text-right text-xssm font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
            ($) May.
          </th> */}
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
                <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900">
                  {producto.codigoReferencia.trim()}
                </td>
                <td className="px-6 py-3">
                  <div className="text-sm font-medium">
                    <div className="flex justify-between items-center gap-2">
                      <span
                        onClick={() => handleEdit(producto)}
                        className="cursor-pointer text-blue-800 underline duration-300 hover:text-blue-500"
                      >
                        {producto.nombre.trim()}
                      </span>
                      <div className="flex justify-center items-center gap-6">
                        <Button
                          color="blue"
                          onClick={() => handleEdit(producto)}
                          padding={"px-2 py-1"}
                          style={"hover:scale-110"}
                        >
                          <HiOutlinePencilAlt size={20} />
                        </Button>
                        <Button
                          color="red"
                          onClick={() => handleDeleteClick(producto)}
                          padding={"px-2 py-1"}
                          style={"hover:scale-110"}
                        >
                          <HiOutlineTrash size={20} />
                        </Button>
                      </div>
                    </div>
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
                <td className="px-6 py-3 font-semibold whitespace-nowrap text-right text-base text-gray-900">
                  {proveedorActivo?.precioCosto.toLocaleString("es-AR", {
                    style: "currency",
                    currency: "ARS",
                  })}
                </td>
                <td className="px-6 py-3 whitespace-nowrap text-right text-base text-gray-600">
                  {proveedorActivo?.precioCosto > 0 &&
                  proveedorActivo?.precioVenta > 0
                    ? Number(
                        (
                          (proveedorActivo?.precioVenta /
                            proveedorActivo?.precioCosto -
                            1) *
                          100
                        ).toFixed(2)
                      )
                    : proveedorActivo?.porcentajeGanancia}
                  %
                </td>
                <td className="px-6 py-3 font-semibold whitespace-nowrap text-right text-base text-gray-900">
                  {proveedorActivo?.precioVenta.toLocaleString("es-AR", {
                    style: "currency",
                    currency: "ARS",
                  })}
                </td>
                {/* <td className="px-6 py-3 whitespace-nowrap text-right text-sm text-gray-900 hidden md:table-cell">
                {proveedorActivo?.precioMayorista.toLocaleString("es-AR", {
                  style: "currency",
                  currency: "ARS",
                })}
              </td> */}
              </tr>
            );
          })}
        </tbody>
      </table>

      <DeleteProductModal
        isOpen={showDeleteModal}
        onClose={handleCloseModal}
        onConfirm={handleConfirmDelete}
        productName={productToDelete?.name || ""}
        productBrand={productToDelete?.brand || ""}
      />
    </>
  );
};
