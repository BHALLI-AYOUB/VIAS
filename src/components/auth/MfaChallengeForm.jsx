import FormField from '../FormField';

function MfaChallengeForm({
  code,
  onCodeChange,
  onSubmit,
  onSignOut,
  isSubmitting,
  error,
  labels,
  isRTL,
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <FormField label={labels.codeLabel} htmlFor="mfa-code" required error={error}>
        <input
          id="mfa-code"
          inputMode="numeric"
          autoComplete="one-time-code"
          value={code}
          onChange={(event) => onCodeChange(event.target.value)}
          className={`field-shell ${isRTL ? 'text-right' : 'text-left'}`}
          placeholder={labels.codePlaceholder}
        />
      </FormField>

      <div className="grid gap-3 md:grid-cols-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex w-full items-center justify-center rounded-2xl bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {isSubmitting ? labels.submitting : labels.submit}
        </button>

        <button
          type="button"
          onClick={onSignOut}
          className="inline-flex w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          {labels.signOut}
        </button>
      </div>
    </form>
  );
}

export default MfaChallengeForm;
