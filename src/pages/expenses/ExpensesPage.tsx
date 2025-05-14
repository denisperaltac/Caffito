import React, { useState, useEffect, useRef } from "react";
import { expensesService, Gasto } from "../../services/expensesService";
import { Pagination } from "../../components/common/Pagination";
import Loader from "../../components/common/Loader";
import { FaPlus, FaSearch } from "react-icons/fa";
import ExpenseModal from "../../components/expenses/ExpenseModal";
import { ExpensesTable } from "../../components/expenses/ExpensesTable";

const ITEMS_PER_PAGE = 10;

type SortField = "id" | "name" | "monto" | "fecha" | "pagado";
type SortDirection = "asc" | "desc";

const ExpensesPage: React.FC = () => {
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [sortField, setSortField] = useState<SortField>("id");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedGasto, setSelectedGasto] = useState<Gasto | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    loadGastos();
  }, [currentPage, sortField, sortDirection, searchTerm]);

  const loadGastos = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        size: ITEMS_PER_PAGE,
        sort: `${sortField},${sortDirection}`,
        name: searchTerm || undefined,
      };

      const [gastosData, count] = await Promise.all([
        expensesService.getGastos(params),
        expensesService.getCountGastos({ name: searchTerm || undefined }),
      ]);

      setGastos(gastosData);
      setTotalItems(count);
      setTotalPages(Math.ceil(count / ITEMS_PER_PAGE));
      setError(null);
    } catch (err) {
      setError("Error al cargar los gastos");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setSearchTerm(value);
      setCurrentPage(0);
    }, 300);
  };

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleDelete = async (id: number | undefined) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este gasto?")) {
      try {
        if (id) {
          await expensesService.deleteGasto(id);
          loadGastos();
        }
      } catch (error) {
        console.error("Error al eliminar el gasto:", error);
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Gastos</h1>
        <button
          onClick={() => {
            setSelectedGasto(null);
            setShowModal(true);
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 flex items-center gap-2"
        >
          <FaPlus /> Nuevo Gasto
        </button>
      </div>

      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar gastos..."
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full px-4 py-2 pl-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader size="lg" />
          </div>
        ) : Array.isArray(gastos) && gastos.length > 0 ? (
          <ExpensesTable
            gastos={gastos}
            handleSort={handleSort}
            handleDelete={handleDelete}
            setSelectedGasto={setSelectedGasto}
            setShowModal={setShowModal}
          />
        ) : (
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-500">No hay gastos disponibles</p>
          </div>
        )}
      </div>

      {Array.isArray(gastos) && gastos.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          setCurrentPage={setCurrentPage}
          items={gastos}
          totalItems={totalItems}
        />
      )}

      <ExpenseModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={loadGastos}
        expense={selectedGasto}
      />
    </div>
  );
};

export default ExpensesPage;
