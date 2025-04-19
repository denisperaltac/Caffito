import {
  Producto,
  Categoria,
  Cliente,
  Factura,
  Promocion,
  Pago,
  FacturaRenglon,
} from "../types/configuration";
import axiosInstance from "./axiosInstance";
import { API_URL } from "../constants/api";

// Mock data
const mockProductos: Producto[] = [
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

const mockClientes: Cliente[] = [
  {
    id: "1",
    nombre: "Juan",
    apellido: "Pérez",
    activo: true,
  },
  {
    id: "2",
    nombre: "María",
    apellido: "Gómez",
    activo: true,
  },
];

const mockPromociones: Promocion[] = [
  {
    id: "1",
    nombre: "2x1 en Bebidas",
    porcentaje: 0.5,
    monto: 0,
  },
  {
    id: "2",
    nombre: "Descuento 20%",
    porcentaje: 0.2,
    monto: 0,
  },
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
  createFactura: async (factura: Omit<Factura, "id">): Promise<Factura> => {
    const newFactura: Factura = {
      id: Math.random().toString(36).substr(2, 9),
      ...factura,
    };
    return newFactura;
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
      clienteId: "",
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
      clienteId: "",
    };
  },

  // Print methods
  imprimirFactura: async (facturaId: string): Promise<void> => {
    // In a real implementation, this would print the invoice
    console.log(`Imprimiendo factura ${facturaId}`);
  },
};
