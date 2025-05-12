import React from "react";

export const Input = ({
  label,
  name,
  type,
  value,
  onChange,
  className,
  noAutocomplete,
  placeholder,
  inputType,
}: {
  label?: string;
  name: string;
  type?: string;
  value: string | number | boolean | undefined;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  noAutocomplete?: boolean;
  placeholder?: string;
  inputType?: "text" | "money" | "checkbox" | "select";
}) => {
  const inputFormat = inputType || "text";
  return (
    <>
      {inputFormat === "text" && (
        <div className="flex flex-col gap-2">
          <label htmlFor={name}>{label}</label>
          <input
            autoComplete={noAutocomplete ? "off" : "on"}
            type={type}
            name={name}
            placeholder={placeholder}
            value={value as string}
            onChange={onChange}
            className={`${className} w-[250px] px-3 py-2 border border-gray-300 hover:shadow-lg rounded-lg focus:outline-none ring-2 ring-transparent focus:ring-blue-500 focus:shadow-lg font-['Poppins'] duration-300`}
          />
        </div>
      )}
      {inputFormat === "checkbox" && (
        <div className="flex flex-row gap-2 items-center">
          <input
            id={name}
            type="checkbox"
            checked={value as boolean}
            onChange={onChange}
            className={`${className} h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer hover:shadow-lg`}
          />
          <label
            htmlFor={name}
            className="ml-2 block text-sm text-gray-900 select-none"
          >
            {label}
          </label>
        </div>
      )}
    </>
  );
};
