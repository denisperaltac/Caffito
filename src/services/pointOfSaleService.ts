import {
  Producto,
  Categoria,
  Cliente,
  Factura,
  Promocion,
  Pago,
} from "../types/configuration";
import { API_URL } from "../constants/api";
import axiosInstance from "../config/axiosConfig";
import { printService } from "./printService";

// Mock data
const mockProductos: any = [
  {
    id: "1",
    nombre: "Coca Cola 2L",
    codigo: "001",
    precioVenta: 1200,
    marca: "Coca Cola",
    categoria: { id: "1", nombre: "Bebidas" },
  },
  {
    id: "2",
    nombre: "Pepsi 2L",
    codigo: "002",
    precioVenta: 1000,
    marca: "Pepsi",
    categoria: { id: "1", nombre: "Bebidas" },
  },
  {
    id: "3",
    nombre: "Pan Baguette",
    codigo: "003",
    precioVenta: 800,
    marca: "Panadería",
    categoria: { id: "2", nombre: "Panadería" },
  },
];

const mockCategorias: Categoria[] = [
  { id: "1", nombre: "Bebidas" },
  { id: "2", nombre: "Panadería" },
  { id: "3", nombre: "Lácteos" },
];

export const pointOfSaleService = {
  // Product methods
  getProductos: async (filtros: any = {}): Promise<Producto[]> => {
    let productos = [...mockProductos];

    if (filtros.nombre) {
      productos = productos.filter((p) =>
        p.nombre.toLowerCase().includes(filtros.nombre.toLowerCase())
      );
    }

    if (filtros.categoriaId) {
      productos = productos.filter(
        (p) => p.categoria.id === filtros.categoriaId
      );
    }

    return productos;
  },

  // Category methods
  getCategorias: async (): Promise<Categoria[]> => {
    return mockCategorias;
  },

  // Customer methods
  getClientes: async (): Promise<Cliente[]> => {
    try {
      const response = await axiosInstance.get<Cliente[]>(
        `${API_URL}/clientes?size=9999&activo.equals=true&sort=apellido,asc`
      );
      return response.data;
    } catch (error) {
      console.error("Error al obtener clientes:", error);
      throw error;
    }
  },

  // Promotion methods
  getPromociones: async (): Promise<Promocion[]> => {
    const response = await axiosInstance.get(`${API_URL}/promociones`);
    return response.data;
  },

  getTiposPago: async (): Promise<any[]> => {
    const response = await axiosInstance.get(`${API_URL}/tipo-pagos`);
    return response.data;
  },

  // Invoice methods
  createFactura: async (factura: Factura): Promise<Factura> => {
    try {
      const facturaPayload = {
        fechaCreacion: null,
        total: factura.total,
        subtotal: factura.subtotal,
        descuento: factura.descuento,
        interes: factura.interes,
        clienteId: factura.clienteId ? factura.clienteId : null,
        facturaRenglons: factura.facturaRenglons.map((renglon) => ({
          cantidad: renglon.cantidad,
          precioVenta: renglon.precioVenta,
          detalle: renglon.detalle,
          productoId: parseInt(renglon.productoId),
          peso: 0,
        })),
        pagos: factura.pagos.map((pago) => ({
          monto: pago.monto,
          tipoPagoNombre: pago.tipoPagoNombre.padEnd(32, " "),
          tipoPagoId: pago.tipoPagoId,
        })),
        comprobanteId: {
          nroDocumento: "0",
          tipoComprobanteId: 1,
          tipoDocumentoId: 1,
        },
      };

      const response = await axiosInstance.post(
        `${API_URL}/facturas`,
        facturaPayload
      );
      return response.data;
    } catch (error) {
      console.error("Error al crear la factura:", error);
      throw error;
    }
  },

  updateFactura: async (
    id: string,
    factura: Partial<Factura>
  ): Promise<Factura> => {
    // In a real implementation, this would update the invoice in the database
    return {
      id,
      subtotal: 0,
      descuento: 0,
      interes: 0,
      total: 0,
      facturaRenglons: [],
      pagos: [],
      comprobanteId: {
        tipoComprobanteId: "",
        tipoDocumentoId: "",
        nroDocumento: "",
      },
      clienteId: 1,
      ...factura,
    };
  },

  // Payment methods
  agregarPago: async (facturaId: string, pago: Pago): Promise<Factura> => {
    // In a real implementation, this would add a payment to the invoice
    return {
      id: facturaId,
      subtotal: 0,
      descuento: 0,
      interes: 0,
      total: 0,
      facturaRenglons: [],
      pagos: [pago],
      comprobanteId: {
        tipoComprobanteId: "",
        tipoDocumentoId: "",
        nroDocumento: "",
      },
      clienteId: 1,
    };
  },

  // Print methods
  imprimirFactura: async (factura: Factura) => {
    try {
      await printService.printInvoice(factura);
      return true;
    } catch (error) {
      console.error("Error al imprimir la factura:", error);
      throw error;
    }
  },
};
