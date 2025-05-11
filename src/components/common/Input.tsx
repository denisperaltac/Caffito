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
}: {
  label?: string;
  name: string;
  type: string;
  value: string | number | undefined;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  noAutocomplete?: boolean;
  placeholder?: string;
}) => {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={name}>{label}</label>
      <input
        autoComplete={noAutocomplete ? "off" : "on"}
        type={type}
        name={name}
        placeholder={placeholder}
        value={value || ""}
        onChange={onChange}
        className={`${className} w-[250px] px-3 py-2 border border-gray-300 hover:shadow-lg rounded-lg focus:outline-none ring-2 ring-transparent focus:ring-blue-500 focus:shadow-lg font-['Poppins'] duration-300`}
      />
    </div>
  );
};
