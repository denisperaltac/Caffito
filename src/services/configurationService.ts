import {
  PointOfSale,
  Promotion,
  PaymentType,
  Province,
  Department,
  Location,
  DocumentType,
  ComprobanteType,
} from "../types/configuration";

// Mock data
const mockPointsOfSale: PointOfSale[] = [
  {
    id: "1",
    nombre: "Sucursal Central",
    direccion: "Av. Principal 123",
    telefono: "123456789",
    activo: true,
  },
  {
    id: "2",
    nombre: "Sucursal Norte",
    direccion: "Calle Norte 456",
    telefono: "987654321",
    activo: true,
  },
];

const mockPromotions: Promotion[] = [
  {
    id: "1",
    nombre: "2x1 en Gaseosas",
    descripcion: "Lleva 2 gaseosas y paga 1",
    fechaInicio: new Date("2024-04-01"),
    fechaFin: new Date("2024-04-30"),
    descuento: 50,
    activo: true,
  },
  {
    id: "2",
    nombre: "Descuento en Lácteos",
    descripcion: "20% de descuento en productos lácteos",
    fechaInicio: new Date("2024-04-15"),
    fechaFin: new Date("2024-05-15"),
    descuento: 20,
    activo: true,
  },
];

const mockPaymentTypes: PaymentType[] = [
  {
    id: "1",
    nombre: "Efectivo",
    descripcion: "Pago en efectivo",
    activo: true,
  },
  {
    id: "2",
    nombre: "Tarjeta de Crédito",
    descripcion: "Pago con tarjeta de crédito",
    activo: true,
  },
  {
    id: "3",
    nombre: "Tarjeta de Débito",
    descripcion: "Pago con tarjeta de débito",
    activo: true,
  },
  {
    id: "4",
    nombre: "Transferencia",
    descripcion: "Pago por transferencia bancaria",
    activo: true,
  },
];

const mockProvinces: Province[] = [
  {
    id: "1",
    nombre: "Buenos Aires",
    descripcion: "Provincia de Buenos Aires",
    activo: true,
  },
  {
    id: "2",
    nombre: "Córdoba",
    descripcion: "Provincia de Córdoba",
    activo: true,
  },
  {
    id: "3",
    nombre: "Santa Fe",
    descripcion: "Provincia de Santa Fe",
    activo: true,
  },
];

const mockDepartments: Department[] = [
  {
    id: "1",
    nombre: "Capital",
    descripcion: "Departamento Capital de Buenos Aires",
    provinciaId: "1",
    activo: true,
  },
  {
    id: "2",
    nombre: "La Plata",
    descripcion: "Departamento La Plata",
    provinciaId: "1",
    activo: true,
  },
  {
    id: "3",
    nombre: "Córdoba",
    descripcion: "Departamento Capital de Córdoba",
    provinciaId: "2",
    activo: true,
  },
];

const mockLocations: Location[] = [
  {
    id: "1",
    nombre: "Ciudad Autónoma de Buenos Aires",
    descripcion: "Capital Federal",
    departamentoId: "1",
    activo: true,
  },
  {
    id: "2",
    nombre: "La Plata",
    descripcion: "Capital de la Provincia de Buenos Aires",
    departamentoId: "2",
    activo: true,
  },
  {
    id: "3",
    nombre: "Córdoba",
    descripcion: "Capital de la Provincia de Córdoba",
    departamentoId: "3",
    activo: true,
  },
];

const mockDocumentTypes: DocumentType[] = [
  {
    id: "1",
    nombre: "DNI",
    descripcion: "Documento Nacional de Identidad",
    activo: true,
  },
  {
    id: "2",
    nombre: "CUIT",
    descripcion: "Clave Única de Identificación Tributaria",
    activo: true,
  },
  {
    id: "3",
    nombre: "CUIL",
    descripcion: "Clave Única de Identificación Laboral",
    activo: true,
  },
  {
    id: "4",
    nombre: "LC",
    descripcion: "Libreta Cívica",
    activo: false,
  },
];

const mockComprobanteTypes: ComprobanteType[] = [
  {
    id: "1",
    nombre: "Factura A",
    descripcion: "Factura para Responsables Inscriptos",
    activo: true,
  },
  {
    id: "2",
    nombre: "Factura B",
    descripcion: "Factura para Consumidores Finales",
    activo: true,
  },
  {
    id: "3",
    nombre: "Nota de Crédito A",
    descripcion: "Nota de Crédito para Facturas A",
    activo: true,
  },
  {
    id: "4",
    nombre: "Nota de Crédito B",
    descripcion: "Nota de Crédito para Facturas B",
    activo: true,
  },
];

