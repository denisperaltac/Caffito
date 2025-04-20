import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import { productService } from "../../services/productService";
import { configurationService } from "../../services/configurationService";
import { inventoryService } from "../../services/inventoryService";
import {
  Producto,
  Category,
  Brand,
  Tax,
  Proveedor,
  ProductoOptional,
} from "../../types/inventory";
import { PointOfSale } from "../../types/configuration";
import Loader from "../../components/common/Loader";
import Pagination from "../../components/common/Pagination";

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
  const [cantidadAjuste, setCantidadAjuste] = useState<number>(0);
  const [showAdditionalFields, setShowAdditionalFields] = useState(false);

  // Estados para los selectores
  const [pointsOfSale, setPointsOfSale] = useState<PointOfSale[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [filteredBrands, setFilteredBrands] = useState<Brand[]>([]);
  const [brandSearchTerm, setBrandSearchTerm] = useState("");
  const [showBrandDropdown, setShowBrandDropdown] = useState(false);
  const [taxes, setTaxes] = useState<Tax[]>([]);
  const [proveedors, setProveedors] = useState<Proveedor[]>([]);

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

  // Debounce para la búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setDebouncedSearchCode(searchCode);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, searchCode]);

  // Add this useEffect after the existing useEffect for loading brands
  useEffect(() => {
    const filtered = brands.filter((brand) =>
      brand.name.toLowerCase().includes(brandSearchTerm.toLowerCase())
    );
    setFilteredBrands(filtered);
  }, [brands, brandSearchTerm]);

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

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleEdit = (product: Producto) => {
    setEditingProduct(product);
    setShowModal(true);
    setCantidadAjuste(0);
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
    setCantidadAjuste(0);
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
      setCantidadAjuste(0);
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
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Productos
        </h3>
        <button
          onClick={handleNewProduct}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <FaPlus className="mr-2" />
          Nuevo Producto
        </button>
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
      <div className="bg-white shadow-md rounded-lg overflow-auto h-[55vh]">
        <div className="overflow-x-auto">
          {isSearching ? (
            <div className="flex justify-center items-center h-64">
              <Loader size="lg" />
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Código Referencia
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Categoría
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Marca
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Cantidad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ($) Costo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ($) Venta
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    ($) May.
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => {
                  const proveedorActivo = product.productoProveedors?.find(
                    (pp) => pp.activo
                  );
                  return (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 hidden md:table-cell">
                        {product.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.codigoReferencia?.trim()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {product.nombre?.trim()}
                        </div>
                        <div className="text-sm text-gray-500">
                          {product.descripcion?.trim()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 hidden md:table-cell">
                        {product.categoriaId?.nombre?.trim()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 hidden md:table-cell">
                        {product.marcaId?.nombre}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 hidden md:table-cell">
                        {product.cantidad}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {proveedorActivo?.precioCosto?.toLocaleString("es-AR", {
                          style: "currency",
                          currency: "ARS",
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {proveedorActivo?.precioVenta?.toLocaleString("es-AR", {
                          style: "currency",
                          currency: "ARS",
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 hidden md:table-cell">
                        {proveedorActivo?.precioMayorista?.toLocaleString(
                          "es-AR",
                          {
                            style: "currency",
                            currency: "ARS",
                          }
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          className="text-blue-600 hover:text-blue-900 mr-3"
                          onClick={() => handleEdit(product)}
                        >
                          <FaEdit className="w-5 h-5" />
                        </button>
                        <button
                          className="text-red-600 hover:text-red-900"
                          onClick={() => handleDelete(product.id)}
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

      <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
        <div className="flex-1 flex justify-between sm:hidden">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 0}
            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Anterior
          </button>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages - 1}
            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Siguiente
          </button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Mostrando <span className="font-medium">{products.length}</span>{" "}
              de <span className="font-medium">{totalCount}</span> resultados
            </p>
          </div>
          <div>
            <nav
              className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
              aria-label="Pagination"
            >
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
        </div>
      </div>

      {/* Modal de Creación/Edición */}
      {showModal && editingProduct && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-3/4 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                {editingProduct.id === 0 ? "Nuevo Producto" : "Editar Producto"}
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
                          editingProduct.productoProveedors[0]?.precioCosto ||
                          ""
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
                              editingProduct.productoProveedors[0]
                                ?.precioCosto || 0;
                            const nuevoPrecioVenta = Number(
                              (
                                precioCosto *
                                (1 + nuevoPorcentaje / 100)
                              ).toFixed(2)
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
                              editingProduct.productoProveedors[0]
                                ?.precioCosto || 0;
                            const nuevoPrecioVenta = Number(
                              (
                                precioCosto *
                                (1 + nuevoPorcentaje / 100)
                              ).toFixed(2)
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
                              editingProduct.productoProveedors[0]
                                ?.precioCosto || 0;
                            const nuevoPrecioVenta = Number(
                              (
                                precioCosto *
                                (1 + nuevoPorcentaje / 100)
                              ).toFixed(2)
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
                          editingProduct.productoProveedors[0]?.precioVenta ||
                          ""
                        }
                        onChange={(e) => {
                          const nuevoPrecioVenta = Number(e.target.value);
                          const precioCosto =
                            editingProduct.productoProveedors[0]?.precioCosto ||
                            0;
                          const nuevoPorcentaje = Number(
                            (
                              (nuevoPrecioVenta / precioCosto - 1) *
                              100
                            ).toFixed(2)
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
                          editingProduct.productoProveedors[0]
                            ?.precioMayorista || ""
                        }
                        onChange={(e) => {
                          const nuevoPrecioMayorista = Number(e.target.value);
                          const precioCosto =
                            editingProduct.productoProveedors[0]?.precioCosto ||
                            0;
                          const nuevoPorcentajeMayorista = Number(
                            (
                              (nuevoPrecioMayorista / precioCosto - 1) *
                              100
                            ).toFixed(2)
                          );

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
                    onClick={() =>
                      setShowAdditionalFields(!showAdditionalFields)
                    }
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
                            editingProduct.productoProveedors[0]
                              ?.puntoDeVentaId || ""
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
                      setEditingProduct(null);
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

export default ProductsPage;
