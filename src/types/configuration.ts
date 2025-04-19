export interface PointOfSale {
  id: string;
  nombre: string;
  direccion: string;
  telefono: string;
  activo: boolean;
  observaciones?: string;
}

export interface Promotion {
  id: string;
  nombre: string;
  descripcion: string;
  fechaInicio: Date;
  fechaFin: Date;
  descuento: number;
  activo: boolean;
}

export interface PaymentType {
  id: string;
  nombre: string;
  descripcion: string;
  activo: boolean;
}

export interface Province {
  id: string;
  nombre: string;
  descripcion: string;
  activo: boolean;
}

export interface Department {
  id: string;
  nombre: string;
  descripcion: string;
  provinciaId: string;
  activo: boolean;
}

export interface Location {
  id: string;
  nombre: string;
  descripcion: string;
  departamentoId: string;
  activo: boolean;
}

export interface DocumentType {
  id: string;
  nombre: string;
  descripcion: string;
  activo: boolean;
}

export interface Organization {
  id: string;
  nombre: string;
  descripcion: string;
  direccion: string;
  telefono: string;
  email: string;
  activo: boolean;
}

export interface TaxCondition {
  id: string;
  nombre: string;
  descripcion: string;
  activo: boolean;
}

export interface ReceiptType {
  id: string;
  nombre: string;
  descripcion: string;
  activo: boolean;
}

export interface ComprobanteType {
  id: string;
  nombre: string;
  descripcion: string;
  activo: boolean;
}

export interface Producto {
  id: number;
  nombre: string;
  descripcion: string | null;
  codigoReferencia: string;
  cantidad: number;
  stockMin: number | null;
  stockMax: number | null;
  borrado: boolean;
  categoriaId: {
    id: number;
    nombre: string;
    borrado: boolean;
  };
  marcaId: {
    id: number;
    nombre: string;
    borrado: boolean;
  };
  impuestoId: {
    id: number;
    nombre: string;
    porcentaje: number;
    borrado: boolean;
  };
  productoProveedors: Array<{
    id: number;
    precioCosto: number;
    precioVenta: number;
    precioMayorista: number;
    cantidad: number;
    activo: boolean;
    pesounidad: number | null;
    pesototal: number;
    stockMin: number | null;
    stockMax: number | null;
    productoId: number;
    proveedor: {
      id: number;
      nombreProveedor: string;
      direccion: string;
      telefono: string;
      email: string;
      cuit: string;
      borrado: boolean;
    };
    puntoDeVentaId: number;
    puntoDeVentaNombre: string;
    porcentajeGanancia: number;
  }>;
  peso: number | null;
  pesable: boolean;
  cambioPrecio: boolean;
}

export interface Categoria {
  id: string;
  nombre: string;
}

export interface Cliente {
  id: number;
  nombre: string;
  apellido: string;
  numeroDocumento?: string;
  calle?: string;
  numeroCalle?: number;
  piso?: string;
  email?: string;
  telefono?: string;
  mayorista?: boolean;
  empleado?: boolean;
  activo: boolean;
  localidadId?: {
    id: number;
    nombre: string;
    departamentoId: {
      id: number;
      nombre: string;
      provinciaId: {
        id: number;
        nombre: string;
      };
    };
  };
  tipoDocumentoId?: number;
  tipoDocumentoNombre?: string;
}

export interface FacturaRenglon {
  id: string;
  productoId: string;
  cantidad: number;
  precioVenta: number;
  detalle: string;
}

export interface Pago {
  monto: number;
  tipoPagoNombre: string;
  tipoPagoId: number;
}

export interface Factura {
  id: string;
  subtotal: number;
  descuento: number;
  interes: number;
  total: number;
  facturaRenglons: FacturaRenglon[];
  pagos: Pago[];
  comprobanteId: {
    tipoComprobanteId: string;
    tipoDocumentoId: string;
    nroDocumento: string;
  };
  clienteId: number;
  promocionId?: string;
}

export interface Promocion {
  id: string;
  nombre: string;
  porcentaje: number;
  monto: number;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface ProductoProveedor {
  id: number;
  precioCosto: number;
  precioVenta: number;
  precioMayorista: number;
  cantidad: number;
  activo: boolean;
  pesounidad: number | null;
  pesototal: number;
  stockMin: number | null;
  stockMax: number | null;
  productoId: number;
  proveedor: {
    id: number;
    nombreProveedor: string;
    direccion: string;
    telefono: string;
    email: string;
    cuit: string;
    borrado: boolean;
  };
  puntoDeVentaId: number;
  puntoDeVentaNombre: string;
  porcentajeGanancia: number;
}
