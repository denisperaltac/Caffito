import React, { useState, useEffect, useRef } from "react";
import Loader from "../../components/common/Loader";
import {
  clientService,
  Cliente,
  GetClientesParams,
} from "../../services/clientService";
import { Pagination } from "../../components/common/Pagination";
import { TableClients } from "../../components/clients/TableClients";
import { Button } from "../../components/common/Button";
import { ModalAddClient } from "../../components/clients/ModalAddClient";

const ITEMS_PER_PAGE = 10;

type SortField =
  | "id"
  | "nombre"
  | "apellido"
  | "tipoDocumentoNombre"
  | "numeroDocumento"
  | "mayorista"
  | "empleado"
  | "activo";
type SortDirection = "asc" | "desc";

const ClientsPage: React.FC = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [sortField, setSortField] = useState<SortField>("id");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [openModal, setOpenModal] = useState(false);
  const [inputSearch, setInputSearch] = useState({
    apellido: "",
    nombre: "",
  });
  const [searchData, setSearchData] = useState({
    apellido: "",
    nombre: "",
  });

  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    loadClientes();
  }, [currentPage, sortField, sortDirection, searchData]);

  const loadClientes = async () => {
    try {
      setLoading(true);
      const params: GetClientesParams = {
        page: currentPage,
        size: ITEMS_PER_PAGE,
        sort: `${sortField},${sortDirection}`,
      };

      if (searchData.nombre) {
        params["nombre.contains"] = searchData.nombre;
      }
      if (searchData.apellido) {
        params["apellido.contains"] = searchData.apellido;
      }

      const [clientesData, count] = await Promise.all([
        clientService.getClientes(params),
        clientService.getCountClientes(),
      ]);

      setClientes(clientesData);
      setTotalItems(count);
      setTotalPages(Math.ceil(count / ITEMS_PER_PAGE));
      setError(null);
    } catch (err) {
      setError("Error al cargar los clientes");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoading(true);
    setInputSearch({ ...inputSearch, [name]: value });
    // Limpiar el timeout anterior si existe
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Establecer un nuevo timeout
    searchTimeoutRef.current = setTimeout(() => {
      setSearchData((prev) => ({ ...prev, [name]: value }));
    }, 500); // Reducido a 500ms para mejor experiencia de usuario
  };

  return (
    <div className="container  min-w-full">
      <div className="flex justify-between items-center mb-4 w-full">
        <h1 className="text-2xl font-bold text-gray-800">Clientes</h1>

        <div className="ml-8 flex gap-4 items-center w-full">
          <input
            type="text"
            name="nombre"
            placeholder="Nombre"
            value={inputSearch.nombre}
            onChange={handleSearch}
            className="w-[250px] px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-['Poppins']"
          />

          <input
            type="text"
            name="apellido"
            placeholder="Apellido"
            value={inputSearch.apellido}
            onChange={handleSearch}
            className="w-[250px] px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-['Poppins']"
          />
        </div>
        <Button
          text="Agregar Cliente"
          color="blue"
          size="w-[200px]"
          onClick={() => {
            setOpenModal(true);
          }}
        />
      </div>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader size="lg" />
        </div>
      ) : (
        <>
          <TableClients
            loadClientes={loadClientes}
            sortDirection={sortDirection}
            sortField={sortField}
            setSortField={(field: string) => setSortField(field as SortField)}
            setSortDirection={(direction: string) =>
              setSortDirection(direction as SortDirection)
            }
            clientes={clientes}
          />

          <ModalAddClient
            open={openModal}
            onClose={() => setOpenModal(false)}
            loadClientes={loadClientes}
          />

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            setCurrentPage={setCurrentPage}
            items={clientes}
            totalItems={totalItems}
          />
        </>
      )}
    </div>
  );
};

export default ClientsPage;
