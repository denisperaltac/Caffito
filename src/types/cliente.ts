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

export interface CuentaCorriente {
  id: number;
  debe: number;
  haber: number;
  saldo: number;
  fechaHora: string;
  detalle: string;
  clienteId: number;
}

export interface SaldoCuentaCorriente {
  saldo: number;
}

export type SortField =
  | "id"
  | "nombre"
  | "apellido"
  | "tipoDocumentoNombre"
  | "numeroDocumento"
  | "mayorista"
  | "empleado"
  | "activo";
export type SortDirection = "asc" | "desc";
