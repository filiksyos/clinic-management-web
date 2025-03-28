import { forwardRef } from "react";

interface Option {
  value: string;
  label: string;
}

interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Option[];
}

export const FormSelect = forwardRef<HTMLSelectElement, FormSelectProps>(
  ({ label, error, options, className, ...props }, ref) => {
    return (
      <div className="w-full mb-4">
        {label && (
          <label className="block text-sm font-medium text-gray-800 mb-1">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={`w-full border border-gray-300 rounded-md p-2 outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 ${
            error ? "border-red-500" : ""
          } ${className}`}
          {...props}
        >
          <option value="" className="text-gray-900">Select an option</option>
          {options.map((option) => (
            <option key={option.value} value={option.value} className="text-gray-900">
              {option.label}
            </option>
          ))}
        </select>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);

FormSelect.displayName = "FormSelect"; 