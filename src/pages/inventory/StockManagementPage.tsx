import React, { useState, useEffect } from "react";
import { productService } from "../../services/productService";
import Loader from "../../components/common/Loader";
import { FaEdit, FaTrash } from "react-icons/fa";
import { Producto } from "../../types/inventory";
import { Pagination } from "../../components/common/Pagination";

const ITEMS_PER_PAGE = 10;

const StockManagementPage: React.FC = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchCode, setSearchCode] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [debouncedSearchCode, setDebouncedSearchCode] = useState("");
  const [editingProducto, setEditingProducto] = useState<Producto | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [cantidadAjuste, setCantidadAjuste] = useState<number>(0);
  const [isSearching, setIsSearching] = useState(false);

  // Debounce para la búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setDebouncedSearchCode(searchCode);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, searchCode]);

  // Cargar productos al montar el componente o cuando cambien los filtros
  useEffect(() => {
    loadProductos();
  }, [currentPage, debouncedSearchTerm, debouncedSearchCode]);

  const loadProductos = async () => {
    try {
      setIsSearching(true);
      const [response, count] = await Promise.all([
        productService.getProductos({
          page: currentPage,
          size: ITEMS_PER_PAGE,
          nombre: debouncedSearchTerm || undefined,
          codigoReferencia: debouncedSearchCode || undefined,
        }),
        productService.getCountProductos({
          nombre: debouncedSearchTerm || undefined,
          codigoReferencia: debouncedSearchCode || undefined,
        }),
      ]);

      setProductos(response);
      setTotalCount(count);
      setTotalPages(Math.ceil(count / ITEMS_PER_PAGE));
      setError(null);
    } catch (err) {
      setError("Error al cargar los productos");
      console.error(err);
    } finally {
      setLoading(false);
      setIsSearching(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setIsSearching(true);
  };

  const handleCodeSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchCode(e.target.value);
    setIsSearching(true);
  };

  const handleEdit = (producto: Producto) => {
    // Encontrar el proveedor activo
    const proveedorActivo = producto.productoProveedors.find((pp) => pp.activo);

    // Calcular el porcentaje de ganancia si existe precio de costo y venta
    const porcentajeGanancia =
      proveedorActivo?.precioCosto && proveedorActivo?.precioVenta
        ? Number(
            (
              (proveedorActivo.precioVenta / proveedorActivo.precioCosto - 1) *
              100
            ).toFixed(2)
          )
        : 30; // Valor por defecto si no se puede calcular

    // Asegurarse de que el proveedor activo tenga el porcentaje de ganancia calculado
    const productoConPorcentaje = {
      ...producto,
      productoProveedors: producto.productoProveedors.map((pp) => ({
        ...pp,
        porcentajeGanancia: pp.activo
          ? porcentajeGanancia
          : pp.porcentajeGanancia || 30,
      })),
    };

    setEditingProducto(productoConPorcentaje);
    setShowEditModal(true);
    setCantidadAjuste(0);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("¿Está seguro que desea eliminar este producto?")) {
      try {
        await productService.deleteProduct(id);
        // Recargar la página actual después de eliminar
        loadProductos();
      } catch (err) {
        setError("Error al eliminar el producto");
        console.error(err);
      }
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProducto) return;

    try {
      // Asegurarse de que el proveedor activo tenga un porcentaje de ganancia
      const productoConPorcentaje = {
        ...editingProducto,
        productoProveedors: editingProducto.productoProveedors.map((pp) => ({
          ...pp,
          porcentajeGanancia: pp.porcentajeGanancia || 30,
        })),
      };

      await productService.updateProducto(
        productoConPorcentaje.id || 0,
        productoConPorcentaje,
        cantidadAjuste
      );
      loadProductos();
      setShowEditModal(false);
      setEditingProducto(null);
      setCantidadAjuste(0);
    } catch (err) {
      setError("Error al actualizar el producto");
      console.error(err);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="container px-4 min-w-[95vw] h-[85vh]">
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-2xl font-bold text-gray-800">Gestión de Stock</h1>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Filtros */}
      <div className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nombre del producto..."
            />
          </div>

          <div className="relative">
            <input
              type="text"
              value={searchCode}
              onChange={handleCodeSearchChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Código de referencia..."
            />
          </div>
        </div>
      </div>

      {/* Tabla de Productos */}
      <div className="bg-white shadow-md rounded-lg overflow-auto h-[65vh]">
        <div className="overflow-x-auto">
          {isSearching ? (
            <div className="flex justify-center items-center h-64">
              <Loader size="lg" />
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
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
                  const proveedorActivo = producto.productoProveedors.find(
                    (pp) => pp.activo
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
                        {producto.categoriaId.nombre.trim()}
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900 hidden md:table-cell">
                        {producto.marcaId.nombre.trim()}
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900 hidden md:table-cell">
                        {producto.cantidad}
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900">
                        {proveedorActivo?.precioCosto.toLocaleString("es-AR", {
                          style: "currency",
                          currency: "ARS",
                        })}
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900">
                        {proveedorActivo?.precioVenta.toLocaleString("es-AR", {
                          style: "currency",
                          currency: "ARS",
                        })}
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900 hidden md:table-cell">
                        {proveedorActivo?.precioMayorista.toLocaleString(
                          "es-AR",
                          { style: "currency", currency: "ARS" }
                        )}
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap text-sm font-medium">
                        <button
                          className="text-blue-600 hover:text-blue-900 mr-3"
                          onClick={() => handleEdit(producto)}
                        >
                          <FaEdit className="w-5 h-5" />
                        </button>
                        <button
                          className="text-red-600 hover:text-red-900"
                          onClick={() => handleDelete(producto.id)}
                        >
                          <FaTrash className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          setCurrentPage={setCurrentPage}
          totalItems={totalCount}
          items={productos}
        />
      )}

      {/* Modal de Edición */}
      {showEditModal && editingProducto && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-3/4 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Editar Producto
              </h3>
              <form onSubmit={handleSaveEdit}>
                <div className="grid grid-cols-2 gap-6">
                  {/* Columna Izquierda */}
                  <div>
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-bold mb-2">
                        Nombre
                      </label>
                      <input
                        type="text"
                        value={editingProducto.nombre}
                        onChange={(e) =>
                          setEditingProducto({
                            ...editingProducto,
                            nombre: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-bold mb-2">
                        Código Referencia
                      </label>
                      <input
                        type="text"
                        value={editingProducto.codigoReferencia}
                        onChange={(e) =>
                          setEditingProducto({
                            ...editingProducto,
                            codigoReferencia: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-bold mb-2">
                        Cantidad
                      </label>
                      <input
                        type="number"
                        value={editingProducto.cantidad}
                        onChange={(e) =>
                          setEditingProducto({
                            ...editingProducto,
                            cantidad: Number(e.target.value),
                          })
                        }
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-bold mb-2">
                        Punto de pedido
                      </label>
                      <input
                        type="number"
                        value={editingProducto.stockMin || ""}
                        onChange={(e) =>
                          setEditingProducto({
                            ...editingProducto,
                            stockMin: e.target.value
                              ? Number(e.target.value)
                              : null,
                          })
                        }
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-bold mb-2">
                        Stock ideal
                      </label>
                      <input
                        type="number"
                        value={editingProducto.stockMax || ""}
                        onChange={(e) =>
                          setEditingProducto({
                            ...editingProducto,
                            stockMax: e.target.value
                              ? Number(e.target.value)
                              : null,
                          })
                        }
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-bold mb-2">
                        Cantidad a Ajustar (positivo para agregar, negativo para
                        restar)
                      </label>
                      <input
                        type="number"
                        value={cantidadAjuste}
                        onChange={(e) =>
                          setCantidadAjuste(Number(e.target.value))
                        }
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Columna Derecha - Precios */}
                  <div>
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-bold mb-2">
                        Precio Costo
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={
                          editingProducto.productoProveedors.find(
                            (pp) => pp.activo
                          )?.precioCosto || ""
                        }
                        onChange={(e) => {
                          const proveedorActivo =
                            editingProducto.productoProveedors.find(
                              (pp) => pp.activo
                            );
                          if (proveedorActivo) {
                            const nuevoPrecioCosto = Number(e.target.value);
                            const porcentajeGanancia =
                              proveedorActivo.porcentajeGanancia || 0;
                            const nuevoPrecioVenta = Number(
                              (
                                nuevoPrecioCosto *
                                (1 + porcentajeGanancia / 100)
                              )?.toFixed(2)
                            );

                            setEditingProducto({
                              ...editingProducto,
                              productoProveedors:
                                editingProducto.productoProveedors.map((pp) =>
                                  pp.id === proveedorActivo.id
                                    ? {
                                        ...pp,
                                        precioCosto: nuevoPrecioCosto,
                                        precioVenta: nuevoPrecioVenta,
                                      }
                                    : pp
                                ),
                            });
                          }
                        }}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-bold mb-2">
                        Porcentaje Ganancia (%)
                      </label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const proveedorActivo =
                              editingProducto.productoProveedors.find(
                                (pp) => pp.activo
                              );
                            if (proveedorActivo) {
                              const nuevoPorcentaje = 45;
                              const precioCosto = proveedorActivo.precioCosto;
                              const nuevoPrecioVenta = Number(
                                (
                                  precioCosto *
                                  (1 + nuevoPorcentaje / 100)
                                )?.toFixed(2)
                              );

                              setEditingProducto({
                                ...editingProducto,
                                productoProveedors:
                                  editingProducto.productoProveedors.map((pp) =>
                                    pp.id === proveedorActivo.id
                                      ? {
                                          ...pp,
                                          porcentajeGanancia: nuevoPorcentaje,
                                          precioVenta: nuevoPrecioVenta,
                                        }
                                      : pp
                                  ),
                              });
                            }
                          }}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm"
                        >
                          45%
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const proveedorActivo =
                              editingProducto.productoProveedors.find(
                                (pp) => pp.activo
                              );
                            if (proveedorActivo) {
                              const nuevoPorcentaje = 50;
                              const precioCosto = proveedorActivo.precioCosto;
                              const nuevoPrecioVenta = Number(
                                (
                                  precioCosto *
                                  (1 + nuevoPorcentaje / 100)
                                ).toFixed(2)
                              );

                              setEditingProducto({
                                ...editingProducto,
                                productoProveedors:
                                  editingProducto.productoProveedors.map((pp) =>
                                    pp.id === proveedorActivo.id
                                      ? {
                                          ...pp,
                                          porcentajeGanancia: nuevoPorcentaje,
                                          precioVenta: nuevoPrecioVenta,
                                        }
                                      : pp
                                  ),
                              });
                            }
                          }}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm"
                        >
                          50%
                        </button>
                        <input
                          type="number"
                          step="0.01"
                          value={
                            editingProducto.productoProveedors.find(
                              (pp) => pp.activo
                            )?.porcentajeGanancia || ""
                          }
                          onChange={(e) => {
                            const proveedorActivo =
                              editingProducto.productoProveedors.find(
                                (pp) => pp.activo
                              );
                            if (proveedorActivo) {
                              const nuevoPorcentaje = Number(e.target.value);
                              const precioCosto = proveedorActivo.precioCosto;
                              const nuevoPrecioVenta = Number(
                                (
                                  precioCosto *
                                  (1 + nuevoPorcentaje / 100)
                                ).toFixed(2)
                              );

                              setEditingProducto({
                                ...editingProducto,
                                productoProveedors:
                                  editingProducto.productoProveedors.map((pp) =>
                                    pp.id === proveedorActivo.id
                                      ? {
                                          ...pp,
                                          porcentajeGanancia: nuevoPorcentaje,
                                          precioVenta: nuevoPrecioVenta,
                                        }
                                      : pp
                                  ),
                              });
                            }
                          }}
                          className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-bold mb-2">
                        Precio Venta
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={
                          editingProducto.productoProveedors.find(
                            (pp) => pp.activo
                          )?.precioVenta || ""
                        }
                        onChange={(e) => {
                          const proveedorActivo =
                            editingProducto.productoProveedors.find(
                              (pp) => pp.activo
                            );
                          if (proveedorActivo) {
                            const nuevoPrecioVenta = Number(e.target.value);
                            const precioCosto = proveedorActivo.precioCosto;
                            const nuevoPorcentaje = Number(
                              (
                                (nuevoPrecioVenta / precioCosto - 1) *
                                100
                              ).toFixed(2)
                            );

                            setEditingProducto({
                              ...editingProducto,
                              productoProveedors:
                                editingProducto.productoProveedors.map((pp) =>
                                  pp.id === proveedorActivo.id
                                    ? {
                                        ...pp,
                                        precioVenta: nuevoPrecioVenta,
                                        porcentajeGanancia: nuevoPorcentaje,
                                      }
                                    : pp
                                ),
                            });
                          }
                        }}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-bold mb-2">
                        Precio Mayorista
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={
                          editingProducto.productoProveedors.find(
                            (pp) => pp.activo
                          )?.precioMayorista || ""
                        }
                        onChange={(e) => {
                          const proveedorActivo =
                            editingProducto.productoProveedors.find(
                              (pp) => pp.activo
                            );
                          if (proveedorActivo) {
                            setEditingProducto({
                              ...editingProducto,
                              productoProveedors:
                                editingProducto.productoProveedors.map((pp) =>
                                  pp.id === proveedorActivo.id
                                    ? {
                                        ...pp,
                                        precioMayorista: Number(e.target.value),
                                      }
                                    : pp
                                ),
                            });
                          }
                        }}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingProducto(null);
                    }}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Guardar
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

export default StockManagementPage;
