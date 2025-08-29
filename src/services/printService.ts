import qz from "qz-tray";
import { Factura } from "../types/configuration";
import LogoCaffito from "../assets/LogoCaffito.png";
import LogoCaffitoBN from "../assets/LogoCaffitoBN.png";

// Extender la definición de tipos de qz-tray
declare module "qz-tray" {
  interface QZ {
    configs: {
      create(
        printer: string,
        options?: { copies?: number }
      ): {
        printer: string;
        copies: number;
      };
    };
    print(
      config: { printer: string; copies: number },
      data: any[]
    ): Promise<any>;
    websocket: {
      connect(): Promise<any>;
      disconnect(): Promise<any>;
      isActive(): boolean;
    };
    printers: {
      getDefault(): Promise<string>;
    };
  }
}

// Configuración de la impresora
const printerConfig = {
  printer: "", // Se establecerá dinámicamente
  copies: 1,
  jobName: "Factura",
};

// Obtener la impresora por defecto
const getDefaultPrinter = async () => {
  try {
    const defaultPrinter = await (qz as any).printers.getDefault();
    printerConfig.printer = defaultPrinter;
    return defaultPrinter;
  } catch (error) {
    console.error("Error al obtener la impresora por defecto:", error);
    throw error;
  }
};

// Inicializar qz-tray
export const initializeQz = async () => {
  try {
    // Asegurarse de que qz-tray está cargado
    if (!qz) {
      throw new Error("qz-tray no está cargado correctamente");
    }

    // Verificar si ya hay una conexión activa
    if ((qz as any).websocket.isActive()) {
      console.log("Ya existe una conexión activa con qz-tray");
      return true;
    }

    // Intentar establecer la conexión
    console.log("Intentando conectar con qz-tray...");

    // Intentar conectar con un timeout
    const connectionPromise = (qz as any).websocket.connect();
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(
        () => reject(new Error("Timeout al conectar con QZ Tray")),
        5000
      );
    });

    await Promise.race([connectionPromise, timeoutPromise]);
    console.log("Conexión establecida con qz-tray");
    await getDefaultPrinter();

    return true;
  } catch (error) {
    console.error("Error al inicializar qz-tray:", error);
    if (error instanceof Error) {
      if (error.message.includes("Unable to establish connection")) {
        console.error("Por favor, asegúrate de que:");
        console.error(
          "1. QZ Tray está instalado y ejecutándose en tu computadora"
        );
        console.error(
          "2. La aplicación web está accediendo desde http://localhost o https://"
        );
        console.error(
          "3. QZ Tray tiene permisos para conectarse a esta aplicación"
        );
      }
    }
    throw error;
  }
};

