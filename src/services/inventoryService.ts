import {
  Stock,
  StockMovement,
  Producto,
  Supplier,
  Category,
  Brand,
  Tax,
  Proveedor,
} from "../types/inventory";
import axiosInstance from "../config/axiosConfig";
import { API_URL } from "../constants/api";
import jsPDF from "jspdf";
import JsBarcode from "jsbarcode";

// Mock data for demonstration
const mockProducts: Producto[] = [
  {
    id: 1,
    nombre: "Producto 1",
    descripcion: "Descripción del producto 1",
    codigoReferencia: "REF001",
    cantidad: 10,
    stockMin: 5,
    stockMax: 20,
    categoriaId: {
      id: 1,
      nombre: "Categoría 1",
    },
    marcaId: {
      id: 1,
      nombre: "Marca 1",
    },
    productoProveedors: [],
    impuestoId: null,
    pesable: false,
  },
];

const mockCategories: Category[] = [
  {
    id: 1,
    nombre: "Categoría 1",
    rubroId: {
      id: 1,
      nombre: "Rubro 1",
    },
  },
];

const mockBrands: Brand[] = [
  {
    id: "1",
    name: "Marca A",
    description: "Descripción de Marca A",
    active: true,
  },
  {
    id: "2",
    name: "Marca B",
    description: "Descripción de Marca B",
    active: true,
  },
  {
    id: "3",
    name: "Marca C",
    description: "Descripción de Marca C",
    active: false,
  },
];

