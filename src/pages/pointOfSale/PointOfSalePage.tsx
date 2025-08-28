import React, { useState, useEffect, useRef } from "react";
import { API_URL } from "../../constants/api";
import { pointOfSaleService } from "../../services/pointOfSaleService";
import { formatCurrency } from "../../utils/formatters";
import {
  Cliente,
  Promocion,
  Factura,
  FacturaRenglon,
} from "../../types/configuration";
import { LuImageOff } from "react-icons/lu";
import { FaTrash, FaMinus, FaPlus, FaSearch } from "react-icons/fa";
import { createRoot } from "react-dom/client";
import Loader from "../../components/common/Loader";
import PaymentModal from "../../components/pointOfSale/PaymentModal";
import CancelModal from "../../components/pointOfSale/CancelModal";
import CustomProductModal from "../../components/pointOfSale/CustomProductModal";
import axiosInstance from "../../config/axiosConfig";
import { toast } from "react-hot-toast";
import { initializeQz } from "../../services/printService";

interface Producto {
  id: number;
  codigoReferencia: string;
  nombre: string;
  cantidad: number;
  stockMax: number;
  stockMin: number;
  descripcion: string;
  borrado: boolean;
  categoriaId: {
    id: number;
    nombre: string;
    rubroId: number | null;
  };
  marcaId: {
    id: number;
    nombre: string;
  };
  impuestoId: number | null;
  productoProveedors: {
    id: number;
    precioCosto: number;
    precioVenta: number;
    precioMayorista: number;
    cantidad: number;
    activo: boolean;
    pesounidad: number | null;
    pesototal: number | null;
    stockMin: number | null;
    stockMax: number | null;
    productoId: number;
    puntoDeVentaId: number;
    puntoDeVentaNombre: string;
  }[];
  peso: number;
  pesable: boolean | null;
  cambioPrecio: boolean | null;
}

interface Pago {
  monto: number;
  tipoPagoNombre: string;
  tipoPagoId: number;
}

const initialFactura: Factura = {
  id: "",
  facturaRenglons: [],
  total: 0,
  subtotal: 0,
  descuento: 0,
  interes: 0,
  pagos: [],
  comprobanteId: {
    tipoComprobanteId: 1,
    tipoDocumentoId: 1,
    nroDocumento: "0",
  },
  clienteId: 1,
};

