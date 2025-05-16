import qz from "qz-tray";
import { Factura } from "../types/configuration";

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
  }
}

// Configuración de la impresora
const printerConfig = {
  printer: "POS-58", // Nombre de la impresora térmica
  copies: 1,
  jobName: "Factura",
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

// Formatear el contenido del ticket
const formatTicketContent = (factura: Factura) => {
  const lines = [];

  // Encabezado
  lines.push("CAFFITO");
  lines.push("-------------------");
  lines.push(`Fecha: ${new Date().toLocaleString()}`);
  lines.push(`Cliente: ${factura.clienteId || "Consumidor Final"}`);
  lines.push("-------------------");

  // Detalles de la factura
  if (factura.facturaRenglons && factura.facturaRenglons.length > 0) {
    factura.facturaRenglons.forEach((renglon) => {
      lines.push(`${renglon.detalle || ""}`);
      lines.push(
        `${renglon.cantidad || 0} x ${renglon.precioVenta || 0} = ${
          (renglon.cantidad || 0) * (renglon.precioVenta || 0)
        }`
      );
    });
  }

  // Totales
  lines.push("-------------------");
  lines.push(`Subtotal: ${factura.subtotal || 0}`);
  if (factura.descuento > 0) {
    lines.push(`Descuento: -${factura.descuento}`);
  }
  if (factura.interes > 0) {
    lines.push(`Interés: +${factura.interes}`);
  }
  lines.push(`Total: ${factura.total || 0}`);

  // Pagos
  lines.push("-------------------");
  lines.push("Pagos:");
  if (factura.pagos && factura.pagos.length > 0) {
    factura.pagos.forEach((pago) => {
      lines.push(`${pago.tipoPagoNombre?.trim() || ""}: ${pago.monto || 0}`);
    });
  }

  // Pie
  lines.push("-------------------");
  lines.push("¡Gracias por su compra!");
  lines.push("-------------------");

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

      // Formatear el contenido del ticket
      const ticketContent = formatTicketContent(factura);

      // Configurar el trabajo de impresión usando qz.configs.create
      const config = (qz as any).configs.create(printerConfig.printer, {
        copies: printerConfig.copies,
      });

      console.log("Datos a imprimir:", {
        config,
        ticketContent,
        factura,
      });

      // Enviar a imprimir usando qz.print con el contenido del ticket directamente
      await (qz as any)
        .print(config, [ticketContent])
        .then(() => {
          console.log("Impreso OK");
        })
        .catch((error: any) => console.error(error));

      return true;
    } catch (error) {
      console.error("Error al imprimir la factura:", error);
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
