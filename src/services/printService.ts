import { qz } from "qz-tray";
import { Factura } from "../types/configuration";

// Configuración de la impresora
const printerConfig = {
  printer: "POS-58", // Nombre de la impresora térmica
  copies: 1,
  jobName: "Factura",
};

// Inicializar qz-tray
const initializeQz = async () => {
  try {
    if (!qz.websocket.isActive()) {
      console.log("Iniciando conexión con qz-tray...");
      await qz.websocket.connect();
      console.log("Conexión establecida con qz-tray");
    }
    return true;
  } catch (error) {
    console.error("Error al inicializar qz-tray:", error);
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
  lines.push(`Cliente: ${factura.clienteId}`);
  lines.push("-------------------");

  // Detalles de la factura
  factura.facturaRenglons.forEach((renglon) => {
    lines.push(`${renglon.detalle}`);
    lines.push(
      `${renglon.cantidad} x ${renglon.precioVenta} = ${
        renglon.cantidad * renglon.precioVenta
      }`
    );
  });

  // Totales
  lines.push("-------------------");
  lines.push(`Subtotal: ${factura.subtotal}`);
  if (factura.descuento > 0) {
    lines.push(`Descuento: -${factura.descuento}`);
  }
  if (factura.interes > 0) {
    lines.push(`Interés: +${factura.interes}`);
  }
  lines.push(`Total: ${factura.total}`);

  // Pagos
  lines.push("-------------------");
  lines.push("Pagos:");
  factura.pagos.forEach((pago) => {
    lines.push(`${pago.tipoPagoNombre.trim()}: ${pago.monto}`);
  });

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
      // Inicializar qz-tray si no está conectado
      await initializeQz();

      // Formatear el contenido del ticket
      const ticketContent = formatTicketContent(factura);

      // Configurar el trabajo de impresión
      const config = {
        ...printerConfig,
        data: [
          {
            type: "raw",
            format: "plain",
            data: ticketContent,
          },
        ],
      };

      console.log("Datos a imprimir:", {
        config,
        ticketContent,
        factura,
      });

      // Enviar a imprimir
      await qz.print(config);

      return true;
    } catch (error) {
      console.error("Error al imprimir la factura:", error);
      throw error;
    }
  },

  // Cerrar la conexión con qz-tray
  closeConnection: async () => {
    try {
      if (qz.websocket.isActive()) {
        await qz.websocket.disconnect();
      }
    } catch (error) {
      console.error("Error al cerrar la conexión con qz-tray:", error);
      throw error;
    }
  },
};
