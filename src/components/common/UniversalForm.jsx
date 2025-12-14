import React, { useState, useEffect } from 'react';

const UniversalForm = ({
  fields = [],
  onSubmit,
  onCancel,
  submitText = "Save",
  cancelText = "Cancel",
  loading = false,
  error = "",
  initialValues = {},
  submitDisabled = false,
}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setValues(initialValues);
  }, [initialValues]);

  const handleChange = (arg1, arg2) => {
    if (typeof arg1 === "object" && arg1.target) {
      // Called as handleChange(event)
      const { name, value } = arg1.target;
      setValues((prev) => {
        const updated = { ...prev, [name]: value };
        console.log("FORM CHANGE →", name, value);
        console.log("CURRENT FORM VALUES →", updated);
        return updated;
      });
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    } else {
      // Called as handleChange(name, value)
      const name = arg1;
      const value = arg2;
      setValues((prev) => {
        const updated = { ...prev, [name]: value };
        console.log("FORM CHANGE →", name, value);
        console.log("CURRENT FORM VALUES →", updated);
        return updated;
      });
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    let newErrors = {};
    fields.forEach((field) => {
      if (field.required && !values[field.name]?.toString().trim()) {
        newErrors[field.name] = field.errorMsg || "Required";
      }
    });

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      onSubmit(values);
    }
  };

  const renderField = (field) => {
    const commonProps = {
      value: values[field.name],
      onChange: (e) => {
        const value = e?.target ? e.target.value : e;
        // Update form values first
        handleChange(field.name, value);
        // Then call field's onChange if it exists
        if (field.onChange) {
          field.onChange(value);
        }
      },
      placeholder: field.placeholder,
      disabled: field.disabled,
      className: `w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
        errors[field.name] ? 'border-red-500' : 'border-gray-300'
      }`,
    };

    switch (field.type) {
      case 'select':
        return (
          <select {...commonProps}>
            <option value="">{field.placeholder || 'Select...'}</option>
            {field.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );

      case 'textarea':
        return (
          <textarea
            {...commonProps}
            rows={field.rows || 4}
            className={`font-mono text-sm resize-none ${commonProps.className}`}
          />
        );

      case 'checkbox':
        return (
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name={field.name}
              checked={!!values[field.name]}
              onChange={(e) => {
                setValues((prev) => ({
                  ...prev,
                  [field.name]: e.target.checked,
                }));
              }}
              disabled={loading || field.disabled}
              className="form-checkbox h-5 w-5 text-teal-600"
            />
            <span>{field.checkboxLabel}</span>
          </label>
        );

      default:
        return <input type={field.type || "text"} {...commonProps} />;
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {fields.map((field) => (
        <div key={field.name}>
          <label className="block text-gray-800 font-semibold mb-2">
            {field.label}
          </label>

          {renderField(field)}

          {errors[field.name] && (
            <div className="text-red-500 text-xs mt-1">
              {errors[field.name]}
            </div>
          )}
        </div>
      ))}

      <div className="flex justify-end gap-4 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 border border-gray-300 rounded-full text-gray-700 font-semibold hover:bg-gray-100 disabled:opacity-50 transition-colors"
          disabled={loading}
        >
          {cancelText}
        </button>

        <button
          type="submit"
          className="px-6 py-2 rounded-full bg-[#166a45] text-white font-semibold hover:bg-[#104631] disabled:opacity-50 flex items-center gap-2 transition-colors"
          disabled={loading || submitDisabled}
        >
          {loading && (
            <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
          )}
          {loading ? "Saving..." : submitText}
        </button>
      </div>
    </form>
  );
};

export default UniversalForm;