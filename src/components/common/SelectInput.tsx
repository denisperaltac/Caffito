import React from "react";

interface SelectOption {
  label: string;
  value: string;
}

interface SelectInputProps {
  name: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  width?: string;
  margin?: string;
  label?: string;
}

const SelectInput: React.FC<SelectInputProps> = ({
  name,
  value,
  options,
  onChange,
  width = "w-full",
  margin = "mb-4",
  label,
}) => {
  return (
    <div className={`${margin}`}>
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
        </label>
      )}
      <select
        id={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${width} px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SelectInput;
