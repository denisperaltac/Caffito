export interface Cash {
  id: string;
  fechaApertura: Date;
  fechaCierre?: Date;
  montoInicial: number;
  montoFinal?: number;
  estado: "ABIERTA" | "CERRADA";
  usuario: string;
  observaciones?: string;
}

export interface CashMovement {
  id: string;
  fecha: Date;
  tipo: "INGRESO" | "EGRESO";
  monto: number;
  descripcion: string;
  formaPago: "EFECTIVO" | "TARJETA" | "TRANSFERENCIA";
  comprobante?: string;
  observaciones?: string;
}

export interface CashSummary {
  totalIngresos: number;
  totalEgresos: number;
  saldoFinal: number;
  movimientos: CashMovement[];
}
