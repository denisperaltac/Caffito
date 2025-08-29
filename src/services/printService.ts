import qz from "qz-tray";
import { Factura } from "../types/configuration";
import LogoCaffito from "../assets/LogoCaffito.png";

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
      data: string[]
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
  factura: Factura,
  options?: { omitTitle?: boolean }
) => {
  const lines = [];

  // Encabezado
  if (!options?.omitTitle) {
    lines.push("Caffito");
  }
  lines.push("--------------------------------");
  lines.push("Direccion: Lavalle 773");
  lines.push("Tel: (3408) 680521");
  lines.push("CUIT: 20-18096191-8");
  lines.push(`Fecha: ${fecha}`);
  lines.push(`Hora: ${hora}`);
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
  lines.push(`Cliente: ${factura.clienteId || "Consumidor Final"}`);
  lines.push("--------------------------------");

  // Detalles de la factura
  if (factura.facturaRenglons && factura.facturaRenglons.length > 0) {
    lines.push("PRODUCTOS");
    lines.push("--------------------------------");
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
  lines.push("--------------------------------");
  lines.push(`Subtotal: $${factura.subtotal?.toFixed(2) || "0.00"}`);
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
        logoDataUrl = await loadImageAsBase64(LogoCaffito as unknown as string);
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

      // Opciones específicas para impresora térmica XPRINTER XP-58IIH (58mm)
      const printOptions = {
        rasterize: true, // Forzar rasterización para mejor compatibilidad
        width: 380, // Ancho en píxeles para papel de 58mm (aproximadamente 380px)
        height: "auto", // Altura automática
        density: 203, // DPI estándar para impresoras térmicas
        orientation: "portrait", // Orientación vertical
        colorType: "grayscale", // Escala de grises para impresoras térmicas
        jobName: "Caffito Ticket",
        perSpool: true, // Un trabajo por spool
        altPrinting: false, // Impresión normal
        encoding: "UTF-8", // Codificación de caracteres
        replaceSpecialCharacters: true, // Reemplazar caracteres especiales
        scaleContent: true, // Escalar contenido al ancho del papel
        size: {
          // Tamaño específico para 58mm
          width: "58mm",
          height: "auto",
        },
      };

      // Construir datos a imprimir con opciones optimizadas
      const dataToPrint: any[] = [];

      if (logoDataUrl) {
        // Agregar el logo con opciones específicas para impresora térmica
        dataToPrint.push({
          type: "image",
          data: logoDataUrl,
          options: {
            ...printOptions,
            // Opciones específicas para imagen
            imageWidth: 350, // Ancho de imagen para 58mm (un poco menor que el ancho del papel)
            imageHeight: "auto", // Altura automática manteniendo proporción
            imageDensity: 203, // DPI para imagen
            imageThreshold: 128, // Umbral para conversión a blanco y negro
            imageInvert: false, // No invertir colores
            imageMirror: false, // No espejar imagen
            imageRotate: 0, // Sin rotación
            imageInterpolation: "nearest", // Interpolación más rápida
            imageSmoothing: false, // Sin suavizado para mejor definición
          },
        });
        console.log(
          "Logo agregado con opciones optimizadas para la impresora XPRINTER XP-58IIH"
        );
      }

      // Agregar el contenido del ticket
      dataToPrint.push({
        type: "text",
        data: ticketContent,
        options: {
          ...printOptions,
          // Opciones específicas para texto
          fontSize: 12, // Tamaño de fuente estándar
          fontFamily: "monospace", // Fuente monoespaciada para mejor alineación
          textAlign: "left", // Alineación a la izquierda
          textBold: false, // Sin negrita por defecto
          textItalic: false, // Sin cursiva por defecto
          textUnderline: false, // Sin subrayado por defecto
          textStrike: false, // Sin tachado por defecto
          textInvert: false, // Sin inversión de colores
          textMirror: false, // Sin espejo de texto
          textRotate: 0, // Sin rotación de texto
          textSpacing: 0, // Espaciado normal entre caracteres
          textLineSpacing: 1.2, // Espaciado entre líneas
        },
      });

      console.log("Enviando trabajo de impresión con opciones optimizadas...");

      // Intentar imprimir con todas las opciones optimizadas
      try {
        await (qz as any).print(config, dataToPrint);
        console.log(
          "✅ Impresión exitosa con logo y opciones optimizadas para XPRINTER XP-58IIH"
        );
        return true;
      } catch (printError) {
        console.warn(
          "⚠️ Fallo en impresión optimizada, intentando con opciones básicas:",
          printError
        );

        // Fallback: intentar con opciones básicas
        const fallbackData = logoDataUrl
          ? [{ type: "image", data: logoDataUrl }, ticketContent]
          : [ticketContent];

        try {
          await (qz as any).print(config, fallbackData);
          console.log("✅ Impresión exitosa con opciones básicas");
          return true;
        } catch (fallbackError) {
          console.error("❌ Fallo en impresión básica:", fallbackError);

          // Último fallback: solo texto
          try {
            await (qz as any).print(config, [ticketContent]);
            console.log("✅ Impresión exitosa solo texto (último fallback)");
            return true;
          } catch (finalError) {
            console.error("❌ Error crítico de impresión:", finalError);
            throw new Error(`No se pudo imprimir: ${finalError}`);
          }
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
