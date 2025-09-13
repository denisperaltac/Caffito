import React, { useState, useEffect } from "react";
import { Producto } from "../../types/inventory";
import { inventoryService } from "../../services/inventoryService";
import { Pagination } from "../../components/common/Pagination";
import { FaFilePdf } from "react-icons/fa";
import { toast } from "react-hot-toast";
import Loader from "../../components/common/Loader";

interface EtiquetaProducto {
  id: number;
  codigoReferencia: string;
  nombre: string;
  categoria: string;
  marca: string;
  precioVenta: number;
  cantidad: number;
}

const LabelsPage: React.FC = () => {
  const [products, setProducts] = useState<Producto[]>([]);
  const [etiquetas, setEtiquetas] = useState<EtiquetaProducto[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(9);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [generatingPDF, setGeneratingPDF] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchProductsCount();
  }, [currentPage, fechaInicio, fechaFin]);

  // Resetear página cuando cambien los filtros
  useEffect(() => {
    if (currentPage !== 0) {
      setCurrentPage(0);
    }
  }, [fechaInicio, fechaFin]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await inventoryService.getProductsWithPriceChange(
        currentPage,
        pageSize,
        fechaInicio || undefined,
        fechaFin || undefined
      );
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProductsCount = async () => {
    try {
      const count = await inventoryService.getProductsCount(
        fechaInicio || undefined,
        fechaFin || undefined
      );
      setTotalItems(count);
      setTotalPages(Math.ceil(count / pageSize));
    } catch (error) {
      console.error("Error fetching products count:", error);
    }
  };

  const agregarProducto = (producto: Producto) => {
    // Verificar si el producto ya está en las etiquetas
    const etiquetaExistente = etiquetas.find((et) => et.id === producto.id);

    if (etiquetaExistente) {
      // Si ya existe, incrementar la cantidad
      setEtiquetas(
        etiquetas.map((et) =>
          et.id === producto.id ? { ...et, cantidad: et.cantidad + 1 } : et
        )
      );
    } else {
      // Si no existe, agregarlo con cantidad 1
      const etiquetaProducto: EtiquetaProducto = {
        id: producto.id,
        codigoReferencia: producto.codigoReferencia,
        nombre: producto.nombre,
        categoria: producto.categoriaId?.nombre || "",
        marca: producto.marcaId?.nombre || "",
        precioVenta: producto.productoProveedors?.[0]?.precioVenta || 0,
        cantidad: 1,
      };

      setEtiquetas([...etiquetas, etiquetaProducto]);
    }
  };

  const incrementarCantidad = (id: number) => {
    setEtiquetas(
      etiquetas.map((et) =>
        et.id === id ? { ...et, cantidad: et.cantidad + 1 } : et
      )
    );
  };

  const decrementarCantidad = (id: number) => {
    setEtiquetas(
      etiquetas.map((et) =>
        et.id === id && et.cantidad > 1
          ? { ...et, cantidad: et.cantidad - 1 }
          : et
      )
    );
  };

  const quitarProducto = (id: number) => {
    setEtiquetas(etiquetas.filter((et) => et.id !== id));
  };

  const quitarTodos = () => {
    if (window.confirm("¿Está seguro que desea quitar todas las etiquetas?")) {
      setEtiquetas([]);
      toast.success("Todas las etiquetas han sido removidas");
    }
  };

  const formatFechaCambioPrecioCompacta = (fechaCambioPrecio: string) => {
    if (!fechaCambioPrecio) return "-";

    try {
      const fecha = new Date(fechaCambioPrecio);
      const hoy = new Date();
      const ayer = new Date(hoy);
      ayer.setDate(hoy.getDate() - 1);

      // Si es hoy, mostrar solo la hora
      if (fecha.toDateString() === hoy.toDateString()) {
        return fecha.toLocaleTimeString("es-AR", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        });
      }

      // Si es ayer, mostrar "Ayer HH:MM"
      if (fecha.toDateString() === ayer.toDateString()) {
        return `Ayer ${fecha.toLocaleTimeString("es-AR", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })}`;
      }

      // Para otras fechas, mostrar DD/MM/YYYY HH:MM
      return fecha.toLocaleString("es-AR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    } catch (error) {
      return "-";
    }
  };

  const generarEtiquetas = async () => {
    if (etiquetas.length === 0) {
      toast.error("No hay productos seleccionados para generar etiquetas");
      return;
    }

    setGeneratingPDF(true);

    // Mostrar toast con loader
    const toastId = toast.loading(
      `Generando PDF desde frontend con ${etiquetas.reduce(
        (sum, et) => sum + et.cantidad,
        0
      )} etiquetas...`,
      {
        duration: Infinity,
      }
    );

    try {
      // Convertir etiquetas al formato que espera la función frontend
      const etiquetasFormato: Array<{
        nombre: string;
        precio: number;
        codigo: string;
        marca: string;
      }> = [];

      etiquetas.forEach((etiqueta) => {
        for (let i = 0; i < etiqueta.cantidad; i++) {
          etiquetasFormato.push({
            nombre: etiqueta.nombre,
            precio: etiqueta.precioVenta,
            codigo: etiqueta.codigoReferencia,
            marca: etiqueta.marca,
          });
        }
      });

      await inventoryService.generateEtiquetas(etiquetasFormato);

      // Cerrar el toast de loading y mostrar éxito
      toast.dismiss(toastId);
      toast.success(`Etiquetas generadas exitosamente`);
    } catch (error) {
      console.error("Error generando etiquetas:", error);
      // Cerrar el toast de loading primero
      toast.dismiss(toastId);
      toast.error(
        "Error al generar las etiquetas. Por favor, intente nuevamente."
      );
    } finally {
      setGeneratingPDF(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader size="xl" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-2">
      {/* Layout en Columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Columna Izquierda - Productos */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Productos Disponibles
          </h2>

          {/* Filtros de Fecha */}
          <div className="bg-white shadow-md rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha Inicio
                </label>
                <input
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha Fin
                </label>
                <input
                  type="date"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Código
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Precio
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cambio de Precio
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acción
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => {
                  const etiquetaExistente = etiquetas.find(
                    (et) => et.id === product.id
                  );
                  const isSelected = !!etiquetaExistente;

                  return (
                    <tr
                      key={product.id}
                      className={`hover:bg-gray-50 transition-opacity ${
                        isSelected ? "opacity-50" : ""
                      }`}
                    >
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-mono">
                        {product.codigoReferencia}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        <div>
                          <div className="font-medium">{product.nombre}</div>
                          <div className="text-xs text-gray-500">
                            {product.categoriaId?.nombre || "-"} /{" "}
                            {product.marcaId?.nombre || "-"}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        $
                        {product.productoProveedors?.[0]?.precioVenta?.toFixed(
                          2
                        ) || "-"}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex flex-col">
                          <span className="text-xs font-medium">
                            {formatFechaCambioPrecioCompacta(
                              product.cambioPrecio || ""
                            )}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        {isSelected ? (
                          <div className="flex items-center justify-center space-x-1">
                            <button
                              className="bg-red-500 hover:bg-red-600 cursor-not-allowed text-white px-2 py-1 rounded text-xs font-medium transition-colors"
                              title="Incrementar cantidad"
                            >
                              +
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => agregarProducto(product)}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs font-medium transition-colors"
                            title="Agregar a etiquetas"
                          >
                            +
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Paginación usando el componente Pagination */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              setCurrentPage={setCurrentPage}
              totalItems={totalItems}
            />
          )}
        </div>

        {/* Columna Derecha - Etiquetas */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Etiquetas a Generar
          </h2>

          <div className="bg-white shadow-md rounded-lg overflow-hidden max-h-[60vh] overflow-y-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Código
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Producto
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Precio
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cantidad
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {etiquetas.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-8 text-center text-gray-500"
                    >
                      No hay productos seleccionados
                    </td>
                  </tr>
                ) : (
                  etiquetas.map((etiqueta) => (
                    <tr key={etiqueta.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-mono">
                        {etiqueta.codigoReferencia}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        <div>
                          <div className="font-medium">{etiqueta.nombre}</div>
                          <div className="text-xs text-gray-500">
                            {etiqueta.categoria} / {etiqueta.marca}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        ${etiqueta.precioVenta.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => decrementarCantidad(etiqueta.id)}
                            disabled={etiqueta.cantidad <= 1}
                            className={`p-1 rounded ${
                              etiqueta.cantidad <= 1
                                ? "text-gray-300 cursor-not-allowed"
                                : "text-red-500 hover:text-red-700"
                            }`}
                            title="Decrementar cantidad"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M20 12H4"
                              />
                            </svg>
                          </button>
                          <span className="text-sm font-medium text-gray-900 min-w-[2rem] text-center">
                            {etiqueta.cantidad}
                          </span>
                          <button
                            onClick={() => incrementarCantidad(etiqueta.id)}
                            className="p-1 rounded text-green-500 hover:text-green-700"
                            title="Incrementar cantidad"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 4v16m8-8H4"
                              />
                            </svg>
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        <button
                          onClick={() => quitarProducto(etiqueta.id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs font-medium transition-colors"
                          title="Quitar producto"
                        >
                          ×
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Acciones de Etiquetas */}
          <div className="flex flex-col space-y-3">
            <div className="flex flex-row justify-between">
              <div className="flex flex-col">
                <div className="text-sm text-gray-600">
                  Total de etiquetas:{" "}
                  {etiquetas.reduce((sum, et) => sum + et.cantidad, 0)}
                </div>
                <button
                  onClick={quitarTodos}
                  disabled={etiquetas.length === 0}
                  className="bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white px-4 py-2 rounded font-medium transition-colors disabled:cursor-not-allowed"
                >
                  Quitar Todos
                </button>
              </div>

              <div>
                <div className="text-sm text-gray-600 font-medium flex flex-col space-x-3">
                  Generar Etiquetas:
                </div>
                <div className="space-y-2">
                  <button
                    onClick={() => generarEtiquetas()}
                    disabled={etiquetas.length === 0 || generatingPDF}
                    className="bg-green-600 flex flex-row items-center justify-center gap-2 w-full hover:bg-green-700 disabled:bg-gray-300 text-white px-3 py-2 rounded text-sm font-medium transition-colors disabled:cursor-not-allowed"
                    title={generatingPDF ? "Generando PDF..." : "Generar a PDF"}
                  >
                    {generatingPDF ? (
                      <>
                        <Loader size="sm" />
                        Generando...
                      </>
                    ) : (
                      <>
                        <FaFilePdf />
                        PDF (
                        {etiquetas.reduce((sum, et) => sum + et.cantidad, 0)})
                      </>
                    )}
                  </button>

                  {/* <button
                    onClick={() => generarEtiquetas("PDF")}
                    disabled={etiquetas.length === 0 || generatingPDF}
                    className="bg-blue-600 flex flex-row items-center justify-center gap-2 w-full hover:bg-blue-700 disabled:bg-gray-300 text-white px-3 py-2 rounded text-sm font-medium transition-colors disabled:cursor-not-allowed"
                    title={
                      generatingPDF
                        ? "Generando PDF..."
                        : "Exportar a PDF (Backend)"
                    }
                  >
                    {generatingPDF ? (
                      <>
                        <Loader size="sm" />
                        Generando...
                      </>
                    ) : (
                      <>
                        <FaFilePdf />
                        PDF Backend (
                        {etiquetas.reduce((sum, et) => sum + et.cantidad, 0)})
                      </>
                    )}
                  </button> */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LabelsPage;
