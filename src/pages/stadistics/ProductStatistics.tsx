import React, { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Pie } from "react-chartjs-2";
import productSummaryService from "../../services/productSummaryService";
import {
  ProductSummaryData,
  ProductSummaryFilters,
} from "../../types/productSummary";
import { Category } from "../../types/inventory";
import Loader from "../../components/common/Loader";
import { formatCurrency } from "../../utils/formatters";
import SelectInput from "../../components/common/SelectInput";
import { Button } from "../../components/common/Button";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

// Registrar los componentes necesarios de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

type ViewType = "day" | "week" | "month" | "year";

const ProductStatistics: React.FC = () => {
  const [productData, setProductData] = useState<ProductSummaryData | null>(
    null
  );
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewType, setViewType] = useState<ViewType>("year");

  // Product filters
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>(
    undefined
  );
  const [orderBy, setOrderBy] = useState<"cantidad" | "ingreso">("cantidad");
  const [productLimit, setProductLimit] = useState<number>(10);

  // Date state for different view types
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  // Helper function to get start of week (Monday)
  function getStartOfWeek(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    return new Date(d.setDate(diff));
  }

  // Helper function to get end of week (Sunday)
  function getEndOfWeek(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? 0 : 7); // Adjust when day is Sunday
    return new Date(d.setDate(diff));
  }

  // Helper function to get start and end of month
  function getMonthRange(
    year: number,
    month: number
  ): { start: Date; end: Date } {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0);
    return { start, end };
  }

  const [selectedWeek, setSelectedWeek] = useState(
    getStartOfWeek(new Date()).toISOString().split("T")[0]
  );
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().getFullYear() +
      "-" +
      String(new Date().getMonth() + 1).padStart(2, "0")
  );
  const [selectedYearForView, setSelectedYearForView] = useState(
    new Date().getFullYear().toString()
  );

  const getDateRange = (): { startDate: string; endDate: string } => {
    switch (viewType) {
      case "day":
        return {
          startDate: selectedDate,
          endDate: selectedDate,
        };
      case "week":
        const weekStart = getStartOfWeek(new Date(selectedWeek));
        const weekEnd = getEndOfWeek(new Date(selectedWeek));
        return {
          startDate: weekStart.toISOString().split("T")[0],
          endDate: weekEnd.toISOString().split("T")[0],
        };
      case "month":
        const [year, month] = selectedMonth.split("-").map(Number);
        const { start, end } = getMonthRange(year, month);
        return {
          startDate: start.toISOString().split("T")[0],
          endDate: end.toISOString().split("T")[0],
        };
      case "year":
        const yearNum = parseInt(selectedYearForView);
        const yearStart = new Date(yearNum, 0, 1); // 1 de enero
        const yearEnd = new Date(yearNum, 11, 31); // 31 de diciembre
        return {
          startDate: yearStart.toISOString().split("T")[0],
          endDate: yearEnd.toISOString().split("T")[0],
        };
      default:
        return {
          startDate: selectedDate,
          endDate: selectedDate,
        };
    }
  };

  const fetchProductData = async () => {
    try {
      setLoading(true);
      const { startDate, endDate } = getDateRange();

      const filters: ProductSummaryFilters = {
        fechaInicio: startDate,
        fechaFin: endDate,
        categoriaId: selectedCategory,
        orderBy,
        limit: productLimit,
      };

      const [productSummary, categoriesData] = await Promise.all([
        productSummaryService.getProductSummary(filters),
        productSummaryService.getCategories(),
      ]);

      setProductData(productSummary);
      setCategories(categoriesData);
      setError(null);
    } catch (err) {
      console.error("Error fetching product data:", err);
      setError("Error al cargar los datos de productos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductData();
  }, [
    viewType,
    selectedDate,
    selectedWeek,
    selectedMonth,
    selectedYearForView,
    selectedCategory,
    orderBy,
    productLimit,
  ]);

  const handleViewTypeChange = (newViewType: ViewType) => {
    setViewType(newViewType);
  };

  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate);
  };

  const handleWeekChange = (newWeek: string) => {
    setSelectedWeek(newWeek);
  };

  const handleMonthChange = (newMonth: string) => {
    setSelectedMonth(newMonth);
  };

  const handleYearChange = (newYear: string) => {
    setSelectedYearForView(newYear);
  };

  const navigateDate = (direction: "prev" | "next") => {
    let newDate: Date;

    switch (viewType) {
      case "day":
        newDate = new Date(selectedDate);
        newDate.setDate(newDate.getDate() + (direction === "next" ? 1 : -1));
        setSelectedDate(newDate.toISOString().split("T")[0]);
        break;
      case "week":
        newDate = new Date(selectedWeek);
        newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7));
        setSelectedWeek(newDate.toISOString().split("T")[0]);
        break;
      case "month":
        const [year, month] = selectedMonth.split("-").map(Number);
        newDate = new Date(year, month - 1, 1);
        newDate.setMonth(newDate.getMonth() + (direction === "next" ? 1 : -1));
        setSelectedMonth(
          newDate.getFullYear() +
            "-" +
            String(newDate.getMonth() + 1).padStart(2, "0")
        );
        break;
      case "year":
        const currentYear = parseInt(selectedYearForView);
        setSelectedYearForView(
          (currentYear + (direction === "next" ? 1 : -1)).toString()
        );
        break;
    }
  };

  const getCurrentPeriodLabel = () => {
    switch (viewType) {
      case "day":
        return new Date(selectedDate).toLocaleDateString("es-ES", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      case "week":
        const weekStart = getStartOfWeek(new Date(selectedWeek));
        const weekEnd = getEndOfWeek(new Date(selectedWeek));
        return `${weekStart.toLocaleDateString("es-ES", {
          day: "numeric",
          month: "short",
        })} - ${weekEnd.toLocaleDateString("es-ES", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })}`;
      case "month":
        const [year, month] = selectedMonth.split("-").map(Number);
        return new Date(year, month - 1, 1).toLocaleDateString("es-ES", {
          year: "numeric",
          month: "long",
        });
      case "year":
        return selectedYearForView;
      default:
        return "";
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Error al cargar los datos
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Estadísticas de Productos
          </h1>
          <p className="mt-2 text-gray-600">
            Análisis de productos más vendidos y rendimiento por categoría
          </p>
        </div>

        {/* View Type Selector */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex flex-wrap gap-2">
                {(["day", "week", "month", "year"] as ViewType[]).map(
                  (type) => (
                    <Button
                      key={type}
                      onClick={() => handleViewTypeChange(type)}
                      color={viewType === type ? "purple" : "gray"}
                      size="sm"
                    >
                      {type === "day" && "Día"}
                      {type === "week" && "Semana"}
                      {type === "month" && "Mes"}
                      {type === "year" && "Año"}
                    </Button>
                  )
                )}
              </div>

              <div className="flex items-center gap-4">
                <Button
                  onClick={() => navigateDate("prev")}
                  color="gray"
                  size="sm"
                >
                  <FaArrowLeft className="w-4 h-4" />
                </Button>
                <span className="text-lg font-semibold text-gray-700">
                  {getCurrentPeriodLabel()}
                </span>
                <Button
                  onClick={() => navigateDate("next")}
                  color="gray"
                  size="sm"
                >
                  <FaArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Date/Time Selectors */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {viewType === "day" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => handleDateChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              {viewType === "week" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Semana
                  </label>
                  <input
                    type="date"
                    value={selectedWeek}
                    onChange={(e) => handleWeekChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              {viewType === "month" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mes
                  </label>
                  <input
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => handleMonthChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              {viewType === "year" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Año
                  </label>
                  <input
                    type="number"
                    value={selectedYearForView}
                    onChange={(e) => handleYearChange(e.target.value)}
                    min="2020"
                    max="2030"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Filtros para productos */}
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoría
                </label>
                <SelectInput
                  name="category"
                  value={selectedCategory?.toString() || ""}
                  options={[
                    { label: "Todas las categorías", value: "" },
                    ...categories.map((cat) => ({
                      label: cat.nombre,
                      value: cat.id.toString(),
                    })),
                  ]}
                  onChange={(value) =>
                    setSelectedCategory(value ? parseInt(value) : undefined)
                  }
                  width="w-full"
                  margin="mb-0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ordenar por
                </label>
                <SelectInput
                  name="orderBy"
                  value={orderBy}
                  options={[
                    { label: "Cantidad vendida", value: "cantidad" },
                    { label: "Ingreso generado", value: "ingreso" },
                  ]}
                  onChange={(value) =>
                    setOrderBy(value as "cantidad" | "ingreso")
                  }
                  width="w-full"
                  margin="mb-0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Límite de resultados
                </label>
                <SelectInput
                  name="limit"
                  value={productLimit.toString()}
                  options={[
                    { label: "5 productos", value: "5" },
                    { label: "10 productos", value: "10" },
                    { label: "20 productos", value: "20" },
                    { label: "50 productos", value: "50" },
                  ]}
                  onChange={(value) => setProductLimit(parseInt(value))}
                  width="w-full"
                  margin="mb-0"
                />
              </div>
            </div>
          </div>

          {/* Tabla de productos más vendidos */}
          <div className="bg-white border rounded-lg shadow-sm">
            <div className="p-4 border-b">
              <h3 className="text-xl font-semibold text-purple-800">
                Productos Más Vendidos
              </h3>
            </div>
            <div className="overflow-x-auto">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader />
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        #
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Producto
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Categoría
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cantidad Vendida
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ingreso Generado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Precio Promedio
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {productData?.productosMasVendidos.map(
                      (producto, index) => (
                        <tr
                          key={producto.productoId}
                          className={
                            index % 2 === 0 ? "bg-white" : "bg-gray-50"
                          }
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {index + 1}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {producto.productoNombre}
                              </div>
                              <div className="text-sm text-gray-500">
                                Código: {producto.productoCodigo}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {producto.categoriaNombre}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {producto.cantidadVendida.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(producto.ingresoGenerado)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(producto.precioPromedio)}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Resumen por categoría */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-purple-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-4 text-purple-800">
                Resumen por Categoría
              </h3>
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader />
                </div>
              ) : productData ? (
                <div className="h-64">
                  <Pie
                    data={{
                      labels: productData.productosPorCategoria.map(
                        (item) => item.categoriaNombre
                      ),
                      datasets: [
                        {
                          data: productData.productosPorCategoria.map(
                            (item) => item.totalIngreso
                          ),
                          backgroundColor: [
                            "rgba(147, 51, 234, 0.6)",
                            "rgba(79, 70, 229, 0.6)",
                            "rgba(99, 102, 241, 0.6)",
                            "rgba(129, 140, 248, 0.6)",
                            "rgba(165, 180, 252, 0.6)",
                          ],
                          borderColor: [
                            "rgba(147, 51, 234, 1)",
                            "rgba(79, 70, 229, 1)",
                            "rgba(99, 102, 241, 1)",
                            "rgba(129, 140, 248, 1)",
                            "rgba(165, 180, 252, 1)",
                          ],
                          borderWidth: 1,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: "right",
                        },
                        tooltip: {
                          callbacks: {
                            label: function (context) {
                              return `${context.label}: ${formatCurrency(
                                context.raw as number
                              )}`;
                            },
                          },
                        },
                      },
                    }}
                  />
                </div>
              ) : (
                <div className="flex justify-center items-center h-64 text-gray-500">
                  No hay datos disponibles
                </div>
              )}
            </div>

            <div className="bg-purple-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-4 text-purple-800">
                Top Categorías
              </h3>
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader />
                </div>
              ) : productData ? (
                <div className="space-y-3">
                  {productData.productosPorCategoria
                    .slice(0, 5)
                    .map((categoria) => (
                      <div
                        key={categoria.categoriaId}
                        className="flex justify-between items-center p-3 bg-white rounded-lg"
                      >
                        <div>
                          <div className="font-medium text-gray-900">
                            {categoria.categoriaNombre}
                          </div>
                          <div className="text-sm text-gray-500">
                            {categoria.cantidadProductos} productos
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-purple-600">
                            {formatCurrency(categoria.totalIngreso)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {categoria.totalVendido.toLocaleString()} unidades
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="flex justify-center items-center h-64 text-gray-500">
                  No hay datos disponibles
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductStatistics;
