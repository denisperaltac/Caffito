import React, { useState, useEffect } from "react";
import { cajaService, Caja } from "../../services/cajaService";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import axiosInstance from "../../config/axiosConfig";
import { API_URL } from "../../constants/api";
import CashierDetailsModal from "../../components/cash/CashierDetailsModal";
import CashierMovementsModal from "../../components/cash/CashierMovementsModal";
import CashierTable from "../../components/cash/CashierTable";
import Loader from "../../components/common/Loader";

const ITEMS_PER_PAGE = 8;

const CashierClosuresPage: React.FC = () => {
  const [cajas, setCajas] = useState<Caja[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedCaja, setSelectedCaja] = useState<Caja | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showMovementsModal, setShowMovementsModal] = useState(false);

  useEffect(() => {
    loadCajas();
  }, [currentPage]);

  const loadCajas = async () => {
    try {
      setLoading(true);
      const [cajasData, count] = await Promise.all([
        cajaService.getCajas({
          page: currentPage,
          size: ITEMS_PER_PAGE,
        }),
        cajaService.getCajasCount(),
      ]);
      setCajas(cajasData);
      setTotalItems(count);
      setError(null);
    } catch (err) {
      setError("Error al cargar los cierres de caja");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < Math.ceil(totalItems / ITEMS_PER_PAGE)) {
      setCurrentPage(newPage);
    }
  };

  const handleView = async (caja: Caja) => {
    try {
      const response = await axiosInstance.get<Caja>(
        `${API_URL}/cajas/${caja.id}`
      );
      setSelectedCaja(response.data);
      setShowDetailsModal(true);
    } catch (error) {
      console.error("Error al cargar los detalles de la caja:", error);
    }
  };

  const handleMovements = (caja: Caja) => {
    setSelectedCaja(caja);
    setShowMovementsModal(true);
  };

  const handleDelete = async (caja: Caja) => {
    if (
      window.confirm(`¿Estás seguro de que deseas eliminar la caja ${caja.id}?`)
    ) {
      try {
        // TODO: Implementar eliminación de caja
        console.log("Eliminar caja:", caja.id);
        await loadCajas(); // Recargar la lista después de eliminar
      } catch (error) {
        console.error("Error al eliminar la caja:", error);
      }
    }
  };

  const renderPagination = () => {
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(0, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(0, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-1 rounded-md ${
            currentPage === i
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
        >
          {i + 1}
        </button>
      );
    }

    return (
      <div className="flex items-center justify-center space-x-2 mt-4">
        <button
          onClick={() => handlePageChange(0)}
          disabled={currentPage === 0}
          className="p-2 rounded-md bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="w-4 h-4">
            <FaChevronLeft />
          </span>
        </button>
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 0}
          className="p-2 rounded-md bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Anterior
        </button>
        {startPage > 0 && (
          <>
            <button
              onClick={() => handlePageChange(0)}
              className="px-3 py-1 rounded-md bg-white text-gray-700 hover:bg-gray-100"
            >
              1
            </button>
            {startPage > 1 && <span className="px-2">...</span>}
          </>
        )}
        {pages}
        {endPage < totalPages - 1 && (
          <>
            {endPage < totalPages - 2 && <span className="px-2">...</span>}
            <button
              onClick={() => handlePageChange(totalPages - 1)}
              className="px-3 py-1 rounded-md bg-white text-gray-700 hover:bg-gray-100"
            >
              {totalPages}
            </button>
          </>
        )}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages - 1}
          className="p-2 rounded-md bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Siguiente
        </button>
        <button
          onClick={() => handlePageChange(totalPages - 1)}
          disabled={currentPage === totalPages - 1}
          className="p-2 rounded-md bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="w-4 h-4">
            <FaChevronRight />
          </span>
        </button>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="container px-4 w-[100vw]">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Cierres de Caja</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg overflow-hidden w-[95vw]">
        <CashierTable
          cajas={cajas}
          onView={handleView}
          onMovements={handleMovements}
          onDelete={handleDelete}
        />
      </div>

      {renderPagination()}
      <div className="text-center text-sm text-gray-500 mt-2">
        Mostrando {cajas?.length} de {totalItems} cierres
      </div>

      {showDetailsModal && selectedCaja && (
        <CashierDetailsModal
          caja={selectedCaja}
          onClose={() => setShowDetailsModal(false)}
        />
      )}

      {showMovementsModal && selectedCaja && (
        <CashierMovementsModal
          caja={selectedCaja}
          onClose={() => setShowMovementsModal(false)}
        />
      )}
    </div>
  );
};

export default CashierClosuresPage;
