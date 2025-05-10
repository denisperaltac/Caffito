export interface Cliente {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  tipoDocumentoNombre: string | null;
  numeroDocumento: string;
  mayorista: boolean;
  empleado: boolean;
  activo: boolean;
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
