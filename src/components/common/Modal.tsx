import React from "react";
import { IoClose } from "react-icons/io5";
import { Button } from "./Button";

export const Modal = ({
  children,
  open,
  onClose,
  onSave,
  size,
  disabledBtn,
  modalDelete,
  textBtn,
}: {
  children: React.ReactNode;
  open: boolean;
  onClose: () => void;
  size?: string;
  onSave?: any;
  disabledBtn?: boolean;
  modalDelete?: boolean;
  textBtn?: string;
}) => {
  return (
    <>
      {open ? (
        <div className="fixed z-50 inset-0 bg-black bg-opacity-50 flex transition-all duration-300 items-center justify-center h-screen w-screen overflow-hidden">
          <div
            className={`bg-white p-6 flex flex-col justify-between overflow-auto rounded-lg ${
              size || "w-[90%] h-[90%]"
            }`}
          >
            <div className="flex flex-row justify-between w-full h-full gap-4">
              {children}
              <IoClose
                className="text-2xl rounded-full -ml-10 -mr-2 -mt-2 w-8 h-8 p-1 cursor-pointer hover:scale-125 hover:bg-gray-200 transition-all duration-300"
                onClick={onClose}
              />
            </div>
            <div className="flex justify-end gap-4">
              <Button
                color="gray"
                disabled={false}
                text="Cancelar"
                onClick={onClose}
              />
              {onSave && (
                <Button
                  color={modalDelete ? "red" : "blue"}
                  disabled={disabledBtn}
                  text={textBtn || "Guardar"}
                  onClick={onSave}
                />
              )}
            </div>
          </div>
        </div>
      ) : (
        <></>
      )}
    </>
  );
};