const PointOfSalePage: React.FC = () => {
  // Refs
  const searchInputRef = useRef<HTMLInputElement>(null);
  const renglonesTableRef = useRef<HTMLDivElement>(null);

  // State
  const [productos, setProductos] = useState<Producto[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [promociones, setPromociones] = useState<Promocion[]>([]);
  const [productSearchTerm, setProductSearchTerm] = useState("");
  const [isProductSearching, setIsProductSearching] = useState(false);
  const [isClientSearching, setIsClientSearching] = useState(false);
  const [searchByCode, setSearchByCode] = useState(true);
  const [viewMode, setViewMode] = useState<"cards" | "list">("list");
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [filteredClientes, setFilteredClientes] = useState<Cliente[]>([]);
  const [clientSearchTerm, setClientSearchTerm] = useState("");
  const [factura, setFactura] = useState<Factura>(initialFactura);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showPromotionModal, setShowPromotionModal] = useState(false);
  const [showCustomProductModal, setShowCustomProductModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const productSearchTimeout = useRef<NodeJS.Timeout>();
  const clientSearchTimeout = useRef<NodeJS.Timeout>();
  const [customProductName, setCustomProductName] = useState("");
  const [customProductPrice, setCustomProductPrice] = useState("");
  const [tiposPago, setTiposPago] = useState<any[]>([]);
  const [tipoComprobantes, setTipoComprobantes] = useState<any[]>([]);
  const [tipoDocumentos, setTipoDocumentos] = useState<any[]>([]);
  const [tipoPagoSeleccionado, setTipoPagoSeleccionado] = useState("");
  const [tipoComprobanteId, setTipoComprobanteId] = useState<number>(1);
  const [tipoDocumentoId, setTipoDocumentoId] = useState<number>(1);
  const [nroDocumento, setNroDocumento] = useState("0");
  const [montoPago, setMontoPago] = useState("");
  const [totalPagado, setTotalPagado] = useState(0);
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [facturaGuardada, setFacturaGuardada] = useState<Factura | null>(null);

  // Efecto para establecer consumidor final cuando se cargan los clientes
  useEffect(() => {
    if (clientes.length > 0) {
      const consumidorFinal = clientes.find(
        (cliente) => cliente.nombre === "CONSUMIDOR FINAL"
      );
      if (consumidorFinal) {
        setFactura((prevFactura) => ({
          ...prevFactura,
          clienteId: consumidorFinal.id,
        }));
        setClientSearchTerm(
          `${(consumidorFinal.nombre || "").trim()} ${(
            consumidorFinal.apellido || ""
          ).trim()}`
        );
      }
    }
  }, [clientes]);

  // Load initial data
  useEffect(() => {
    loadInitialData();
    initializeQz();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [
        clientesData,
        promocionesData,
        tiposPagoData,
        tipoComprobantesData,
        tipoDocumentosData,
      ] = await Promise.all([
        pointOfSaleService.getClientes(),
        pointOfSaleService.getPromociones(),
        pointOfSaleService.getTiposPago(),
        pointOfSaleService.getTipoComprobantes(),
        pointOfSaleService.getTipoDocumentos(),
      ]);

      setClientes(clientesData);
      setPromociones(promocionesData);
      setTiposPago(tiposPagoData);
      setTipoComprobantes(tipoComprobantesData);
      setTipoDocumentos(tipoDocumentosData);
      setError(null);
    } catch (err) {
      setError("Error al cargar los datos iniciales");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const buscarProductos = async (termino: string) => {
    try {
      setIsProductSearching(true);
      setError(null);
      const response = await axiosInstance.get<Producto[]>(
        `${API_URL}/productos?page=0&size=9&${
          searchByCode ? "codigoReferencia.contains" : "nombre.contains"
        }=${termino}&productoProveedorPuntoVentaId.equals=1&sort=nombre,asc`
      );
      setProductos(response.data);
    } catch (err) {
      setError("Error al buscar productos");
      console.error(err);
    } finally {
      setIsProductSearching(false);
    }
  };

  const handleProductSearchChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setProductSearchTerm(value);
    setIsProductSearching(true);

    if (productSearchTimeout.current) {
      clearTimeout(productSearchTimeout.current);
    }

    productSearchTimeout.current = setTimeout(() => {
      if (value.trim()) {
        buscarProductos(value.trim());
      } else {
        setProductos([]);
        setIsProductSearching(false);
      }
    }, 300);
  };

  // Nueva función para manejar Enter (como filterCodigo en Angular)
  const handleProductSearchEnter = async () => {
    if (!productSearchTerm.trim()) return;

    try {
      setIsProductSearching(true);
      setError(null);

      const codigo = productSearchTerm.trim();

      // Verificar si es un código pesable (formato: [letra][5 dígitos][6 dígitos precio])
      // Ejemplo: 2000800012874 -> 00080 (subcódigo) + 0012874 (precio)
      if (codigo.length >= 12) {
        // Extraer el subcódigo (5 dígitos del medio)
        const subcodigo = codigo.substring(1, 6);
        console.log("Subcódigo extraído:", subcodigo);

        // Extraer el precio (6 dígitos del final)
        const precio = codigo.substring(6, 12);
        console.log("Precio extraído:", precio, "pesos");

        // Buscar producto por subcódigo
        const response = await axiosInstance.get<Producto>(
          `${API_URL}/productos/codigo/${subcodigo}`
        );

        if (response.data) {
          const producto = response.data;

          if (producto.pesable) {
            // Es un producto pesable, agregarlo con peso calculado
            agregarRenglonPesable(producto, Number(precio));
            setProductSearchTerm("");
            setProductos([]);
            return;
          } else {
            // No es pesable, agregarlo normal
            agregarRenglon(producto);
            setProductSearchTerm("");
            setProductos([]);
            return;
          }
        }
      }

      // Si no es pesable o no se encontró, buscar por código exacto
      const response = await axiosInstance.get<Producto>(
        `${API_URL}/productos/codigo/${codigo}`
      );

      if (response.data) {
        // Producto encontrado, agregarlo inmediatamente
        agregarRenglon(response.data);
        setProductSearchTerm("");
        setProductos([]);
      } else {
        // Si no se encontró, hacer búsqueda normal
        buscarProductos(codigo);
      }
    } catch (err) {
      console.log("Error en búsqueda exacta, haciendo búsqueda normal:", err);
      // Si hay error, hacer búsqueda normal
      buscarProductos(productSearchTerm.trim());
    } finally {
      setIsProductSearching(false);
    }
  };

  const handleProductSearchKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleProductSearchEnter();
    }
  };

  const handleClientSearch = (value: string) => {
    setClientSearchTerm(value);
    setShowClientDropdown(true);
    setIsClientSearching(true);

    if (clientSearchTimeout.current) {
      clearTimeout(clientSearchTimeout.current);
    }

    clientSearchTimeout.current = setTimeout(() => {
      const filtered = clientes.filter(
        (cliente) =>
          (cliente.nombre?.toLowerCase() || "").includes(value.toLowerCase()) ||
          (cliente.apellido?.toLowerCase() || "").includes(
            value.toLowerCase()
          ) ||
          (cliente.numeroDocumento &&
            cliente.numeroDocumento.toLowerCase().includes(value.toLowerCase()))
      );
      setFilteredClientes(filtered);
      setIsClientSearching(false);
    }, 300);
  };

  const selectCliente = (cliente: Cliente) => {
    setFactura({ ...factura, clienteId: cliente.id });
    setClientSearchTerm(
      `${(cliente.nombre || "").trim()} ${(cliente.apellido || "").trim()}`
    );
    setShowClientDropdown(false);
  };

  const agregarRenglon = (producto: Producto) => {
    const existe = factura.facturaRenglons.find(
      (renglon) => renglon.productoId === producto.id.toString()
    );

    if (existe) {
      existe.cantidad++;
      setFactura({
        ...factura,
        subtotal: factura.subtotal + existe.precioVenta,
        total:
          factura.subtotal +
          existe.precioVenta -
          factura.descuento +
          factura.interes,
      });
    } else {
      const nuevoRenglon: FacturaRenglon = {
        id: Math.random().toString(36).substr(2, 9),
        productoId: producto.id.toString(),
        cantidad: 1,
        precioVenta: producto.productoProveedors[0].precioVenta,
        detalle: `${producto.nombre.trim()} ${producto.marcaId.nombre.trim()}`,
      };

      setFactura({
        ...factura,
        facturaRenglons: [...factura.facturaRenglons, nuevoRenglon],
        subtotal: factura.subtotal + nuevoRenglon.precioVenta,
        total:
          factura.subtotal +
          nuevoRenglon.precioVenta -
          factura.descuento +
          factura.interes,
      });
    }

    // Limpiar la búsqueda y los resultados
    setProductSearchTerm("");
    setProductos([]);
    setIsProductSearching(false);

    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }

    // Hacer scroll hacia abajo después de agregar producto
    setTimeout(scrollToBottom, 100);
  };

  // Función para agregar productos pesables
  const agregarRenglonPesable = (producto: Producto, precioTotal: number) => {
    // Calcular el peso basándose en el precio total y el precio por kg
    const precioPorKg = producto.productoProveedors[0].precioVenta;
    const peso = Math.round((precioTotal / precioPorKg) * 100) / 100; // Redondear a 2 decimales

    const nuevoRenglon: FacturaRenglon = {
      id: Math.random().toString(36).substr(2, 9),
      productoId: producto.id.toString(),
      cantidad: 1,
      precioVenta: precioTotal,
      detalle: `${producto.nombre.trim()} ${producto.marcaId.nombre.trim()}`,
      peso: peso, // Agregar el peso calculado
    };

    setFactura({
      ...factura,
      facturaRenglons: [...factura.facturaRenglons, nuevoRenglon],
      subtotal: Number(factura.subtotal) + Number(precioTotal),
      total:
        Number(factura.subtotal) +
        Number(precioTotal) -
        Number(factura.descuento) +
        Number(factura.interes),
    });

    // Limpiar la búsqueda y los resultados
    setProductSearchTerm("");
    setProductos([]);
    setIsProductSearching(false);

    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }

    // Hacer scroll hacia abajo después de agregar producto
    setTimeout(scrollToBottom, 100);
  };

  const removeRenglon = (index: number) => {
    const renglon = factura.facturaRenglons[index];
    const montoRenglon = renglon.peso
      ? renglon.precioVenta
      : renglon.precioVenta * renglon.cantidad;

    setFactura({
      ...factura,
      facturaRenglons: factura.facturaRenglons.filter((_, i) => i !== index),
      subtotal: factura.subtotal - montoRenglon,
      total:
        factura.subtotal - montoRenglon - factura.descuento + factura.interes,
    });
  };

  const agregarPago = () => {
    if (!tipoPagoSeleccionado || !montoPago) return;

    const monto = parseFloat(montoPago);
    if (isNaN(monto) || monto <= 0) return;

    // Buscar el tipo de pago seleccionado para obtener su nombre
    const tipoPagoEncontrado = tiposPago.find(
      (tp) => tp.id === tipoPagoSeleccionado
    );
    if (!tipoPagoEncontrado) return;

    const nuevoPago: Pago = {
      monto: monto,
      tipoPagoNombre: tipoPagoEncontrado.nombre.padEnd(32, " "),
      tipoPagoId: parseInt(tipoPagoSeleccionado),
    };

    // Actualizar la factura solo con el nuevo pago
    setFactura((prevFactura) => ({
      ...prevFactura,
      pagos: [...prevFactura.pagos, nuevoPago],
    }));

    setPagos((prevPagos) => [...prevPagos, nuevoPago]);
    setTotalPagado((prevTotal) => prevTotal + monto);
    setMontoPago("");
    setTipoPagoSeleccionado("");
  };

  const removePago = (index: number) => {
    const pago = pagos[index];
    setPagos((prevPagos) => prevPagos.filter((_, i) => i !== index));
    setTotalPagado((prevTotal) => prevTotal - pago.monto);
  };

  const handleFinalizar = async () => {
    try {
      setLoadingBtn(true);
      console.log("Valores actuales:", {
        tipoComprobanteId,
        tipoDocumentoId,
        nroDocumento,
      });

      const facturaConComprobante = {
        ...factura,
        comprobanteId: {
          tipoComprobanteId: tipoComprobanteId,
          tipoDocumentoId: tipoDocumentoId,
          nroDocumento: nroDocumento,
        },
      };
      console.log("Payload de la factura:", facturaConComprobante);
      const nuevaFactura = await pointOfSaleService.createFactura(
        facturaConComprobante
      );
      setFacturaGuardada(nuevaFactura);
      setShowPaymentModal(false);
      setLoadingBtn(false);
      setShowPrintModal(true);
      // Reset all payment modal data
      setTotalPagado(0);
      setPagos([]);
      setMontoPago("");
      setTipoPagoSeleccionado("");
      resetComprobanteId();
    } catch (err) {
      setError("Error al guardar la factura");
      console.error(err);
    }
  };

  const handlePrint = async () => {
    try {
      setLoadingBtn(true);
      await pointOfSaleService.imprimirFactura(factura);
      toast.success("Factura impresa correctamente");
      setLoadingBtn(false);
      setShowPrintModal(false);
      setFacturaGuardada(null);
      setFactura(initialFactura);
      setTotalPagado(0);
      setPagos([]);
    } catch (error) {
      console.error("Error al imprimir la factura:", error);
      toast.error("Error al imprimir la factura");
    }
  };

  const handleNoPrint = () => {
    setShowPrintModal(false);
    setFacturaGuardada(null);
    // Resetear la factura
    setFactura({
      id: "",
      facturaRenglons: [],
      total: 0,
      subtotal: 0,
      descuento: 0,
      interes: 0,
      pagos: [],
      comprobanteId: {
        tipoComprobanteId: 1,
        tipoDocumentoId: 1,
        nroDocumento: "0",
      },
      clienteId: 1,
    });
  };

  const agregarPromocion = (promocion: Promocion) => {
    const descuento =
      promocion.porcentaje > 0
        ? factura.subtotal * promocion.porcentaje
        : promocion.monto;

    setFactura({
      ...factura,
      descuento,
      promocionId: promocion.id,
      total: factura.subtotal - descuento + factura.interes,
    });
    setShowPromotionModal(false);
  };

  const handleAddCustomProduct = () => {
    if (!customProductName || !customProductPrice) return;

    const price = parseFloat(customProductPrice);
    if (isNaN(price) || price <= 0) return;

    const nuevoRenglon: FacturaRenglon = {
      id: Math.random().toString(36).substr(2, 9),
      productoId: "custom",
      cantidad: 1,
      precioVenta: price,
      detalle: customProductName.trim(),
    };

    setFactura({
      ...factura,
      facturaRenglons: [...factura.facturaRenglons, nuevoRenglon],
      subtotal: factura.subtotal + price,
      total: factura.subtotal + price - factura.descuento + factura.interes,
    });

    setCustomProductName("");
    setCustomProductPrice("");
    setShowCustomProductModal(false);

    // Hacer scroll hacia abajo después de agregar producto
    setTimeout(scrollToBottom, 100);
  };

  const handleCancelFactura = () => {
    setFactura({
      id: "",
      facturaRenglons: [],
      total: 0,
      subtotal: 0,
      descuento: 0,
      interes: 0,
      pagos: [],
      comprobanteId: {
        tipoComprobanteId: 1,
        tipoDocumentoId: 1,
        nroDocumento: "0",
      },
      clienteId: 1,
    });
    setClientSearchTerm("");
    setShowCancelModal(false);

    // Restaurar el consumidor final después de cancelar
    const consumidorFinal = clientes.find(
      (cliente) => cliente.nombre === "CONSUMIDOR FINAL"
    );
    if (consumidorFinal) {
      setFactura((prevFactura) => ({
        ...prevFactura,
        clienteId: consumidorFinal.id,
      }));
      setClientSearchTerm(
        `${consumidorFinal.nombre.trim()} ${consumidorFinal.apellido.trim()}`
      );
    }
  };

  const resetComprobanteId = () => {
    setTipoComprobanteId(1);
    setTipoDocumentoId(1);
    setNroDocumento("0");
  };

  // Función para hacer scroll hacia abajo en la tabla de renglones
  const scrollToBottom = () => {
    if (renglonesTableRef.current) {
      renglonesTableRef.current.scrollTop =
        renglonesTableRef.current.scrollHeight;
    }
  };

  const renderProductos = () => {
    if (isProductSearching) {
      return (
        <div className="col-span-full flex justify-center items-center mt-10">
          <Loader size="lg" />
        </div>
      );
    }

    if (productos.length === 0) {
      return (
        <div className="col-span-full text-center mt-5 text-gray-500">
          {productSearchTerm.trim().length > 0
            ? "No se encontraron productos"
            : "Escribe el nombre o código del producto"}
        </div>
      );
    }

    if (viewMode === "cards") {
      return productos.map((producto) => (
        <div
          key={producto.id}
          className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => agregarRenglon(producto)}
        >
          <h3 className="font-semibold">{producto.nombre.trim()}</h3>
          <p className="text-gray-600">{producto.marcaId.nombre.trim()}</p>
          <div className="mt-2">
            <p className="text-sm text-gray-500">
              Código: {producto.codigoReferencia.trim()}
            </p>
            <p className="text-sm text-gray-500">
              Categoría: {producto.categoriaId.nombre.trim()}
            </p>
            {producto.productoProveedors[0] && (
              <p className="text-lg font-bold text-blue-600 mt-2">
                {formatCurrency(producto.productoProveedors[0].precioVenta)}
              </p>
            )}
          </div>
        </div>
      ));
    }

    return (
      <div className="col-span-full">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Producto
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Código
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Categoría
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Precio
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {productos.map((producto) => (
              <tr
                key={producto.id}
                onClick={() => agregarRenglon(producto)}
                className="hover:bg-gray-50 cursor-pointer"
              >
                <td className="px-6 py-2 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <img
                        className="h-10 w-10 rounded-full"
                        src={`https://caffito.com.ar/api/imagenes/${producto.codigoReferencia.trim()}.jpg`}
                        alt=""
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.onerror = null;
                          target.style.display = "none";
                          const iconContainer = target.parentElement!;
                          const root = createRoot(iconContainer);
                          root.render(<LuImageOff size={32} color="#9CA3AF" />);
                        }}
                      />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {producto.nombre.trim()}
                      </div>
                      <div className="text-sm text-gray-500">
                        {producto.marcaId.nombre.trim()}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {producto.codigoReferencia.trim()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {producto.categoriaId.nombre.trim()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-bold text-blue-600">
                    {formatCurrency(
                      producto.productoProveedors[0]?.precioVenta
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="container min-w-[95vw] mx-auto px-2 h-[85vh] flex flex-col font-['Poppins']">
      <div className="flex justify-between items-center mb-3">
        <h1 className="text-2xl font-bold text-gray-800">Punto de Venta</h1>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-3">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 h-[95%]">
        {/* Productos */}
        <div className="bg-white shadow-md rounded-lg p-3 flex flex-col h-full">
          <div className="mb-3">
            <div className="flex items-center justify-between space-x-3">
              <div className="flex-1">
                <div className="relative">
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={productSearchTerm}
                    onChange={handleProductSearchChange}
                    onKeyDown={handleProductSearchKeyDown}
                    placeholder={`Buscar por ${
                      searchByCode ? "código" : "nombre"
                    }...`}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-['Poppins']"
                  />
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setSearchByCode(!searchByCode)}
                  className={`px-3 py-2 rounded ${
                    searchByCode
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-800"
                  }`}
                >
                  {searchByCode ? "Buscar por nombre" : "Buscar por código"}
                </button>
                <button
                  onClick={() =>
                    setViewMode(viewMode === "cards" ? "list" : "cards")
                  }
                  className="px-3 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300"
                >
                  {viewMode === "cards" ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
          <div
            className={`${
              viewMode === "cards"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"
                : ""
            } flex-1 overflow-auto`}
          >
            {renderProductos()}
          </div>
        </div>

        {/* Factura */}
        <div className="bg-white shadow-md rounded-lg p-3 flex flex-col h-full">
          {/* Cliente */}
          <div className="mb-3 min-h-[120px] h-[15%]">
            <h2 className="text-xl font-bold mb-2">Factura</h2>
            <div className="mb-3">
              <label className="block text-gray-700 font-bold mb-2">
                Cliente
              </label>
              <div className="relative">
                <div className="relative">
                  <input
                    type="text"
                    value={clientSearchTerm}
                    onChange={(e) => handleClientSearch(e.target.value)}
                    placeholder="Buscar cliente..."
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                    {clientSearchTerm && (
                      <button
                        onClick={() => {
                          setClientSearchTerm("");
                          setShowClientDropdown(false);
                        }}
                        className="text-gray-500 hover:text-gray-700"
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
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    )}
                    <FaSearch size={16} color="#9CA3AF" />
                  </div>
                </div>
                {showClientDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-auto">
                    {isClientSearching ? (
                      <div className="flex justify-center items-center p-4 py-3">
                        <Loader size="lg" />
                      </div>
                    ) : filteredClientes.length > 0 ? (
                      filteredClientes.map((cliente) => (
                        <div
                          key={cliente.id}
                          onClick={() => selectCliente(cliente)}
                          className="px-4 py-2 hover:bg-blue-50 cursor-pointer flex justify-between items-center"
                        >
                          <span>
                            {(cliente.nombre || "").trim()}{" "}
                            {(cliente.apellido || "").trim()}
                          </span>
                          {cliente.numeroDocumento && (
                            <span className="text-sm text-gray-500">
                              {cliente.numeroDocumento.trim()}
                            </span>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-8 text-center text-gray-500">
                        No se encontraron resultados
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* Renglones */}
          <div
            ref={renglonesTableRef}
            className="mb-3 flex-1 overflow-auto border-2 border-gray-500 rounded-sm h-[65%] max-h-[450px]"
          >
            <table className="w-full overflow-auto">
              <thead className="sticky top-0">
                <tr>
                  <th className="text-center  text-base font-bold text-gray-500 uppercase tracking-wider bg-gray-100">
                    ID
                  </th>
                  <th className="text-left text-base font-bold text-gray-500 uppercase tracking-wider bg-gray-100">
                    Producto
                  </th>
                  <th className="text-right text-base font-bold text-gray-500 uppercase tracking-wider bg-gray-100">
                    Cantidad/Peso
                  </th>
                  <th className="text-right text-base font-bold text-gray-500 uppercase tracking-wider bg-gray-100">
                    Precio
                  </th>
                  <th className="text-right text-base font-bold text-gray-500 uppercase tracking-wider bg-gray-100">
                    Subtotal
                  </th>
                  <th className="bg-gray-100"></th>
                </tr>
              </thead>
              <tbody>
                {factura.facturaRenglons.map((renglon, index) => (
                  <tr key={renglon.id}>
                    <td className="py-2 font-bold text-center ">{index + 1}</td>
                    <td className="py-2">{renglon.detalle}</td>
                    <td className="text-right py-2">
                      {renglon.peso ? (
                        <span>{renglon.peso} kg</span>
                      ) : (
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => {
                              if (renglon.cantidad > 1) {
                                const updatedRenglons = [
                                  ...factura.facturaRenglons,
                                ];
                                updatedRenglons[index].cantidad--;
                                setFactura({
                                  ...factura,
                                  facturaRenglons: updatedRenglons,
                                  subtotal:
                                    factura.subtotal - renglon.precioVenta,
                                  total:
                                    factura.subtotal -
                                    renglon.precioVenta -
                                    factura.descuento +
                                    factura.interes,
                                });
                              }
                            }}
                            disabled={renglon.cantidad <= 1}
                            className={`p-1 rounded ${
                              renglon.cantidad <= 1
                                ? "text-gray-300 cursor-not-allowed"
                                : "text-blue-500 hover:text-blue-700"
                            }`}
                          >
                            <FaMinus size={14} />
                          </button>
                          <span>{renglon.cantidad}</span>
                          <button
                            onClick={() => {
                              const updatedRenglons = [
                                ...factura.facturaRenglons,
                              ];
                              updatedRenglons[index].cantidad++;
                              setFactura({
                                ...factura,
                                facturaRenglons: updatedRenglons,
                                subtotal:
                                  factura.subtotal + renglon.precioVenta,
                                total:
                                  factura.subtotal +
                                  renglon.precioVenta -
                                  factura.descuento +
                                  factura.interes,
                              });
                            }}
                            className="p-1 rounded text-blue-500 hover:text-blue-700"
                          >
                            <FaPlus size={14} />
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="text-right py-2">
                      {formatCurrency(renglon.precioVenta)}
                    </td>
                    <td className="text-right py-2">
                      {formatCurrency(renglon.precioVenta * renglon.cantidad)}
                    </td>
                    <td className="text-right py-2">
                      <button
                        onClick={() => removeRenglon(index)}
                        className="p-1 rounded text-red-500 hover:text-red-700"
                      >
                        <FaTrash size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totales */}
          <div className="mb-3 h-[20%] min-h-[130px]">
            <div className="flex justify-between mb-2 text-xl">
              <span>Subtotal:</span>
              <span>{formatCurrency(factura.subtotal)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span>Descuento:</span>
              <span>{formatCurrency(factura.descuento)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span>Interés:</span>
              <span>{formatCurrency(factura.interes)}</span>
            </div>
            <div className="flex justify-between font-bold text-3xl">
              <span>Total:</span>
              <span>{formatCurrency(factura.total)}</span>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowCustomProductModal(true)}
              className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded"
            >
              Agregar Producto
            </button>
            <button
              onClick={() => setShowCancelModal(true)}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
            >
              Cancelar
            </button>
            <button
              onClick={() => setShowPaymentModal(true)}
              disabled={factura.facturaRenglons.length === 0}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Finalizar
            </button>
          </div>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      <CancelModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancelFactura}
      />

      {/* Custom Product Modal */}
      <CustomProductModal
        isOpen={showCustomProductModal}
        onClose={() => setShowCustomProductModal(false)}
        onAdd={handleAddCustomProduct}
        productName={customProductName}
        setProductName={setCustomProductName}
        productPrice={customProductPrice}
        setProductPrice={setCustomProductPrice}
      />

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false);
          resetComprobanteId();
        }}
        onFinalize={handleFinalizar}
        tiposPago={tiposPago}
        tipoPagoSeleccionado={tipoPagoSeleccionado}
        setTipoPagoSeleccionado={setTipoPagoSeleccionado}
        montoPago={montoPago}
        setMontoPago={setMontoPago}
        pagos={pagos}
        agregarPago={agregarPago}
        removePago={removePago}
        factura={factura}
        totalPagado={totalPagado}
        loadingBtn={loadingBtn}
        tipoComprobantes={tipoComprobantes}
        tipoDocumentos={tipoDocumentos}
        tipoComprobanteId={tipoComprobanteId}
        setTipoComprobanteId={setTipoComprobanteId}
        tipoDocumentoId={tipoDocumentoId}
        setTipoDocumentoId={setTipoDocumentoId}
        nroDocumento={nroDocumento}
        setNroDocumento={setNroDocumento}
      />

      {/* Promotion Modal */}
      {showPromotionModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Agregar Promoción
              </h3>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Promoción
                </label>
                <select
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onChange={(e) => {
                    const promocion = promociones.find(
                      (p) => p.id === e.target.value
                    );
                    if (promocion) {
                      agregarPromocion(promocion);
                    }
                  }}
                >
                  <option value="">Seleccionar promoción</option>
                  {promociones.map((promocion) => (
                    <option key={promocion.id} value={promocion.id}>
                      {promocion.nombre}
                      {promocion.porcentaje > 0
                        ? ` (${promocion.porcentaje * 100}%)`
                        : ` ($${promocion.monto})`}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => setShowPromotionModal(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Print Confirmation Modal */}
      {showPrintModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Factura guardada
              </h3>
              <p className="text-gray-600 mb-4">¿Desea imprimir el ticket?</p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleNoPrint}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                >
                  No
                </button>
                <button
                  onClick={handlePrint}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                >
                  {loadingBtn ? <Loader size="sm" /> : "Sí"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PointOfSalePage;