const now = new Date();
const fecha = now.toLocaleDateString("es-AR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});
const hora = now.toLocaleTimeString("es-AR", {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

// Cargar imagen como base64 (data URL)
const loadImageAsBase64 = async (url: string): Promise<string | null> => {
  try {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) return null;
    const blob = await response.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => reject(null);
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    console.error("No se pudo cargar el logo para impresión", e);
    return null;
  }
};

// Formatear el contenido del ticket
const formatTicketContent = (
  factura: Factura & { clienteNombreApellido?: string },
  options?: { omitTitle?: boolean }
) => {
  const lines = [];
  console.log("Factura", factura);
  // Encabezado
  if (!options?.omitTitle) {
    lines.push("Caffito");
  }
  lines.push("Direccion: Lavalle 773");
  lines.push("Tel: (3408) 680521");
  lines.push("CUIT: 20-18096191-8");
  lines.push(`Fecha: ${fecha} - ${hora}`);
  // Identificadores de ticket / comprobante
  if (factura.comprobanteId && factura.comprobanteId.codigo) {
    lines.push(`NR.T.: ${factura.comprobanteId.codigo}`);
  } else {
    lines.push(`Ticket #: ${factura.id || "N/A"}`);
  }
  // Datos AFIP (si existen)
  if (factura.comprobanteId && factura.comprobanteId.cae) {
    lines.push(`CAE: ${factura.comprobanteId.cae}`);
  }
  if (factura.clienteNombreApellido) {
    lines.push(`Cliente: ${factura.clienteNombreApellido}`);
  } else {
    lines.push(`Consumidor Final`);
  }
  lines.push("--------------------------------");

  // Detalles de la factura
  if (factura.facturaRenglons && factura.facturaRenglons.length > 0) {
    lines.push("PRODUCTOS");
    factura.facturaRenglons.forEach((renglon) => {
      lines.push(`${renglon.detalle || ""}`);
      lines.push(
        `${renglon.cantidad || 0} x $${
          renglon.precioVenta?.toFixed(2) || 0
        } = $${((renglon.cantidad || 0) * (renglon.precioVenta || 0)).toFixed(
          2
        )}`
      );
    });
  }

  // Totales
  if (factura.descuento > 0 || factura.interes > 0) {
    lines.push(`Subtotal: $${factura.subtotal?.toFixed(2) || "0.00"}`);
  }
  if (factura.descuento > 0) {
    lines.push(`Descuento: -$${factura.descuento.toFixed(2)}`);
  }
  if (factura.interes > 0) {
    lines.push(`Interés: +$${factura.interes.toFixed(2)}`);
  }
  lines.push(`Total: $${factura.total?.toFixed(2) || "0.00"}`);

  // Pagos
  lines.push("--------------------------------");
  lines.push("PAGOS");
  if (factura.pagos && factura.pagos.length > 0) {
    factura.pagos.forEach((pago) => {
      lines.push(
        `${pago.tipoPagoNombre?.trim() || ""}: $${
          pago.monto?.toFixed(2) || "0.00"
        }`
      );
    });
  }

  // Pie
  lines.push("--------------------------------");
  lines.push("¡Gracias por su compra!");
  lines.push("--------------------------------");
  lines.push(""); // Línea en blanco al final para cortar el ticket
  lines.push("");
  lines.push("");
  lines.push("");
  lines.push("");

  return lines.join("\n");
};

// Servicio de impresión
export const printService = {
  printInvoice: async (factura: Factura) => {
    try {
      // Verificar si qz-tray está cargado
      if (!qz) {
        throw new Error("qz-tray no está cargado correctamente");
      }

      // Solo conectar si no hay una conexión activa
      if (!(qz as any).websocket.isActive()) {
        console.log("Intentando conectar con qz-tray...");
        await initializeQz();
      }

      // Intentar cargar el logo
      let logoDataUrl: string | null = null;
      try {
        logoDataUrl = await loadImageAsBase64(
          LogoCaffitoBN as unknown as string
        );
        if (logoDataUrl) {
          console.log("Logo cargado correctamente para impresión");
        }
      } catch (error) {
        console.warn("No se pudo cargar el logo:", error);
      }

      // Formatear el contenido del ticket (si hay logo, omite el título "Caffito")
      const ticketContent = formatTicketContent(factura, {
        omitTitle: Boolean(logoDataUrl),
      });

      console.log("Datos a imprimir:", {
        printer: printerConfig.printer,
        hasLogo: Boolean(logoDataUrl),
        factura,
      });

      // Configurar el trabajo de impresión
      const config = (qz as any).configs.create(printerConfig.printer, {
        copies: printerConfig.copies,
      });

      // Construir datos a imprimir usando la API correcta de QZ Tray
      const dataToPrint: any[] = [];

      if (logoDataUrl) {
        // Usar la API correcta de QZ Tray para imágenes
        // QZ Tray espera un objeto con propiedades específicas
        dataToPrint.push({
          type: "raw",
          format: "image",
          data: logoDataUrl,
          options: {
            language: "escp",
            dotDensity: "double",
            width: 280,
            height: "auto",
          },
        });
        console.log("Logo agregado usando API correcta de QZ Tray");
      }

      // Agregar el contenido del ticket
      dataToPrint.push(ticketContent);

      console.log("Enviando trabajo de impresión con API correcta...");

      // Intentar imprimir con la API correcta
      try {
        await (qz as any).print(config, dataToPrint);
        console.log(
          "✅ Impresión exitosa con logo y texto usando API correcta"
        );
        return true;
      } catch (printError) {
        console.warn(
          "⚠️ Fallo en impresión con API correcta, intentando solo texto:",
          printError
        );

        // Fallback: solo texto
        try {
          await (qz as any).print(config, [ticketContent]);
          console.log("✅ Impresión exitosa solo texto (fallback)");
          return true;
        } catch (fallbackError) {
          console.error("❌ Error crítico de impresión:", fallbackError);
          throw new Error(`No se pudo imprimir: ${fallbackError}`);
        }
      }
    } catch (error) {
      console.error("❌ Error al imprimir la factura:", error);
      throw error;
    }
  },

  // Cerrar la conexión con qz-tray
  closeConnection: async () => {
    try {
      if ((qz as any).websocket.isActive()) {
        await (qz as any).websocket.disconnect();
      }
    } catch (error) {
      console.error("Error al cerrar la conexión con qz-tray:", error);
      throw error;
    }
  },
};