export const inventoryService = {
  // Stock Management
  async getStock(): Promise<Stock[]> {
    // Mock implementation
    return [];
  },

  // Stock Movements
  async getStockMovements(): Promise<StockMovement[]> {
    // Mock implementation
    return [];
  },

  // Products
  async getProducts(): Promise<Producto[]> {
    return mockProducts;
  },

  async getProductsWithPriceChange(
    page: number = 0,
    size: number = 10,
    fechaInicio?: string,
    fechaFin?: string
  ): Promise<Producto[]> {
    try {
      const params: any = {
        page,
        size,
        sort: "cambioPrecio,desc",
      };

      // Agregar filtros de fecha si están presentes
      if (fechaInicio) {
        params[
          "cambioPrecio.greaterThanOrEqual"
        ] = `${fechaInicio}T00:00:00.000Z`;
      }
      if (fechaFin) {
        params["cambioPrecio.lessThanOrEqual"] = `${fechaFin}T23:59:59.999Z`;
      }

      const response = await axiosInstance.get(`${API_URL}/productos`, {
        params,
      });

      // La API devuelve directamente un array, no un objeto con paginación
      const products = response.data;

      // Limpiar espacios en blanco de los campos
      const cleanedProducts = products.map((product: any) => ({
        ...product,
        codigoReferencia: product.codigoReferencia?.trim() || "",
        nombre: product.nombre?.trim() || "",
        descripcion: product.descripcion?.trim() || "",
        categoriaId: {
          ...product.categoriaId,
          nombre: product.categoriaId?.nombre?.trim() || "",
        },
        marcaId: {
          ...product.marcaId,
          nombre: product.marcaId?.nombre?.trim() || "",
        },
      }));

      return cleanedProducts;
    } catch (error) {
      console.error("Error fetching products with price change:", error);
      throw error;
    }
  },

  async getProductsCount(
    fechaInicio?: string,
    fechaFin?: string
  ): Promise<number> {
    try {
      const params: any = {
        page: 0,
        size: 1,
        sort: "cambioPrecio,desc",
      };

      // Agregar filtros de fecha si están presentes
      if (fechaInicio) {
        params[
          "cambioPrecio.greaterThanOrEqual"
        ] = `${fechaInicio}T00:00:00.000Z`;
      }
      if (fechaFin) {
        params["cambioPrecio.lessThanOrEqual"] = `${fechaFin}T23:59:59.999Z`;
      }

      // Intentar obtener el count desde el endpoint específico con filtros
      try {
        const countResponse = await axiosInstance.get(
          `${API_URL}/productos/count`,
          {
            params: {
              ...(fechaInicio && {
                "cambioPrecio.greaterThanOrEqual": `${fechaInicio}T00:00:00.000Z`,
              }),
              ...(fechaFin && {
                "cambioPrecio.lessThanOrEqual": `${fechaFin}T23:59:59.999Z`,
              }),
            },
          }
        );
        return countResponse.data;
      } catch (countError) {
        console.log(
          "Count endpoint failed, trying fallback method:",
          countError
        );

        // Si falla el endpoint de count, usar el método de fallback con filtros
        const response = await axiosInstance.get(`${API_URL}/productos`, {
          params,
        });

        // Buscar en headers o usar un valor por defecto
        const totalCount =
          response.headers["x-total-count"] ||
          response.headers["X-Total-Count"] ||
          response.headers["total-count"] ||
          response.headers["Total-Count"];

        if (totalCount) {
          return parseInt(totalCount, 10);
        }

        // Si no hay header, devolver un valor por defecto
        return 100; // Valor por defecto para paginación
      }
    } catch (error) {
      console.error("Error fetching products count:", error);
      return 100; // Valor por defecto
    }
  },

  async generateEtiquetas(
    etiquetas: Array<{
      nombre: string;
      precio: number;
      codigo: string;
      marca?: string;
    }>
  ): Promise<void> {
    try {
      // Crear nuevo documento PDF
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      // Configuración de la etiqueta
      const labelWidth = 66; // mm
      const labelHeight = 40; // mm
      const margin = 6; // mm
      const labelsPerRow = 3;
      const labelsPerPage = 18; // 3x6 para máximo aprovechamiento del espacio

      let currentPage = 0;
      let labelIndex = 0;

      etiquetas.forEach((etiqueta) => {
        // Si necesitamos una nueva página
        if (labelIndex > 0 && labelIndex % labelsPerPage === 0) {
          doc.addPage();
          currentPage++;
        }

        // Calcular posición en la página actual
        const positionInPage = labelIndex % labelsPerPage;
        const row = Math.floor(positionInPage / labelsPerRow);
        const col = positionInPage % labelsPerRow;

        const x = margin + col * (labelWidth + 1); // Espacio mínimo entre etiquetas
        const y = margin + row * (labelHeight + 6); // Espacio mínimo entre filas

        // Dibujar borde de la etiqueta
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.1);
        doc.rect(x, y, labelWidth, labelHeight);

        // Nombre del producto con manejo de texto largo
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");

        const maxWidth = labelWidth - 2; // Ancho disponible para el texto
        const maxCharsPerLine = Math.floor(maxWidth / 2.8); // Aproximadamente 2.5mm por carácter con fuente 7
        const maxCharsFirstLine = Math.floor(maxCharsPerLine * 1); // Primera línea más corta (70% del máximo)

        let productName = etiqueta.nombre.trim();
        let lines = [];

        // Función para dividir texto en palabras con límites diferentes por línea
        const splitTextIntoLines = (
          text: string,
          maxCharsFirst: number,
          maxCharsSecond: number
        ): string[] => {
          const words = text.split(" ");
          const lines: string[] = [];
          let currentLine = "";
          let isFirstLine = true;

          for (const word of words) {
            const currentMaxChars = isFirstLine
              ? maxCharsFirst
              : maxCharsSecond;
            const testLine = currentLine ? `${currentLine} ${word}` : word;

            if (testLine.length <= currentMaxChars) {
              currentLine = testLine;
            } else {
              if (currentLine) {
                lines.push(currentLine);
                currentLine = word;
                isFirstLine = false; // Cambiar a segunda línea
              } else {
                // Palabra individual muy larga
                if (word.length > currentMaxChars) {
                  lines.push(word.substring(0, currentMaxChars - 3) + "...");
                } else {
                  lines.push(word);
                }
                isFirstLine = false; // Cambiar a segunda línea
              }
            }
          }

          if (currentLine) {
            lines.push(currentLine);
          }

          return lines;
        };

        // Dividir el texto en líneas
        lines = splitTextIntoLines(
          productName,
          maxCharsFirstLine,
          maxCharsPerLine
        );

        // Limitar a máximo 2 líneas
        if (lines.length > 2) {
          lines = lines.slice(0, 2);
          // Si la segunda línea es muy larga, cortarla y agregar puntos suspensivos
          if (lines[1] && lines[1].length > maxCharsPerLine) {
            lines[1] = lines[1].substring(0, maxCharsPerLine - 3) + "...";
          }
        }

        let lineHeight = 4; // Altura entre líneas

        // Dibujar las líneas
        lines.forEach((line, index) => {
          doc.text(line, x + 2, y + 5 + index * lineHeight);
        });

        // Marca del producto
        if (etiqueta.marca && etiqueta.marca.trim()) {
          doc.setFontSize(10);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(102, 102, 102); // Gris oscuro

          // Posicionar la marca después del nombre (que puede ocupar hasta 2 líneas)
          const marcaY = y + 4.5 + lines.length * lineHeight + 1;
          doc.text(etiqueta.marca, x + 2, marcaY);
          doc.setTextColor(0, 0, 0); // Volver a negro
        }

        // Precio
        doc.setFontSize(32);
        doc.setFont("helvetica", "bold");
        let lineHeightPrecio = 5;
        if (lines.length === 1) {
          lineHeightPrecio = 8;
        }
        // Calcular posición del precio basada en el contenido anterior
        let precioY = y + 10 + lines.length * lineHeightPrecio + 1;
        if (etiqueta.marca && etiqueta.marca.trim()) {
          precioY += 3; // Espacio adicional si hay marca
        }

        // Formatear precio: si tiene más de 5 dígitos enteros, no mostrar decimales
        const parteEntera = Math.floor(etiqueta.precio);
        const precioFormateado =
          parteEntera.toString().length > 5
            ? `$${parteEntera}`
            : `$${etiqueta.precio.toFixed(2)}`;

        doc.text(precioFormateado, x + labelWidth / 2, precioY, {
          align: "center",
        });

        // Generar código de barras
        const canvas = document.createElement("canvas");

        // Función para generar un código válido según la longitud
        const generateValidCode = (code: string): string => {
          const cleanCode = code.trim().replace(/\D/g, ""); // Solo números

          if (cleanCode.length === 13) {
            return cleanCode; // Ya es EAN13 válido
          } else if (cleanCode.length === 12) {
            // Calcular dígito de control para EAN13 (algoritmo correcto)
            let sum = 0;
            for (let i = 0; i < 12; i++) {
              const digit = parseInt(cleanCode[i]);
              sum += digit * (i % 2 === 0 ? 1 : 3);
            }
            const checkDigit = (10 - (sum % 10)) % 10;
            return cleanCode + checkDigit;
          } else if (cleanCode.length === 10) {
            // Convertir UPC-A a EAN13 agregando 3 ceros al inicio
            const paddedCode = "000" + cleanCode;
            // Calcular dígito de control
            let sum = 0;
            for (let i = 0; i < 12; i++) {
              const digit = parseInt(paddedCode[i]);
              sum += digit * (i % 2 === 0 ? 1 : 3);
            }
            const checkDigit = (10 - (sum % 10)) % 10;
            return paddedCode + checkDigit;
          } else if (cleanCode.length < 10) {
            // Rellenar con ceros a la izquierda hasta 10 dígitos y convertir
            const paddedCode = cleanCode.padStart(10, "0");
            const eanCode = "000" + paddedCode;
            // Calcular dígito de control
            let sum = 0;
            for (let i = 0; i < 12; i++) {
              const digit = parseInt(eanCode[i]);
              sum += digit * (i % 2 === 0 ? 1 : 3);
            }
            const checkDigit = (10 - (sum % 10)) % 10;
            return eanCode + checkDigit;
          } else {
            // Si es más largo, tomar los primeros 12 dígitos y calcular check digit
            const truncatedCode = cleanCode.substring(0, 12);
            let sum = 0;
            for (let i = 0; i < 12; i++) {
              const digit = parseInt(truncatedCode[i]);
              sum += digit * (i % 2 === 0 ? 1 : 3);
            }
            const checkDigit = (10 - (sum % 10)) % 10;
            return truncatedCode + checkDigit;
          }
        };

        const validCode = generateValidCode(etiqueta.codigo);

        // Intentar generar código de barras con diferentes formatos
        try {
          JsBarcode(canvas, validCode, {
            format: "EAN13",
            width: 1,
            height: 40,
            displayValue: false,
          });
        } catch (error) {
          // Si EAN13 falla, intentar con CODE128 que es más flexible
          console.warn(
            `EAN13 falló para código ${validCode}, usando CODE128:`,
            error
          );
          JsBarcode(canvas, etiqueta.codigo, {
            format: "CODE128",
            width: 1,
            height: 40,
            displayValue: false,
          });
        }

        // Calcular posición del código de barras al final de la etiqueta
        let barcodeY = precioY + 3; // Espacio después del precio

        // Agregar código de barras al PDF
        const barcodeDataURL = canvas.toDataURL("image/png");
        doc.addImage(barcodeDataURL, "PNG", x + 2, barcodeY, labelWidth - 4, 8);

        // Números del código de barras
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        const codeText = validCode; // Usar el código válido generado
        const numbersY = barcodeY + 11; // Posición después del código de barras
        doc.text(codeText.substring(0, 1), x + 8, numbersY);
        doc.text(codeText.substring(1, 6), x + 18, numbersY);
        doc.text(codeText.substring(6, 12), x + 36, numbersY);

        labelIndex++;
      });

      // Descargar el PDF
      doc.save("etiquetas.pdf");
    } catch (error) {
      console.error("Error generando etiquetas:", error);
      throw error;
    }
  },

  async getProductById(id: number): Promise<Producto | null> {
    return mockProducts.find((p) => p.id === id) || null;
  },

  async updateProduct(
    id: number,
    product: Partial<Producto>
  ): Promise<Producto | null> {
    const index = mockProducts.findIndex((p) => p.id === id);
    if (index === -1) return null;
    mockProducts[index] = { ...mockProducts[index], ...product };
    return mockProducts[index];
  },

  // Categories
  async getCategories(): Promise<Category[]> {
    try {
      const response = await axiosInstance.get(`${API_URL}/categorias`, {
        params: {
          size: 9999,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error al obtener las categorías:", error);
      throw error;
    }
  },

  async createCategory(category: Omit<Category, "id">): Promise<Category> {
    const newCategory = {
      id: Math.floor(Math.random() * 1000),
      ...category,
    };
    mockCategories.push(newCategory);
    return newCategory;
  },

  async updateCategory(
    id: number,
    categoryData: Partial<Category>
  ): Promise<Category> {
    const index = mockCategories.findIndex((c) => c.id === id);
    if (index === -1) throw new Error("Category not found");
    const updatedCategory = { ...mockCategories[index], ...categoryData };
    mockCategories[index] = updatedCategory;
    return updatedCategory;
  },

  async deleteCategory(id: number): Promise<void> {
    const index = mockCategories.findIndex((c) => c.id === id);
    if (index === -1) throw new Error("Category not found");
    mockCategories.splice(index, 1);
  },

  // Brands
  getBrands: async (): Promise<Brand[]> => {
    try {
      const response = await axiosInstance.get(`${API_URL}/marcas`, {
        params: {
          size: 9999,
        },
      });
      return response.data.map((brand: any) => ({
        id: brand.id.toString(),
        name: brand.nombre.trim(),
        description: "",
        active: true,
      }));
    } catch (error) {
      console.error("Error fetching brands:", error);
      throw error;
    }
  },

  createBrand: async (brand: Omit<Brand, "id">): Promise<Brand> => {
    const newBrand: Brand = {
      ...brand,
      id: String(mockBrands.length + 1),
    };
    mockBrands.push(newBrand);
    return newBrand;
  },

  updateBrand: async (
    id: string,
    brandData: Partial<Brand>
  ): Promise<Brand> => {
    const index = mockBrands.findIndex((b) => b.id === id);
    if (index === -1) throw new Error("Brand not found");

    const updatedBrand = {
      ...mockBrands[index],
      ...brandData,
    };
    mockBrands[index] = updatedBrand;
    return updatedBrand;
  },

  deleteBrand: async (id: string): Promise<void> => {
    const index = mockBrands.findIndex((b) => b.id === id);
    if (index === -1) throw new Error("Brand not found");
    mockBrands.splice(index, 1);
  },

  // Taxes
  async getTaxes(): Promise<Tax[]> {
    try {
      const response = await axiosInstance.get(`${API_URL}/impuestos`, {
        params: {
          size: 9999,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching taxes:", error);
      throw error;
    }
  },

  async createTax(tax: Omit<Tax, "id">): Promise<Tax> {
    const newTax = {
      id: Math.random().toString(36).substr(2, 9),
      ...tax,
    };

    return newTax;
  },
  // Proveedores
  async getProveedors(): Promise<Proveedor[]> {
    try {
      const response = await axiosInstance.get(`${API_URL}/proveedors`, {
        params: {
          size: 9999,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error al obtener los proveedores:", error);
      throw error;
    }
  },

  // Funciones para Suppliers (usando la nueva estructura)
  async getSuppliers(page: number = 0, size: number = 20): Promise<Supplier[]> {
    try {
      const response = await axiosInstance.get(`${API_URL}/proveedors`, {
        params: {
          page,
          size,
          sort: "id,asc",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      throw error;
    }
  },

  async getSupplier(id: number): Promise<Supplier> {
    try {
      const response = await axiosInstance.get(`${API_URL}/proveedors/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching supplier:", error);
      throw error;
    }
  },

  async createSupplier(supplierData: Omit<Supplier, "id">): Promise<Supplier> {
    try {
      const response = await axiosInstance.post(
        `${API_URL}/proveedors`,
        supplierData
      );
      return response.data;
    } catch (error) {
      console.error("Error creating supplier:", error);
      throw error;
    }
  },

  async updateSupplier(
    id: number,
    supplierData: Partial<Supplier>
  ): Promise<Supplier> {
    try {
      const response = await axiosInstance.put(
        `${API_URL}/proveedors/${id}`,
        supplierData
      );
      return response.data;
    } catch (error) {
      console.error("Error updating supplier:", error);
      throw error;
    }
  },

  async deleteSupplier(id: number): Promise<void> {
    try {
      await axiosInstance.delete(`${API_URL}/proveedors/${id}`);
    } catch (error) {
      console.error("Error deleting supplier:", error);
      throw error;
    }
  },

  async getSuppliersCount(): Promise<number> {
    try {
      const response = await axiosInstance.get(`${API_URL}/proveedors/count`);
      return response.data;
    } catch (error) {
      console.error("Error fetching suppliers count:", error);
      throw error;
    }
  },
};
