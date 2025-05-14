export interface Gasto {
  id?: number;
  name: string;
  monto: number;
  categoriaId?: number;
  proveedorId?: number;
  categoria?: {
    id: number;
  };
  proveedor?: {
    id: number;
  };
  fecha: string;
  hora?: string;
  notes?: string;
  pagado?: boolean;
  deleted?: boolean;
}

export interface GetGastosParams {
  page?: number;
  size?: number;
  name?: string;
  categoriaId?: number;
  proveedorId?: number;
  fecha?: string;
  pagado?: boolean;
  sort?: string;
}