export const configurationService = {
  // Point of Sale methods
  getPointsOfSale: async (): Promise<PointOfSale[]> => {
    return mockPointsOfSale;
  },

  createPointOfSale: async (
    pointOfSale: Omit<PointOfSale, "id">
  ): Promise<PointOfSale> => {
    const newPointOfSale: PointOfSale = {
      id: Math.random().toString(36).substr(2, 9),
      ...pointOfSale,
    };
    mockPointsOfSale.push(newPointOfSale);
    return newPointOfSale;
  },

  updatePointOfSale: async (
    id: string,
    pointOfSale: Partial<PointOfSale>
  ): Promise<PointOfSale> => {
    const index = mockPointsOfSale.findIndex((pos) => pos.id === id);
    if (index === -1) throw new Error("Punto de venta no encontrado");

    mockPointsOfSale[index] = {
      ...mockPointsOfSale[index],
      ...pointOfSale,
    };

    return mockPointsOfSale[index];
  },

  deletePointOfSale: async (id: string): Promise<void> => {
    const index = mockPointsOfSale.findIndex((pos) => pos.id === id);
    if (index === -1) throw new Error("Punto de venta no encontrado");

    mockPointsOfSale.splice(index, 1);
  },

  // Promotion methods
  getPromotions: async (): Promise<Promotion[]> => {
    return mockPromotions;
  },

  createPromotion: async (
    promotion: Omit<Promotion, "id">
  ): Promise<Promotion> => {
    const newPromotion: Promotion = {
      id: Math.random().toString(36).substr(2, 9),
      ...promotion,
    };
    mockPromotions.push(newPromotion);
    return newPromotion;
  },

  updatePromotion: async (
    id: string,
    promotion: Partial<Promotion>
  ): Promise<Promotion> => {
    const index = mockPromotions.findIndex((p) => p.id === id);
    if (index === -1) throw new Error("Promoción no encontrada");

    mockPromotions[index] = {
      ...mockPromotions[index],
      ...promotion,
    };

    return mockPromotions[index];
  },

  deletePromotion: async (id: string): Promise<void> => {
    const index = mockPromotions.findIndex((p) => p.id === id);
    if (index === -1) throw new Error("Promoción no encontrada");

    mockPromotions.splice(index, 1);
  },

  // Payment Type methods
  getPaymentTypes: async (): Promise<PaymentType[]> => {
    return mockPaymentTypes;
  },

  createPaymentType: async (
    paymentType: Omit<PaymentType, "id">
  ): Promise<PaymentType> => {
    const newPaymentType: PaymentType = {
      id: Math.random().toString(36).substr(2, 9),
      ...paymentType,
    };
    mockPaymentTypes.push(newPaymentType);
    return newPaymentType;
  },

  updatePaymentType: async (
    id: string,
    paymentType: Partial<PaymentType>
  ): Promise<PaymentType> => {
    const index = mockPaymentTypes.findIndex((pt) => pt.id === id);
    if (index === -1) throw new Error("Tipo de pago no encontrado");

    mockPaymentTypes[index] = {
      ...mockPaymentTypes[index],
      ...paymentType,
    };

    return mockPaymentTypes[index];
  },

  deletePaymentType: async (id: string): Promise<void> => {
    const index = mockPaymentTypes.findIndex((pt) => pt.id === id);
    if (index === -1) throw new Error("Tipo de pago no encontrado");

    mockPaymentTypes.splice(index, 1);
  },

  // Province methods
  getProvinces: async (): Promise<Province[]> => {
    return mockProvinces;
  },

  createProvince: async (province: Omit<Province, "id">): Promise<Province> => {
    const newProvince: Province = {
      id: Math.random().toString(36).substr(2, 9),
      ...province,
    };
    mockProvinces.push(newProvince);
    return newProvince;
  },

  updateProvince: async (
    id: string,
    province: Partial<Province>
  ): Promise<Province> => {
    const index = mockProvinces.findIndex((p) => p.id === id);
    if (index === -1) throw new Error("Provincia no encontrada");

    mockProvinces[index] = {
      ...mockProvinces[index],
      ...province,
    };

    return mockProvinces[index];
  },

  deleteProvince: async (id: string): Promise<void> => {
    const index = mockProvinces.findIndex((p) => p.id === id);
    if (index === -1) throw new Error("Provincia no encontrada");

    mockProvinces.splice(index, 1);
  },

  // Department methods
  getDepartments: async (): Promise<Department[]> => {
    return mockDepartments;
  },

  createDepartment: async (
    department: Omit<Department, "id">
  ): Promise<Department> => {
    const newDepartment: Department = {
      id: Math.random().toString(36).substr(2, 9),
      ...department,
    };
    mockDepartments.push(newDepartment);
    return newDepartment;
  },

  updateDepartment: async (
    id: string,
    department: Partial<Department>
  ): Promise<Department> => {
    const index = mockDepartments.findIndex((d) => d.id === id);
    if (index === -1) throw new Error("Departamento no encontrado");

    mockDepartments[index] = {
      ...mockDepartments[index],
      ...department,
    };

    return mockDepartments[index];
  },

  deleteDepartment: async (id: string): Promise<void> => {
    const index = mockDepartments.findIndex((d) => d.id === id);
    if (index === -1) throw new Error("Departamento no encontrado");

    mockDepartments.splice(index, 1);
  },

  // Location methods
  getLocations: async (): Promise<Location[]> => {
    return mockLocations;
  },

  createLocation: async (location: Omit<Location, "id">): Promise<Location> => {
    const newLocation: Location = {
      id: Math.random().toString(36).substr(2, 9),
      ...location,
    };
    mockLocations.push(newLocation);
    return newLocation;
  },

  updateLocation: async (
    id: string,
    location: Partial<Location>
  ): Promise<Location> => {
    const index = mockLocations.findIndex((l) => l.id === id);
    if (index === -1) throw new Error("Localidad no encontrada");

    mockLocations[index] = {
      ...mockLocations[index],
      ...location,
    };

    return mockLocations[index];
  },

  deleteLocation: async (id: string): Promise<void> => {
    const index = mockLocations.findIndex((l) => l.id === id);
    if (index === -1) throw new Error("Localidad no encontrada");

    mockLocations.splice(index, 1);
  },

  // Document Type methods
  getDocumentTypes: async (): Promise<DocumentType[]> => {
    return mockDocumentTypes;
  },

  createDocumentType: async (
    documentType: Omit<DocumentType, "id">
  ): Promise<DocumentType> => {
    const newDocumentType: DocumentType = {
      id: Math.random().toString(36).substr(2, 9),
      ...documentType,
    };
    mockDocumentTypes.push(newDocumentType);
    return newDocumentType;
  },

  updateDocumentType: async (
    id: string,
    documentType: Partial<DocumentType>
  ): Promise<DocumentType> => {
    const index = mockDocumentTypes.findIndex((dt) => dt.id === id);
    if (index === -1) throw new Error("Tipo de documento no encontrado");

    mockDocumentTypes[index] = {
      ...mockDocumentTypes[index],
      ...documentType,
    };

    return mockDocumentTypes[index];
  },

  deleteDocumentType: async (id: string): Promise<void> => {
    const index = mockDocumentTypes.findIndex((dt) => dt.id === id);
    if (index === -1) throw new Error("Tipo de documento no encontrado");

    mockDocumentTypes.splice(index, 1);
  },

  // Comprobante Type methods
  getComprobanteTypes: async (): Promise<ComprobanteType[]> => {
    return mockComprobanteTypes;
  },

  createComprobanteType: async (
    comprobanteType: Omit<ComprobanteType, "id">
  ): Promise<ComprobanteType> => {
    const newComprobanteType: ComprobanteType = {
      id: Math.random().toString(36).substr(2, 9),
      ...comprobanteType,
    };
    mockComprobanteTypes.push(newComprobanteType);
    return newComprobanteType;
  },

  updateComprobanteType: async (
    id: string,
    comprobanteType: Partial<ComprobanteType>
  ): Promise<ComprobanteType> => {
    const index = mockComprobanteTypes.findIndex((ct) => ct.id === id);
    if (index === -1) throw new Error("Tipo de comprobante no encontrado");

    mockComprobanteTypes[index] = {
      ...mockComprobanteTypes[index],
      ...comprobanteType,
    };

    return mockComprobanteTypes[index];
  },

  deleteComprobanteType: async (id: string): Promise<void> => {
    const index = mockComprobanteTypes.findIndex((ct) => ct.id === id);
    if (index === -1) throw new Error("Tipo de comprobante no encontrado");

    mockComprobanteTypes.splice(index, 1);
  },
};
