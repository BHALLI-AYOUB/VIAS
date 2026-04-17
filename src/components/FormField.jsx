function FormField({
  label,
  htmlFor,
  required,
  description,
  error,
  children,
  tone = 'light',
}) {
  const isDark = tone === 'dark';

  const labelClass = isDark
    ? 'flex min-w-0 items-center gap-2 text-sm font-semibold text-slate-100'
    : 'flex min-w-0 items-center gap-2 text-sm font-semibold text-slate-800';
  const descriptionClass = isDark
    ? 'text-xs leading-5 text-slate-400'
    : 'text-xs leading-5 text-slate-500';
  const errorClass = isDark
    ? 'text-sm font-medium text-rose-300'
    : 'text-sm font-medium text-rose-600';

  return (
    <label htmlFor={htmlFor} className="block min-w-0 space-y-2">
      <div className={labelClass}>
        <span>{label}</span>
        {required ? <span className="text-brand-400">*</span> : null}
      </div>
      {description ? <p className={descriptionClass}>{description}</p> : null}
      {children}
      {error ? <p className={errorClass}>{error}</p> : null}
    </label>
  );
}

export default FormField;
