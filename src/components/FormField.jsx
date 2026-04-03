function FormField({ label, htmlFor, required, description, error, children }) {
  return (
    <label htmlFor={htmlFor} className="block min-w-0 space-y-2">
      <div className="flex min-w-0 items-center gap-2 text-sm font-semibold text-slate-800">
        <span>{label}</span>
        {required ? <span className="text-brand-600">*</span> : null}
      </div>
      {description ? <p className="text-xs leading-5 text-slate-500">{description}</p> : null}
      {children}
      {error ? <p className="text-sm font-medium text-rose-600">{error}</p> : null}
    </label>
  );
}

export default FormField;
