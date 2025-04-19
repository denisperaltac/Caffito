import React, { useState, useEffect } from "react";
import { Producto } from "../../types/configuration";
import { productService } from "../../services/productService";

const ITEMS_PER_PAGE = 10;

const StockManagementPage: React.FC = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoria, setSelectedCategoria] = useState<string>("");
  const [stockMinimo, setStockMinimo] = useState<number>(10);
  const [editingProducto, setEditingProducto] = useState<Producto | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [cantidadAjuste, setCantidadAjuste] = useState<number>(0);

  // Cargar productos al montar el componente o cuando cambien los filtros
  useEffect(() => {
    loadProductos();
  }, [currentPage, searchTerm, selectedCategoria]);

  const loadProductos = async () => {
    try {
      setLoading(true);
      const [response, count] = await Promise.all([
        productService.getProductos({
          page: currentPage,
          size: ITEMS_PER_PAGE,
          nombre: searchTerm || undefined,
          categoriaId: selectedCategoria || undefined,
        }),
        productService.getCountProductos({
          nombre: searchTerm || undefined,
          categoriaId: selectedCategoria || undefined,
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
    }
  };

  // Obtener categorías únicas
  const categorias = [...new Set(productos?.map((p) => p.categoriaId.id))];

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
        await productService.deleteProducto(id.toString());
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

      const updatedProducto = await productService.updateProducto(
        productoConPorcentaje.id.toString(),
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 min-w-[95vw]">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Gestión de Stock</h1>
        <div className="text-sm text-gray-600">
          Mostrando {productos?.length} de {totalCount} productos
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Buscar Producto
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(0);
              }}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nombre del producto..."
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Categoría
            </label>
            <select
              value={selectedCategoria}
              onChange={(e) => {
                setSelectedCategoria(e.target.value);
                setCurrentPage(0);
              }}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas las categorías</option>
              {categorias.map((categoriaId) => {
                const categoria = productos.find(
                  (p) => p.categoriaId.id === categoriaId
                )?.categoriaId;
                return (
                  <option key={categoriaId} value={categoriaId}>
                    {categoria?.nombre.trim()}
                  </option>
                );
              })}
            </select>
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Stock Mínimo
            </label>
            <input
              type="number"
              value={stockMinimo}
              onChange={(e) => setStockMinimo(Number(e.target.value))}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
            />
          </div>
        </div>
      </div>

      {/* Tabla de Productos */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Código Referencia
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoría
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Marca
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cantidad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Proveedor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ($) Costo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ($) Venta
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ($) May.
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pto. de pedido
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock ideal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {producto.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {producto.codigoReferencia.trim()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {producto.nombre.trim()}
                      </div>
                      <div className="text-sm text-gray-500">
                        {producto.descripcion?.trim()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {producto.categoriaId.nombre.trim()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {producto.marcaId.nombre.trim()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {producto.cantidad}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {proveedorActivo?.proveedor.nombreProveedor.trim()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {proveedorActivo?.precioCosto.toLocaleString("es-AR", {
                        style: "currency",
                        currency: "ARS",
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {proveedorActivo?.precioVenta.toLocaleString("es-AR", {
                        style: "currency",
                        currency: "ARS",
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {proveedorActivo?.precioMayorista.toLocaleString(
                        "es-AR",
                        { style: "currency", currency: "ARS" }
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {producto.stockMin || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {producto.stockMax || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        className="text-blue-600 hover:text-blue-900 mr-3"
                        onClick={() => handleEdit(producto)}
                      >
                        Editar
                      </button>
                      <button
                        className="text-red-600 hover:text-red-900"
                        onClick={() => handleDelete(producto.id)}
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
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
            {/* Primera página */}
            <button
              onClick={() => handlePageChange(0)}
              disabled={currentPage === 0}
              className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="sr-only">Primera</span>
              <svg
                className="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 010 1.414zm-6 0a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 011.414 1.414L5.414 10l4.293 4.293a1 1 0 010 1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {/* Página anterior */}
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 0}
              className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="sr-only">Anterior</span>
              <svg
                className="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {/* Páginas alrededor de la actual */}
            {(() => {
              const pages = [];
              const maxPagesToShow = 5;
              let startPage = Math.max(
                0,
                currentPage - Math.floor(maxPagesToShow / 2)
              );
              let endPage = Math.min(
                totalPages - 1,
                startPage + maxPagesToShow - 1
              );

              if (endPage - startPage + 1 < maxPagesToShow) {
                startPage = Math.max(0, endPage - maxPagesToShow + 1);
              }

              for (let i = startPage; i <= endPage; i++) {
                pages.push(
                  <button
                    key={i}
                    onClick={() => handlePageChange(i)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      currentPage === i
                        ? "z-10 bg-indigo-50 border-indigo-500 text-indigo-600"
                        : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    {i + 1}
                  </button>
                );
              }

              return pages;
            })()}

            {/* Página siguiente */}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages - 1}
              className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="sr-only">Siguiente</span>
              <svg
                className="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {/* Última página */}
            <button
              onClick={() => handlePageChange(totalPages - 1)}
              disabled={currentPage === totalPages - 1}
              className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="sr-only">Última</span>
              <svg
                className="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10.293 15.707a1 1 0 010-1.414L14.586 10l-4.293-4.293a1 1 0 111.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0zM4.293 15.707a1 1 0 010-1.414L8.586 10 4.293 5.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </nav>
        </div>
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
                              ).toFixed(2)
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
