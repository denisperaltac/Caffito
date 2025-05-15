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
} from "../services/statisticsService";
import Loader from "../components/common/Loader";
import { formatCurrency } from "../utils/formatters";

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

const Statistics: React.FC = () => {
  const [incomeData, setIncomeData] = useState<IncomeSummaryData | null>(null);
  const [expenseData, setExpenseData] = useState<ExpenseSummaryData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  const fetchData = async () => {
    try {
      setLoading(true);
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

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDateRange((prev) => ({
      ...prev,
      [name]: value,
    }));
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
    <div className="w-full">
      {/* Balance Card */}
      <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
        <h1 className="text-3xl font-bold mb-4">Estadísticas</h1>
        <div className="flex flex-col md:flex-row gap-4 items-end mb-4">
          <div className="flex-1">
            <label
              htmlFor="startDate"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Fecha Inicio
            </label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={dateRange.startDate}
              onChange={handleDateChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="flex-1">
            <label
              htmlFor="endDate"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Fecha Fin
            </label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={dateRange.endDate}
              onChange={handleDateChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Balance por Mes */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Balance por Mes</h2>
          {incomeData && expenseData && (
            <Bar
              data={createMonthlyBalanceData()!}
              options={{
                responsive: true,
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
          )}
        </div>

        {/* Balance por Categoría */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Balance por Categoría</h2>
          {incomeData && expenseData && (
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
          )}
        </div>

        {/* Ingresos Section */}
        <div className="col-span-full">
          <h2 className="text-2xl font-semibold mb-4">Ingresos</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Ingresos por Mes */}
            <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center justify-center">
              <h3 className="text-xl font-semibold mb-4">Por Mes</h3>
              {incomeData && (
                <Bar
                  data={createBarChartData(incomeData, "income")!}
                  options={{
                    responsive: true,
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
              )}
              <p className="text-3xl font-bold text-green-600">
                {formatCurrency(incomeData?.totalIngresos ?? 0)}
              </p>
            </div>

            {/* Ingresos por Forma de Pago */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold mb-4">Por Forma de Pago</h3>
              {incomeData && (
                <Pie
                  data={createPieChartData(incomeData, "income")!}
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
              )}
            </div>

            {/* Ingresos por Categoría de Producto */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold mb-4">
                Por Categoría de Producto
              </h3>
              {incomeData && (
                <Pie
                  data={createProductCategoryPieData(incomeData)!}
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
              )}
            </div>
          </div>
        </div>

        {/* Gastos Section */}
        <div className="col-span-full">
          <h2 className="text-2xl font-semibold mb-4">Gastos</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Gastos por Mes */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold mb-4">Por Mes</h3>
              {expenseData && (
                <Bar
                  data={createBarChartData(expenseData, "expense")!}
                  options={{
                    responsive: true,
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
              )}
            </div>

            {/* Gastos por Categoría */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold mb-4">Por Categoría</h3>
              {expenseData && (
                <Pie
                  data={createPieChartData(expenseData, "expense")!}
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
              )}
            </div>

            {/* Total Gastos */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold mb-4">Total</h3>
              <div className="flex items-center justify-center h-full">
                <p className="text-3xl font-bold text-red-600">
                  {formatCurrency(expenseData?.totalGastos ?? 0)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
