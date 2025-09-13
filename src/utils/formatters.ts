export const formatCurrency = (value: number): string => {
  const formatted = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
    .format(value)
    .replace("ARS", "")
    .trim();

  // ✅ Mover el signo negativo después del símbolo de peso
  if (formatted.startsWith("-$")) {
    return formatted.replace("-$", "$ -");
  }

  return formatted;
};

export const formatDate = (date: Date | string): string => {
  const d = new Date(date);
  return new Intl.DateTimeFormat("es-AR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
};
