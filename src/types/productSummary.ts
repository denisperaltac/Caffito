export interface ProductSummaryData {
  productosMasVendidos: ProductoVendido[];
  productosPorCategoria: CategoriaProducto[];
  fechaInicio: string;
  fechaFin: string;
}

export interface ProductoVendido {
  productoId: number;
  productoNombre: string;
  productoCodigo: string;
  categoriaNombre: string;
  categoriaId: number;
  cantidadVendida: number;
  ingresoGenerado: number;
  precioPromedio: number;
}

export interface CategoriaProducto {
  categoriaId: number;
  categoriaNombre: string;
  totalVendido: number;
  totalIngreso: number;
  cantidadProductos: number;
}

export interface ProductSummaryFilters {
  fechaInicio: string;
  fechaFin: string;
  categoriaId?: number;
  orderBy?: "cantidad" | "ingreso";
  limit?: number;
}
