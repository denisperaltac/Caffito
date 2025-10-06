import React, { useState, useEffect } from "react";
import { productService } from "../../services/productService";
import Loader from "../../components/common/Loader";
import { Producto } from "../../types/inventory";
import { Pagination } from "../../components/common/Pagination";
import { EditProduct } from "../../components/stockManagement/EditProduct";
import { TableProductsManagement } from "../../components/stockManagement/TableProductsManagement";
import toast from "react-hot-toast";

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
      console.log("currentPage", currentPage);
      if (currentPage === 0) {
        setDebouncedSearchTerm(searchTerm);
        setDebouncedSearchCode(searchCode);
      } else {
        setCurrentPage(0);
      }
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
    const proveedorActivo =
      producto.productoProveedors.find((pp) => pp.activo) ||
      producto.productoProveedors[0];
    console.log("proveedorActivo", proveedorActivo);

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
      nombre: producto.nombre?.trimEnd() || "", // Quitar espacios en blanco al final del nombre
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

  const handleDelete = async (id: number, productName?: string) => {
    try {
      await productService.deleteProduct(id);
      // Recargar la página actual después de eliminar
      loadProductos();
      toast.success(
        `Producto "${productName || "eliminado"}" eliminado correctamente`,
        { duration: 5000 }
      );
    } catch (err) {
      toast.error("Error al eliminar el producto", { duration: 5000 });
      console.error(err);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProducto) return;
    console.log("editingProducto", editingProducto);

    // Capturar precio original de la lista de productos cargados
    const productoOriginal = productos.find((p) => p.id === editingProducto.id);
    const proveedorOriginal =
      productoOriginal?.productoProveedors.find((pp) => pp.activo) ||
      productoOriginal?.productoProveedors[0];
    const precioAnterior = proveedorOriginal?.precioVenta || 0;

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

      // Capturar precio nuevo para el toast
      const precioNuevo =
        productoConPorcentaje.productoProveedors.find((pp) => pp.activo)
          ?.precioVenta ||
        productoConPorcentaje.productoProveedors[0]?.precioVenta ||
        0;

      toast.success(
        `Producto "${editingProducto.nombre}" actualizado correctamente\nPrecio: $${precioAnterior} => $${precioNuevo}`,
        { duration: 5000 }
      );

      loadProductos();

      setShowEditModal(false);
      setEditingProducto(null);
      setCantidadAjuste(0);
    } catch (err) {
      toast.error("Error al actualizar el producto", { duration: 5000 });
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg p-4">
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-2xl font-bold text-gray-800">Gestión de Stock</h1>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Filtros */}
      <div className="mb-2">
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
      <div className="bg-white rounded-lg overflow-auto min-h-[65vh]">
        <div className="overflow-x-auto min-h-[65vh] max-h-[65vh]">
          {isSearching ? (
            <div className="flex justify-center items-center min-h-[65vh]">
              <Loader size="lg" />
            </div>
          ) : (
            <TableProductsManagement
              productos={productos}
              handleEdit={handleEdit}
              handleDelete={handleDelete}
            />
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
        />
      )}

      {/* Modal de Edición */}
      {showEditModal && editingProducto && (
        <EditProduct
          editingProducto={editingProducto}
          setEditingProducto={setEditingProducto}
          cantidadAjuste={cantidadAjuste}
          setCantidadAjuste={setCantidadAjuste}
          showEditModal={showEditModal}
          setShowEditModal={setShowEditModal}
          handleSaveEdit={handleSaveEdit}
        />
      )}
    </div>
  );
};

export default StockManagementPage;
