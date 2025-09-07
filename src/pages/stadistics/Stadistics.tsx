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
import { Bar, Pie } from "react-chartjs-2";
import {
  statisticsService,
  IncomeSummaryData,
  ExpenseSummaryData,
} from "../../services/statisticsService";
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

type TabType = "balance" | "ingresos" | "gastos";
type ViewType = "day" | "week" | "month" | "year";

const Stadistics: React.FC = () => {
  const [incomeData, setIncomeData] = useState<IncomeSummaryData | null>(null);
  const [expenseData, setExpenseData] = useState<ExpenseSummaryData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("balance");
  const [viewType, setViewType] = useState<ViewType>("year");

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
  const [selectedYear, setSelectedYear] = useState(
    new Date().getFullYear().toString()
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

  useEffect(() => {
    // Cargar datos iniciales y actualizar cuando cambien las fechas
    fetchData();
  }, [
    viewType,
    selectedDate,
    selectedWeek,
    selectedMonth,
    selectedYear,
    selectedYearForView,
  ]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const dateRange = getDateRange();
      const [income, expense] = await Promise.all([
        statisticsService.getIncomeSummary(
          dateRange.startDate,
          dateRange.endDate
        ),
        statisticsService.getExpenseSummary(
          dateRange.startDate,
          dateRange.endDate
        ),
      ]);
      setIncomeData(income);
      setExpenseData(expense);
    } catch (err) {
      setError("Error al cargar las estadísticas");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewTypeChange = (type: ViewType) => {
    setViewType(type);
  };

  const handleTodayClick = () => {
    const today = new Date();
    setSelectedDate(today.toISOString().split("T")[0]);
    setSelectedWeek(getStartOfWeek(today).toISOString().split("T")[0]);
    setSelectedMonth(
      today.getFullYear() + "-" + String(today.getMonth() + 1).padStart(2, "0")
    );
    setSelectedYear(today.getFullYear().toString());
    setSelectedYearForView(today.getFullYear().toString());
  };

  const handlePreviousClick = () => {
    switch (viewType) {
      case "day":
        const prevDay = new Date(selectedDate);
        prevDay.setDate(prevDay.getDate() - 1);
        setSelectedDate(prevDay.toISOString().split("T")[0]);
        break;
      case "week":
        const prevWeek = new Date(selectedWeek);
        prevWeek.setDate(prevWeek.getDate() - 7);
        setSelectedWeek(prevWeek.toISOString().split("T")[0]);
        break;
      case "month":
        const [year, month] = selectedMonth.split("-").map(Number);
        const prevMonth = new Date(year, month - 2, 1);
        setSelectedMonth(
          prevMonth.getFullYear() +
            "-" +
            String(prevMonth.getMonth() + 1).padStart(2, "0")
        );
        setSelectedYear(prevMonth.getFullYear().toString());
        break;
      case "year":
        const prevYear = parseInt(selectedYearForView) - 1;
        setSelectedYearForView(prevYear.toString());
        break;
    }
  };

  const handleNextClick = () => {
    switch (viewType) {
      case "day":
        const nextDay = new Date(selectedDate);
        nextDay.setDate(nextDay.getDate() + 1);
        setSelectedDate(nextDay.toISOString().split("T")[0]);
        break;
      case "week":
        const nextWeek = new Date(selectedWeek);
        nextWeek.setDate(nextWeek.getDate() + 7);
        setSelectedWeek(nextWeek.toISOString().split("T")[0]);
        break;
      case "month":
        const [year, month] = selectedMonth.split("-").map(Number);
        const nextMonth = new Date(year, month, 1);
        setSelectedMonth(
          nextMonth.getFullYear() +
            "-" +
            String(nextMonth.getMonth() + 1).padStart(2, "0")
        );
        setSelectedYear(nextMonth.getFullYear().toString());
        break;
      case "year":
        const nextYear = parseInt(selectedYearForView) + 1;
        setSelectedYearForView(nextYear.toString());
        break;
    }
  };

  const formatDisplayDate = (): string => {
    switch (viewType) {
      case "day":
        const dayDate = new Date(selectedDate);
        return dayDate
          .toLocaleDateString("es-ES", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })
          .toUpperCase();
      case "week":
        const weekStart = getStartOfWeek(new Date(selectedWeek));
        const weekEnd = getEndOfWeek(new Date(selectedWeek));
        return `${weekStart.toLocaleDateString("es-ES", {
          day: "numeric",
          month: "short",
        })} - ${weekEnd.toLocaleDateString("es-ES", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}`.toUpperCase();
      case "month":
        const [year, month] = selectedMonth.split("-").map(Number);
        const monthDate = new Date(year, month - 1, 1);
        return monthDate
          .toLocaleDateString("es-ES", {
            month: "long",
            year: "numeric",
          })
          .toUpperCase();
      case "year":
        return selectedYearForView.toUpperCase();
      default:
        return "";
    }
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
  };

  const formatMonth = (mes: number, anio: number) => {
    const date = new Date(anio, mes - 1);
    return date.toLocaleString("es-ES", { month: "long", year: "numeric" });
  };

  const createBarChartData = (
    data: IncomeSummaryData | ExpenseSummaryData | null,
    type: "income" | "expense"
  ) => {
    if (!data) return null;

    const monthData =
      type === "income"
        ? (data as IncomeSummaryData).ingresosPorMes
        : (data as ExpenseSummaryData).gastosPorMes;

    return {
      labels: monthData.map((item) => formatMonth(item.mes, item.anio)),
      datasets: [
        {
          label: "Monto",
          data: monthData.map((item) => item.total),
          backgroundColor:
            type === "income"
              ? "rgba(75, 192, 192, 0.6)"
              : "rgba(255, 99, 132, 0.6)",
          borderColor:
            type === "income"
              ? "rgba(75, 192, 192, 1)"
              : "rgba(255, 99, 132, 1)",
          borderWidth: 1,
        },
      ],
    };
  };

  const createPieChartData = (
    data: IncomeSummaryData | ExpenseSummaryData | null,
    type: "income" | "expense"
  ) => {
    if (!data) return null;

    if (type === "income") {
      const incomeData = data as IncomeSummaryData;
      return {
        labels: incomeData.ingresosPorCategoria.map((item) =>
          item.categoriaNombre.trim()
        ),
        datasets: [
          {
            data: incomeData.ingresosPorCategoria.map((item) => item.total),
            backgroundColor: [
              "rgba(255, 99, 132, 0.6)",
              "rgba(54, 162, 235, 0.6)",
              "rgba(255, 206, 86, 0.6)",
              "rgba(75, 192, 192, 0.6)",
              "rgba(153, 102, 255, 0.6)",
            ],
            borderColor: [
              "rgba(255, 99, 132, 1)",
              "rgba(54, 162, 235, 1)",
              "rgba(255, 206, 86, 1)",
              "rgba(75, 192, 192, 1)",
              "rgba(153, 102, 255, 1)",
            ],
            borderWidth: 1,
          },
        ],
      };
    }

    // For expenses, keep the existing logic
    const categoryData = (data as ExpenseSummaryData).gastosPorCategoria;
    return {
      labels: categoryData.map((item) => item.categoriaNombre.trim()),
      datasets: [
        {
          data: categoryData.map((item) => item.total),
          backgroundColor: [
            "rgba(255, 99, 132, 0.6)",
            "rgba(54, 162, 235, 0.6)",
            "rgba(255, 206, 86, 0.6)",
            "rgba(75, 192, 192, 0.6)",
            "rgba(153, 102, 255, 0.6)",
          ],
          borderColor: [
            "rgba(255, 99, 132, 1)",
            "rgba(54, 162, 235, 1)",
            "rgba(255, 206, 86, 1)",
            "rgba(75, 192, 192, 1)",
            "rgba(153, 102, 255, 1)",
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  const createProductCategoryPieData = (data: IncomeSummaryData | null) => {
    if (!data) return null;

    return {
      labels: data.ingresosPorCategoriaProducto.map((item) =>
        item.categoriaNombre.trim()
      ),
      datasets: [
        {
          data: data.ingresosPorCategoriaProducto.map((item) => item.total),
          backgroundColor: [
            "rgba(255, 99, 132, 0.6)",
            "rgba(54, 162, 235, 0.6)",
            "rgba(255, 206, 86, 0.6)",
            "rgba(75, 192, 192, 0.6)",
            "rgba(153, 102, 255, 0.6)",
            "rgba(255, 159, 64, 0.6)",
          ],
          borderColor: [
            "rgba(255, 99, 132, 1)",
            "rgba(54, 162, 235, 1)",
            "rgba(255, 206, 86, 1)",
            "rgba(75, 192, 192, 1)",
            "rgba(153, 102, 255, 1)",
            "rgba(255, 159, 64, 1)",
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  const calculateBalance = () => {
    if (!incomeData || !expenseData) return 0;
    return incomeData.totalIngresos - expenseData.totalGastos;
  };

  const createMonthlyBalanceData = () => {
    if (!incomeData || !expenseData) return null;

    const incomeByMonth = new Map<string, number>();
    const expenseByMonth = new Map<string, number>();

    // Process income data
    incomeData.ingresosPorMes.forEach((item) => {
      const key = `${item.anio}-${item.mes.toString().padStart(2, "0")}`;
      incomeByMonth.set(key, item.total);
    });

    // Process expense data
    expenseData.gastosPorMes.forEach((item) => {
      const key = `${item.anio}-${item.mes.toString().padStart(2, "0")}`;
      expenseByMonth.set(key, item.total);
    });

    // Get all unique months
    const allMonths = Array.from(
      new Set([...incomeByMonth.keys(), ...expenseByMonth.keys()])
    ).sort();

    return {
      labels: allMonths.map((month) => {
        const [year, monthNum] = month.split("-");
        return formatMonth(parseInt(monthNum), parseInt(year));
      }),
      datasets: [
        {
          label: "Balance",
          data: allMonths.map((month) => {
            const income = incomeByMonth.get(month) || 0;
            const expense = expenseByMonth.get(month) || 0;
            return income - expense;
          }),
          backgroundColor: "rgba(54, 162, 235, 0.6)",
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 1,
        },
      ],
    };
  };

  const createCategoryBalanceData = () => {
    if (!incomeData || !expenseData) return null;

    const categories = [
      "ALMACEN",
      "LACTEOS",
      "PANIFICACION",
      "VERDULERIA",
      "CARNICERIA",
      "FIAMBRERIA",
    ];

    const categoryBalances = categories.map((category) => {
      const income =
        incomeData.ingresosPorCategoriaProducto.find(
          (item) => item.categoriaNombre.trim() === category
        )?.total || 0;

      const expense =
        expenseData.gastosPorCategoria.find(
          (item) => item.categoriaNombre.trim() === category
        )?.total || 0;

      return {
        category,
        balance: income - expense,
      };
    });

    return {
      labels: categoryBalances.map((item) => item.category),
      datasets: [
        {
          data: categoryBalances.map((item) => item.balance),
          backgroundColor: [
            "rgba(255, 99, 132, 0.6)",
            "rgba(54, 162, 235, 0.6)",
            "rgba(255, 206, 86, 0.6)",
            "rgba(75, 192, 192, 0.6)",
            "rgba(153, 102, 255, 0.6)",
            "rgba(255, 159, 64, 0.6)",
          ],
          borderColor: [
            "rgba(255, 99, 132, 1)",
            "rgba(54, 162, 235, 1)",
            "rgba(255, 206, 86, 1)",
            "rgba(75, 192, 192, 1)",
            "rgba(153, 102, 255, 1)",
            "rgba(255, 159, 64, 1)",
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  if (loading) {
    return (
      <div className="col-span-full flex justify-center items-center mt-40">
        <Loader size="lg" />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  const balance = calculateBalance();

  return (
    <div className="w-full h-[calc(100vh-8rem)]">
      {/* Header with Date Controls */}
      <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex items-center space-x-2">
            {/* Botones de navegación */}
            <div className="flex items-center space-x-2">
              <Button color="blue" text="Hoy" onClick={handleTodayClick} />
              <Button
                color="gray"
                onClick={handlePreviousClick}
                size="h-[36px] w-[36px]"
                padding="px-0 py-0"
              >
                <FaArrowLeft />
              </Button>
              {/* Texto de fecha actual según el tipo de vista */}
              <div className="flex items-center">
                <span className="text-gray-700 font-medium text-lg">
                  {formatDisplayDate()}
                </span>
              </div>
              <Button
                color="gray"
                onClick={handleNextClick}
                size="h-[36px] w-[36px]"
                padding="px-0 py-0"
              >
                <FaArrowRight size={18} />
              </Button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Tipo de vista */}
            <SelectInput
              name="viewType"
              value={viewType}
              options={[
                { label: "Diario", value: "day" },
                { label: "Semanal", value: "week" },
                { label: "Mensual", value: "month" },
                { label: "Anual", value: "year" },
              ]}
              onChange={(value) => handleViewTypeChange(value as ViewType)}
              width="w-32"
              margin="mb-0"
            />
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-green-50 rounded-lg">
            <h3 className="text-lg font-medium text-green-800">
              Total Ingresos
            </h3>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(incomeData?.totalIngresos ?? 0)}
            </p>
          </div>
          <div className="p-4 bg-red-50 rounded-lg">
            <h3 className="text-lg font-medium text-red-800">Total Gastos</h3>
            <p className="text-2xl font-bold text-red-600">
              {formatCurrency(expenseData?.totalGastos ?? 0)}
            </p>
          </div>
          <div
            className={`p-4 rounded-lg ${
              balance >= 0 ? "bg-blue-50" : "bg-orange-50"
            }`}
          >
            <h3
              className={`text-lg font-medium ${
                balance >= 0 ? "text-blue-800" : "text-orange-800"
              }`}
            >
              Balance Neto
            </h3>
            <p
              className={`text-2xl font-bold ${
                balance >= 0 ? "text-blue-600" : "text-orange-600"
              }`}
            >
              {formatCurrency(balance)}
            </p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-lg mb-8 h-[70%]">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            <button
              onClick={() => handleTabChange("balance")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "balance"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Balance
            </button>
            <button
              onClick={() => handleTabChange("ingresos")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "ingresos"
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Ingresos
            </button>
            <button
              onClick={() => handleTabChange("gastos")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "gastos"
                  ? "border-red-500 text-red-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Gastos
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto min-h-[85%]">
          {/* Balance Tab */}
          {activeTab === "balance" && (
            <div
              className={`grid gap-8 ${
                viewType === "year"
                  ? "grid-cols-1 md:grid-cols-2"
                  : "grid-cols-1"
              }`}
            >
              {viewType === "year" && (
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h2 className="text-2xl font-semibold mb-4">
                    Balance por Mes
                  </h2>
                  {incomeData && expenseData && (
                    <div className="h-64">
                      <Bar
                        data={createMonthlyBalanceData()!}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              display: false,
                            },
                            tooltip: {
                              callbacks: {
                                label: function (context) {
                                  return `Balance: ${formatCurrency(
                                    context.raw as number
                                  )}`;
                                },
                              },
                            },
                          },
                          scales: {
                            y: {
                              ticks: {
                                callback: function (value) {
                                  return formatCurrency(value as number);
                                },
                              },
                            },
                          },
                        }}
                      />
                    </div>
                  )}
                </div>
              )}

              <div className="bg-gray-50 p-6 rounded-lg">
                <h2 className="text-2xl font-semibold mb-4">
                  Balance por Categoría
                </h2>
                {incomeData && expenseData && (
                  <div className="h-64">
                    <Pie
                      data={createCategoryBalanceData()!}
                      options={{
                        responsive: true,
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
                )}
              </div>
            </div>
          )}

          {/* Ingresos Tab */}
          {activeTab === "ingresos" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-4">Por Mes</h3>
                {incomeData && (
                  <div className="h-48 w-full">
                    <Bar
                      data={createBarChartData(incomeData, "income")!}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            display: false,
                          },
                          tooltip: {
                            callbacks: {
                              label: function (context) {
                                return `Total: ${formatCurrency(
                                  context.raw as number
                                )}`;
                              },
                            },
                          },
                        },
                        scales: {
                          y: {
                            ticks: {
                              callback: function (value) {
                                return formatCurrency(value as number);
                              },
                            },
                          },
                        },
                      }}
                    />
                  </div>
                )}
                <p className="text-3xl font-bold text-green-600 mt-4 text-center">
                  {formatCurrency(incomeData?.totalIngresos ?? 0)}
                </p>
              </div>

              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-4">
                  Por Forma de Pago
                </h3>
                {incomeData && (
                  <div className="h-48">
                    <Pie
                      data={createPieChartData(incomeData, "income")!}
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
                )}
              </div>

              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-4">
                  Por Categoría de Producto
                </h3>
                {incomeData && (
                  <div className="h-48">
                    <Pie
                      data={createProductCategoryPieData(incomeData)!}
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
                )}
              </div>
            </div>
          )}

          {/* Gastos Tab */}
          {activeTab === "gastos" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-red-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-4">Por Mes</h3>
                {expenseData && (
                  <div className="h-48">
                    <Bar
                      data={createBarChartData(expenseData, "expense")!}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            display: false,
                          },
                          tooltip: {
                            callbacks: {
                              label: function (context) {
                                return `Total: ${formatCurrency(
                                  context.raw as number
                                )}`;
                              },
                            },
                          },
                        },
                        scales: {
                          y: {
                            ticks: {
                              callback: function (value) {
                                return formatCurrency(value as number);
                              },
                            },
                          },
                        },
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="bg-red-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-4">Por Categoría</h3>
                {expenseData && (
                  <div className="h-48">
                    <Pie
                      data={createPieChartData(expenseData, "expense")!}
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
                )}
              </div>

              <div className="bg-red-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-4">Total</h3>
                <div className="flex items-center justify-center h-full">
                  <p className="text-3xl font-bold text-red-600">
                    {formatCurrency(expenseData?.totalGastos ?? 0)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Stadistics;
