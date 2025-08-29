import React from "react";
import { Producto } from "../../types/inventory";

interface EditProductProps {
  handleSaveEdit: (e: React.FormEvent) => void;
  editingProducto: Producto;
  setEditingProducto: (producto: Producto) => void;
  cantidadAjuste: number;
  setCantidadAjuste: (cantidad: number) => void;
  showEditModal: boolean;
  setShowEditModal: (show: boolean) => void;
}

export const EditProduct = ({
  handleSaveEdit,
  editingProducto,
  setEditingProducto,
  cantidadAjuste,
  setCantidadAjuste,
  setShowEditModal,
}: EditProductProps) => {
  return (
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
                    onChange={(e) => setCantidadAjuste(Number(e.target.value))}
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
                      editingProducto.productoProveedors.find((pp) => pp.activo)
                        ?.precioCosto ||
                      editingProducto.productoProveedors[0]?.precioCosto ||
                      ""
                    }
                    onChange={(e) => {
                      const proveedorActivo =
                        editingProducto.productoProveedors.find(
                          (pp) => pp.activo
                        ) || editingProducto.productoProveedors[0];
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
                          ) || editingProducto.productoProveedors[0];
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
                          ) || editingProducto.productoProveedors[0];
                        if (proveedorActivo) {
                          const nuevoPorcentaje = 50;
                          const precioCosto = proveedorActivo.precioCosto;
                          const nuevoPrecioVenta = Number(
                            (precioCosto * (1 + nuevoPorcentaje / 100)).toFixed(
                              2
                            )
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
                        )?.porcentajeGanancia ||
                        editingProducto.productoProveedors[0]
                          ?.porcentajeGanancia ||
                        ""
                      }
                      onChange={(e) => {
                        const proveedorActivo =
                          editingProducto.productoProveedors.find(
                            (pp) => pp.activo
                          ) || editingProducto.productoProveedors[0];
                        if (proveedorActivo) {
                          const nuevoPorcentaje = Number(e.target.value);
                          const precioCosto = proveedorActivo.precioCosto;
                          const nuevoPrecioVenta = Number(
                            (precioCosto * (1 + nuevoPorcentaje / 100)).toFixed(
                              2
                            )
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
                      editingProducto.productoProveedors.find((pp) => pp.activo)
                        ?.precioVenta ||
                      editingProducto.productoProveedors[0]?.precioVenta ||
                      ""
                    }
                    onChange={(e) => {
                      const proveedorActivo =
                        editingProducto.productoProveedors.find(
                          (pp) => pp.activo
                        ) || editingProducto.productoProveedors[0];
                      if (proveedorActivo) {
                        const nuevoPrecioVenta = Number(e.target.value);
                        const precioCosto = proveedorActivo.precioCosto;
                        const nuevoPorcentaje = Number(
                          ((nuevoPrecioVenta / precioCosto - 1) * 100).toFixed(
                            2
                          )
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
                      editingProducto.productoProveedors.find((pp) => pp.activo)
                        ?.precioMayorista ||
                      editingProducto.productoProveedors[0]?.precioMayorista ||
                      ""
                    }
                    onChange={(e) => {
                      const proveedorActivo =
                        editingProducto.productoProveedors.find(
                          (pp) => pp.activo
                        ) || editingProducto.productoProveedors[0];
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
                  setEditingProducto({} as Producto);
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
  );
};
