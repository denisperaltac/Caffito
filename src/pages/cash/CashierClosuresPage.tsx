import React, { useState, useEffect } from "react";
import { cajaService, Caja, CierreCajaItem } from "../../services/cajaService";
import { FaChevronLeft, FaChevronRight, FaDollarSign } from "react-icons/fa";
import axiosInstance from "../../config/axiosConfig";
import { API_URL } from "../../constants/api";
import CashierDetailsModal from "../../components/cash/CashierDetailsModal";
import CashierMovementsModal from "../../components/cash/CashierMovementsModal";
import CashierTable from "../../components/cash/CashierTable";
import Loader from "../../components/common/Loader";
import ClosuresModal from "../../components/cash/ClosuresModal";
import { Button } from "../../components/common/Button";

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
  const [currentCaja, setCurrentCaja] = useState<Caja | null>(null);
  const [showOpenModal, setShowOpenModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [initialAmount, setInitialAmount] = useState<number>(0);
  const [closingAmount, setClosingAmount] = useState<number>(0);

  useEffect(() => {
    loadCajas();
    checkCurrentCaja();
  }, [currentPage]);

  const checkCurrentCaja = async () => {
    try {
      const caja = await cajaService.getCurrentCaja();
      setCurrentCaja(caja);
    } catch (error) {
      console.error("Error al verificar la caja actual:", error);
    }
  };

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

  const handleOpenCaja = async () => {
    try {
      if (initialAmount < 0) {
        setError("El monto inicial no puede ser negativo");
        return;
      }
      await cajaService.openCaja(initialAmount);
      setShowOpenModal(false);
      setInitialAmount(0);
      await checkCurrentCaja();
      await loadCajas();
    } catch (error) {
      setError("Error al abrir la caja");
      console.error(error);
    }
  };

  const handleCloseCaja = async (items: CierreCajaItem[]) => {
    try {
      if (!currentCaja) return;
      await cajaService.closeCaja(items);
      setShowCloseModal(false);
      setClosingAmount(0);
      await checkCurrentCaja();
      await loadCajas();
    } catch (error) {
      setError("Error al cerrar la caja");
      console.error(error);
    }
  };

  // ✅ Función para actualizar la caja cuando se abre el modal
  const handleOpenCloseModal = async () => {
    await checkCurrentCaja(); // Actualizar caja antes de abrir el modal
    setShowCloseModal(true);
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
    <div className="container min-w-full">
      <div className="flex justify-between items-center mb-6 w-full">
        <h1 className="text-2xl font-bold text-gray-800">Cierres de Caja</h1>
        <div>
          {!currentCaja ? (
            <Button
              color="green"
              text="Abrir Caja"
              onClick={() => setShowOpenModal(true)}
            />
          ) : (
            <Button color="blue" onClick={handleOpenCloseModal}>
              Cerrar Caja
            </Button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg max-h-[65vh] overflow-auto w-full">
        <CashierTable
          cajas={cajas}
          onView={handleView}
          onMovements={handleMovements}
          onDelete={handleDelete}
        />
      </div>

      {renderPagination()}
      <div className="text-center text-sm text-gray-500 ">
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

      {/* Open Caja Modal */}
      {showOpenModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-xl font-bold mb-4">Abrir Caja</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monto Inicial
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaDollarSign className="text-gray-500" />
                </div>
                <input
                  type="number"
                  value={initialAmount || ""}
                  onChange={(e) => setInitialAmount(Number(e.target.value))}
                  className="w-full pl-8 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowOpenModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancelar
              </button>
              <button
                onClick={handleOpenCaja}
                disabled={initialAmount < 0}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Abrir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Close Caja Modal */}
      {showCloseModal && (
        <ClosuresModal
          closingAmount={closingAmount}
          setClosingAmount={setClosingAmount}
          handleCloseCaja={handleCloseCaja}
          showCloseModal={showCloseModal}
          setShowCloseModal={setShowCloseModal}
          currentCaja={currentCaja}
        />
      )}
    </div>
  );
};

export default CashierClosuresPage;
