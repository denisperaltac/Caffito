import React, { useEffect, useState } from "react";
import {
  Brand,
  Category,
  Producto,
  Proveedor,
  Tax,
} from "../../types/inventory";
import { inventoryService } from "../../services/inventoryService";
import { configurationService } from "../../services/configurationService";
import { PointOfSale } from "../../types/configuration";

interface AddEditProductProps {
  editingProduct: any;
  setEditingProduct: (product: any) => void;
  handleSaveProduct: (e: React.FormEvent) => void;
  setShowModal: (show: boolean) => void;
}

export const AddEditProduct = ({
  editingProduct,
  setEditingProduct,
  handleSaveProduct,
  setShowModal,
}: AddEditProductProps) => {
  const [showAdditionalFields, setShowAdditionalFields] = useState(false);
  const [showBrandDropdown, setShowBrandDropdown] = useState(false);
  const [filteredBrands, setFilteredBrands] = useState<Brand[]>([]);
  const [brandSearchTerm, setBrandSearchTerm] = useState("");
  const [pointsOfSale, setPointsOfSale] = useState<PointOfSale[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [taxes, setTaxes] = useState<Tax[]>([]);
  const [proveedors, setProveedors] = useState<Proveedor[]>([]);

  useEffect(() => {
    const filtered = brands.filter((brand) =>
      brand.name.toLowerCase().includes(brandSearchTerm.toLowerCase())
    );
    setFilteredBrands(filtered);
  }, [brands, brandSearchTerm]);

  // Cargar datos para los selectores
  useEffect(() => {
    const loadSelectorsData = async () => {
      try {
        const [
          pointsOfSaleData,
          categoriesData,
          brandsData,
          taxesData,
          proveedorsData,
        ] = await Promise.all([
          configurationService.getPointsOfSale(),
          inventoryService.getCategories(),
          inventoryService.getBrands(),
          inventoryService.getTaxes(),
          inventoryService.getProveedors(),
        ]);
        setPointsOfSale(pointsOfSaleData);
        setCategories(categoriesData);
        setBrands(brandsData);
        setTaxes(taxesData);
        setProveedors(proveedorsData);
      } catch (err) {
        console.error("Error al cargar datos de selectores:", err);
      }
    };
    loadSelectorsData();
  }, []);

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
      <div className="relative top-20 mx-auto p-5 border w-3/4 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            {!editingProduct.id ? "Nuevo Producto" : "Editar Producto"}
          </h3>
          <form onSubmit={handleSaveProduct}>
            <div className="grid grid-cols-2 gap-6">
              {/* Columna Izquierda - Información Básica */}
              <div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={editingProduct.nombre}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
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
                    value={editingProduct.codigoReferencia}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        codigoReferencia: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Marca
                  </label>
                  <div className="relative">
                    <div className="flex flex-col">
                      <input
                        type="text"
                        value={brandSearchTerm}
                        onChange={(e) => {
                          setBrandSearchTerm(e.target.value);
                          setShowBrandDropdown(true);
                        }}
                        onClick={() => setShowBrandDropdown(true)}
                        onBlur={() =>
                          setTimeout(() => setShowBrandDropdown(false), 200)
                        }
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Buscar marca..."
                      />
                      {showBrandDropdown && (
                        <div className="absolute top-full left-0 right-0 z-10 bg-white border border-t-0 rounded-b-lg shadow-lg max-h-60 overflow-y-auto">
                          {filteredBrands.length > 0 ? (
                            filteredBrands.map((brand) => (
                              <div
                                key={brand.id}
                                onClick={() => {
                                  setEditingProduct({
                                    ...editingProduct,
                                    marcaId: {
                                      id: Number(brand.id),
                                      nombre: brand.name,
                                    },
                                  });
                                  setBrandSearchTerm(brand.name);
                                  setShowBrandDropdown(false);
                                }}
                                className={`px-4 py-2 hover:bg-blue-50 cursor-pointer ${
                                  editingProduct.marcaId?.id ===
                                  Number(brand.id)
                                    ? "bg-blue-100"
                                    : ""
                                }`}
                              >
                                {brand.name}
                              </div>
                            ))
                          ) : (
                            <div className="px-4 py-2 text-gray-500">
                              No se encontraron marcas
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Categoría
                  </label>
                  <select
                    value={editingProduct.categoriaId.id}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        categoriaId: {
                          id: Number(e.target.value),
                          nombre:
                            categories.find(
                              (c) => c.id === Number(e.target.value)
                            )?.nombre || "",
                        },
                      })
                    }
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar categoría</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Proveedor
                  </label>
                  <select
                    value={
                      editingProduct.productoProveedors[0]?.proveedor?.id?.toString() ||
                      ""
                    }
                    onChange={(e) => {
                      const selectedProveedor = proveedors.find(
                        (p) => p.id === Number(e.target.value)
                      );
                      setEditingProduct({
                        ...editingProduct,
                        productoProveedors: [
                          {
                            ...editingProduct.productoProveedors[0],
                            proveedor: selectedProveedor
                              ? {
                                  id: selectedProveedor.id,
                                  nombreProveedor:
                                    selectedProveedor.nombreProveedor,
                                  direccion:
                                    selectedProveedor.calle +
                                    " " +
                                    selectedProveedor.numeroCalle,
                                  telefono: selectedProveedor.telefono,
                                  email: selectedProveedor.email,
                                  cuit: "",
                                  borrado: false,
                                }
                              : null,
                          },
                        ],
                      });
                    }}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccione un proveedor</option>
                    {proveedors.map((proveedor) => (
                      <option key={proveedor.id} value={proveedor.id}>
                        {proveedor.nombreProveedor}
                      </option>
                    ))}
                  </select>
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
                      editingProduct.productoProveedors[0]?.precioCosto || ""
                    }
                    onChange={(e) => {
                      const nuevoPrecioCosto = Number(e.target.value);
                      const porcentajeGanancia =
                        editingProduct.productoProveedors[0]
                          ?.porcentajeGanancia || 0;
                      const nuevoPrecioVenta = Number(
                        (
                          nuevoPrecioCosto *
                          (1 + porcentajeGanancia / 100)
                        ).toFixed(2)
                      );
                      // Calcular precio mayorista con un 20% menos de ganancia que el precio normal
                      const porcentajeGananciaMayorista = Math.max(
                        0,
                        porcentajeGanancia - 5
                      );
                      const nuevoPrecioMayorista = Number(
                        (
                          nuevoPrecioCosto *
                          (1 + porcentajeGananciaMayorista / 100)
                        ).toFixed(2)
                      );

                      setEditingProduct({
                        ...editingProduct,
                        productoProveedors: [
                          {
                            ...editingProduct.productoProveedors[0],
                            precioCosto: nuevoPrecioCosto,
                            precioVenta: nuevoPrecioVenta,
                            precioMayorista: nuevoPrecioMayorista,
                          },
                        ],
                      });
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
                        const nuevoPorcentaje = 45;
                        const precioCosto =
                          editingProduct.productoProveedors[0]?.precioCosto ||
                          0;
                        const nuevoPrecioVenta = Number(
                          (precioCosto * (1 + nuevoPorcentaje / 100)).toFixed(2)
                        );
                        // Calcular precio mayorista con un 20% menos de ganancia que el precio normal
                        const porcentajeGananciaMayorista = Math.max(
                          0,
                          nuevoPorcentaje - 5
                        );
                        const nuevoPrecioMayorista = Number(
                          (
                            precioCosto *
                            (1 + porcentajeGananciaMayorista / 100)
                          ).toFixed(2)
                        );

                        setEditingProduct({
                          ...editingProduct,
                          productoProveedors: [
                            {
                              ...editingProduct.productoProveedors[0],
                              porcentajeGanancia: nuevoPorcentaje,
                              precioVenta: nuevoPrecioVenta,
                              precioMayorista: nuevoPrecioMayorista,
                            },
                          ],
                        });
                      }}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm"
                    >
                      45%
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const nuevoPorcentaje = 50;
                        const precioCosto =
                          editingProduct.productoProveedors[0]?.precioCosto ||
                          0;
                        const nuevoPrecioVenta = Number(
                          (precioCosto * (1 + nuevoPorcentaje / 100)).toFixed(2)
                        );
                        // Calcular precio mayorista con un 20% menos de ganancia que el precio normal
                        const porcentajeGananciaMayorista = Math.max(
                          0,
                          nuevoPorcentaje - 5
                        );
                        const nuevoPrecioMayorista = Number(
                          (
                            precioCosto *
                            (1 + porcentajeGananciaMayorista / 100)
                          ).toFixed(2)
                        );

                        setEditingProduct({
                          ...editingProduct,
                          productoProveedors: [
                            {
                              ...editingProduct.productoProveedors[0],
                              porcentajeGanancia: nuevoPorcentaje,
                              precioVenta: nuevoPrecioVenta,
                              precioMayorista: nuevoPrecioMayorista,
                            },
                          ],
                        });
                      }}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm"
                    >
                      50%
                    </button>
                    <input
                      type="number"
                      step="0.01"
                      value={
                        editingProduct.productoProveedors[0]
                          ?.porcentajeGanancia || ""
                      }
                      onChange={(e) => {
                        const nuevoPorcentaje = Number(e.target.value);
                        const precioCosto =
                          editingProduct.productoProveedors[0]?.precioCosto ||
                          0;
                        const nuevoPrecioVenta = Number(
                          (precioCosto * (1 + nuevoPorcentaje / 100)).toFixed(2)
                        );
                        // Calcular precio mayorista con un 20% menos de ganancia que el precio normal
                        const porcentajeGananciaMayorista = Math.max(
                          0,
                          nuevoPorcentaje - 5
                        );
                        const nuevoPrecioMayorista = Number(
                          (
                            precioCosto *
                            (1 + porcentajeGananciaMayorista / 100)
                          ).toFixed(2)
                        );

                        setEditingProduct({
                          ...editingProduct,
                          productoProveedors: [
                            {
                              ...editingProduct.productoProveedors[0],
                              porcentajeGanancia: nuevoPorcentaje,
                              precioVenta: nuevoPrecioVenta,
                              precioMayorista: nuevoPrecioMayorista,
                            },
                          ],
                        });
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
                      editingProduct.productoProveedors[0]?.precioVenta || ""
                    }
                    onChange={(e) => {
                      const nuevoPrecioVenta = Number(e.target.value);
                      const precioCosto =
                        editingProduct.productoProveedors[0]?.precioCosto || 0;
                      const nuevoPorcentaje = Number(
                        ((nuevoPrecioVenta / precioCosto - 1) * 100).toFixed(2)
                      );
                      // Calcular precio mayorista con un 20% menos de ganancia que el precio normal
                      const porcentajeGananciaMayorista = Math.max(
                        0,
                        nuevoPorcentaje - 5
                      );
                      const nuevoPrecioMayorista = Number(
                        (
                          precioCosto *
                          (1 + porcentajeGananciaMayorista / 100)
                        ).toFixed(2)
                      );

                      setEditingProduct({
                        ...editingProduct,
                        productoProveedors: [
                          {
                            ...editingProduct.productoProveedors[0],
                            precioVenta: nuevoPrecioVenta,
                            porcentajeGanancia: nuevoPorcentaje,
                            precioMayorista: nuevoPrecioMayorista,
                          },
                        ],
                      });
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
                      editingProduct.productoProveedors[0]?.precioMayorista ||
                      ""
                    }
                    onChange={(e) => {
                      const nuevoPrecioMayorista = Number(e.target.value);
                      setEditingProduct({
                        ...editingProduct,
                        productoProveedors: [
                          {
                            ...editingProduct.productoProveedors[0],
                            precioMayorista: nuevoPrecioMayorista,
                          },
                        ],
                      });
                    }}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Botón para mostrar campos adicionales */}
            <div className="mt-4 mb-6">
              <button
                type="button"
                onClick={() => setShowAdditionalFields(!showAdditionalFields)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
              >
                {showAdditionalFields
                  ? "Ocultar campos adicionales"
                  : "Mostrar campos adicionales"}
              </button>
            </div>

            {/* Campos adicionales */}
            {showAdditionalFields && (
              <div className="grid grid-cols-2 gap-6 mt-4">
                <div>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Descripción
                    </label>
                    <input
                      type="text"
                      value={editingProduct.descripcion || ""}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          descripcion: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Impuesto
                    </label>
                    <select
                      value={editingProduct.impuestoId?.toString() || ""}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          impuestoId: e.target.value
                            ? Number(e.target.value)
                            : null,
                        })
                      }
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Seleccione un impuesto</option>
                      {taxes.map((tax) => (
                        <option key={tax.id} value={tax.id}>
                          {tax.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Punto de Venta
                    </label>
                    <select
                      value={
                        editingProduct.productoProveedors[0]?.puntoDeVentaId ||
                        ""
                      }
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          productoProveedors: [
                            {
                              ...editingProduct.productoProveedors[0],
                              puntoDeVentaId: Number(e.target.value),
                              puntoDeVentaNombre:
                                pointsOfSale.find(
                                  (p) => p.id === e.target.value
                                )?.nombre || "",
                            },
                          ],
                        })
                      }
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Seleccionar punto de venta</option>
                      {pointsOfSale.map((pos) => (
                        <option key={pos.id} value={pos.id}>
                          {pos.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={editingProduct.pesable || false}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            pesable: e.target.checked,
                          })
                        }
                        className="form-checkbox h-5 w-5 text-blue-600"
                      />
                      <span className="text-gray-700 text-sm font-bold">
                        Producto Pesable
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  setEditingProduct({} as Producto);
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
