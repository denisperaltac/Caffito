import React from "react";
import { FaPlus } from "react-icons/fa";

interface CustomProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: () => void;
  productName: string;
  setProductName: (name: string) => void;
  productPrice: string;
  setProductPrice: (price: string) => void;
}

const CustomProductModal: React.FC<CustomProductModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  productName,
  setProductName,
  productPrice,
  setProductPrice,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-xl leading-6 text-center font-medium text-gray-900 mb-8">
            Agregar Producto Personalizado
          </h3>
          <div className="mb-4">
            <label className="block text-gray-700 text-base font-bold mb-2">
              Nombre del Producto
            </label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ingrese el nombre del producto"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-base font-bold mb-2">
              Precio
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                $
              </span>
              <input
                type="number"
                value={productPrice}
                onChange={(e) => setProductPrice(e.target.value)}
                className="w-full pl-6 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ingrese el precio"
                min="0"
                step="0.01"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded"
            >
              Cancelar
            </button>
            <button
              onClick={onAdd}
              disabled={!productName || !productPrice}
              className="bg-green-500 flex items-center gap-2 hover:bg-green-600 duration-300 text-white font-semibold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaPlus size={16} />
              Agregar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomProductModal;
