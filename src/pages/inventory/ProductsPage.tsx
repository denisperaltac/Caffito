import React, { useState, useEffect } from "react";
import { productService } from "../../services/productService";
import { Producto, ProductoOptional } from "../../types/inventory";
import Loader from "../../components/common/Loader";
import { AddEditProduct } from "../../components/products/AddEditProduct";
import { Pagination } from "../../components/common/Pagination";
import { TableProductos } from "../../components/products/TableProductos";
import { Button } from "../../components/common/Button";

const ITEMS_PER_PAGE = 10;

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchCode, setSearchCode] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [debouncedSearchCode, setDebouncedSearchCode] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductoOptional | null>(
    null
  );

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
    loadProducts();
  }, [currentPage, debouncedSearchTerm, debouncedSearchCode]);

  const loadProducts = async () => {
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

      // Convertir los productos al tipo correcto
      const convertedProducts: Producto[] = response.map((producto) => ({
        ...producto,
        descripcion: producto.descripcion || "",
      }));

      setProducts(convertedProducts);
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

  const handleEdit = (product: Producto) => {
    setEditingProduct(product);
    setShowModal(true);
  };

  const handleNewProduct = () => {
    const newProduct: ProductoOptional = {
      nombre: "",
      descripcion: "",
      codigoReferencia: "",
      cantidad: 0,
      stockMin: null,
      stockMax: null,
      categoriaId: {
        id: 0,
        nombre: "",
      },
      marcaId: {
        id: 0,
        nombre: "",
      },
      productoProveedors: [
        {
          puntoDeVentaId: 1,
          puntoDeVentaNombre: "CASA CENTRAL",
          activo: true,
        },
      ],
      impuestoId: null,
      pesable: false,
    };
    setEditingProduct(newProduct);
    setShowModal(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    try {
      if (!editingProduct.id) {
        // Crear nuevo producto
        await productService.createProduct(editingProduct);
      } else {
        // Actualizar producto existente
        await productService.updateProducto(
          editingProduct.id || 0,
          editingProduct,
          editingProduct.cantidad || 0
        );
      }
      loadProducts();
      setShowModal(false);
      setEditingProduct(null);
    } catch (err) {
      setError("Error al guardar el producto");
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este producto?")) {
      try {
        await productService.deleteProduct(id);
        loadProducts();
      } catch (err) {
        setError("Error al eliminar el producto");
        console.error("Error deleting product:", err);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 pt-5 sm:px-6 flex justify-between items-center">
        <h3 className="text-2xl leading-6 font-medium text-gray-900">
          Productos
        </h3>
        <Button
          color="purple"
          disabled={false}
          text="Nuevo Producto"
          onClick={handleNewProduct}
        />
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Buscar por nombre
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nombre del producto..."
              />
            </div>
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Código de Referencia
            </label>
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
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Tabla de Productos */}
      <TableProductos
        products={products}
        isSearching={isSearching}
        handleEdit={handleEdit}
        handleDelete={handleDelete}
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        setCurrentPage={setCurrentPage}
        items={products}
        totalItems={totalCount}
      />

      {/* Modal de Creación/Edición */}
      {showModal && editingProduct && (
        <AddEditProduct
          editingProduct={editingProduct}
          setEditingProduct={setEditingProduct}
          handleSaveProduct={handleSaveProduct}
          setShowModal={setShowModal}
        />
      )}
    </div>
  );
};

export default ProductsPage;
