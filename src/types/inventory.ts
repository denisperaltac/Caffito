export interface Stock {
  id: string;
  productId: string;
  quantity: number;
  minimum: number;
  maximum: number;
  location: string;
}

export interface StockMovement {
  id: string;
  productId: string;
  type: "in" | "out";
  quantity: number;
  date: string;
  reason: string;
}

export interface ProductoProveedor {
  id: number;
  activo: boolean;
  precioCosto: number;
  precioVenta: number;
  precioMayorista: number;
  porcentajeGanancia: number;
  puntoDeVentaId: number;
  puntoDeVentaNombre: string;
  proveedor: {
    id: number;
    nombreProveedor: string;
    direccion: string;
    telefono: string;
    email: string;
    cuit: string;
    borrado: boolean;
  } | null;
}

export interface Producto {
  id: number;
  nombre: string;
  descripcion: string | null;
  codigoReferencia: string;
  cantidad: number;
  stockMin: number | null;
  stockMax: number | null;
  categoriaId: {
    id: number;
    nombre: string;
  };
  marcaId: {
    id: number;
    nombre: string;
  };
  productoProveedors: ProductoProveedor[];
  impuestoId: number | null;
  pesable: boolean;
  cambioPrecio?: string;
}

export interface ProductoOptional {
  id?: number;
  nombre: string;
  descripcion: string | null;
  codigoReferencia: string;
  cantidad: number;
  stockMin: number | null;
  stockMax: number | null;
  categoriaId: {
    id: number;
    nombre: string;
  };
  marcaId: {
    id: number;
    nombre: string;
  };
  productoProveedors: any;
  impuestoId: number | null;
  pesable: boolean;
}

export interface Label {
  id: string;
  name: string;
  description: string;
  color: string;
  products: string[]; // Array of product IDs
}

export interface Supplier {
  id: number;
  nombreProveedor: string;
  calle: string;
  numeroCalle: string;
  email: string;
  telefono: string;
  localidadId: {
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
}

export interface Category {
  id: number;
  nombre: string;
  rubroId: {
    id: number;
    nombre: string;
  } | null;
}

export interface Brand {
  id: string;
  name: string;
  description: string;
  active: boolean;
}

export interface Tax {
  id: string;
  nombre: string;
  porcentaje: number;
}

export interface Proveedor {
  id: number;
  nombreProveedor: string;
  calle: string;
  numeroCalle: string;
  email: string;
  telefono: string;
  localidadId: {
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
}
