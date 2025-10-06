import React from "react";
import { FaTimes, FaExclamationTriangle } from "react-icons/fa";
import { Button } from "../common/Button";

interface DeleteProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  productName: string;
  productBrand?: string;
  isLoading?: boolean;
}

export const DeleteProductModal: React.FC<DeleteProductModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  productName,
  productBrand,
  isLoading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-11/12 xl:w-1/2 max-w-[90vw]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-full">
              <FaExclamationTriangle className="w-5 h-5 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              Eliminar Producto
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isLoading}
          >
            <FaTimes className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-gray-700 mb-3">
            ¿Estás seguro de que deseas eliminar el siguiente producto?
          </p>
          <div className="bg-gray-50 p-3 rounded-md border-l-4 border-red-500">
            <p className="font-semibold text-gray-900">{productName}</p>
            {productBrand && (
              <p className="text-sm text-gray-600 mt-1">
                Marca: <span className="font-medium">{productBrand}</span>
              </p>
            )}
          </div>
          <p className="text-sm text-red-600 mt-3">
            ⚠️ Esta acción no se puede deshacer.
          </p>
        </div>

        <div className="flex justify-end space-x-3">
          <Button
            color="gray"
            text="Cancelar"
            onClick={onClose}
            disabled={isLoading}
          />
          <Button
            color="red"
            text={isLoading ? "Eliminando..." : "Eliminar"}
            onClick={onConfirm}
            disabled={isLoading}
          />
        </div>
      </div>
    </div>
  );
};
