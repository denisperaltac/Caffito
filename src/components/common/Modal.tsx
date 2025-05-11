import React from "react";
import { IoClose } from "react-icons/io5";

export const Modal = ({
  children,
  open,
  onClose,
  size,
}: {
  children: React.ReactNode;
  open: boolean;
  onClose: () => void;
  size?:
    | "w-[90%] h-[90%]"
    | "w-2/3 h-2/3"
    | "w-1/2 h-1/2"
    | "w-1/3 h-1/3"
    | "w-1/4 h-1/4";
}) => {
  return (
    <>
      {open ? (
        <div className="fixed z-50 inset-0 bg-black bg-opacity-50 flex transition-all duration-300 items-center justify-center h-screen w-screen">
          <div
            className={`bg-white p-6 flex flex-row justify-between rounded-lg w-full h- ${
              size || "w-[90%] h-[90%]"
            }`}
          >
            {children}
            <IoClose
              className="text-2xl rounded-full -mr-2 -mt-2 w-8 h-8 p-1 cursor-pointer hover:scale-125 hover:bg-gray-200 transition-all duration-300"
              onClick={onClose}
            />
          </div>
        </div>
      ) : (
        <></>
      )}
    </>
  );
};
