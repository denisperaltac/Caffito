import { Cash, CashMovement, CashSummary } from "../types/cash";

// Mock data for demonstration
const mockCash: Cash[] = [
  {
    id: "1",
    fechaApertura: new Date("2024-04-18T10:00:00"),
    montoInicial: 1000,
    estado: "ABIERTA",
    usuario: "admin",
  },
];

const mockMovements: CashMovement[] = [
  {
    id: "1",
    fecha: new Date("2024-04-18T10:30:00"),
    tipo: "INGRESO",
    monto: 500,
    descripcion: "Venta #123",
    formaPago: "EFECTIVO",
  },
  {
    id: "2",
    fecha: new Date("2024-04-18T11:00:00"),
    tipo: "EGRESO",
    monto: 200,
    descripcion: "Compra de insumos",
    formaPago: "EFECTIVO",
  },
];

export const cashService = {
  // Get current cash register
  async getCurrent(): Promise<Cash | null> {
    return mockCash.find((c) => c.estado === "ABIERTA") || null;
  },

  // Get all cash registers
  async getAll(): Promise<Cash[]> {
    return mockCash;
  },

  // Open a new cash register
  async openCash(montoInicial: number, observaciones?: string): Promise<Cash> {
    const newCash: Cash = {
      id: Math.random().toString(36).substr(2, 9),
      fechaApertura: new Date(),
      montoInicial,
      estado: "ABIERTA",
      usuario: "admin", // This should come from auth context
      observaciones,
    };
    mockCash.push(newCash);
    return newCash;
  },

  // Close current cash register
  async closeCash(montoFinal: number, observaciones?: string): Promise<Cash> {
    const currentCash = mockCash.find((c) => c.estado === "ABIERTA");
    if (!currentCash) throw new Error("No hay caja abierta");

    currentCash.estado = "CERRADA";
    currentCash.fechaCierre = new Date();
    currentCash.montoFinal = montoFinal;
    currentCash.observaciones = observaciones;

    return currentCash;
  },

  // Get movements for a cash register
  async getMovements(cashId: string): Promise<CashMovement[]> {
    return mockMovements;
  },

  // Add a new movement
  async addMovement(movement: Omit<CashMovement, "id">): Promise<CashMovement> {
    const newMovement: CashMovement = {
      id: Math.random().toString(36).substr(2, 9),
      ...movement,
    };
    mockMovements.push(newMovement);
    return newMovement;
  },

  // Get cash summary
  async getSummary(cashId: string): Promise<CashSummary> {
    const movements = await this.getMovements(cashId);
    const totalIngresos = movements
      .filter((m) => m.tipo === "INGRESO")
      .reduce((sum, m) => sum + m.monto, 0);
    const totalEgresos = movements
      .filter((m) => m.tipo === "EGRESO")
      .reduce((sum, m) => sum + m.monto, 0);

    return {
      totalIngresos,
      totalEgresos,
      saldoFinal: totalIngresos - totalEgresos,
      movimientos: movements,
    };
  },
};
