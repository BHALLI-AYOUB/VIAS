import { useMemo, useState } from 'react';
import { KeyRound, QrCode, ShieldCheck } from 'lucide-react';
import FormField from '../FormField';

function getQrMarkup(qrCode) {
  if (!qrCode) {
    return '';
  }

  if (qrCode.startsWith('<svg')) {
    return qrCode;
  }

  if (qrCode.startsWith('data:image')) {
    return '';
  }

  return qrCode;
}

function MfaEnrollmentCard({
  enrollment,
  code,
  onCodeChange,
  onVerify,
  onSignOut,
  isSubmitting,
  error,
  labels,
  isRTL,
}) {
  const [secretVisible, setSecretVisible] = useState(false);
  const qrMarkup = useMemo(() => getQrMarkup(enrollment?.totp?.qrCode || enrollment?.totp?.qr_code || ''), [enrollment]);
  const qrImage = enrollment?.totp?.qrCode || enrollment?.totp?.qr_code || '';
  const secret = enrollment?.totp?.secret || '';

  return (
    <div className="mt-6 space-y-5">
      <div className={`rounded-3xl border border-slate-200 bg-slate-50 p-5 ${isRTL ? 'text-right' : 'text-left'}`}>
        <div className={`flex items-center gap-2 text-sm font-semibold text-slate-900 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <ShieldCheck className="h-4 w-4 text-brand-700" />
          <span>{labels.requiredNotice}</span>
        </div>
        <p className="mt-2 text-sm leading-6 text-slate-600">{labels.instructions}</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className={`mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <QrCode className="h-4 w-4 text-brand-700" />
            <span>{labels.qrTitle}</span>
          </div>

          <div className="flex min-h-[240px] items-center justify-center rounded-3xl border border-slate-200 bg-slate-50 p-4">
            {qrMarkup ? (
              <div className="max-w-full [&>svg]:h-auto [&>svg]:w-full" dangerouslySetInnerHTML={{ __html: qrMarkup }} />
            ) : qrImage?.startsWith('data:image') ? (
              <img src={qrImage} alt={labels.qrAlt} className="h-auto w-full max-w-[220px]" />
            ) : (
              <div className="text-center text-sm text-slate-500">{labels.qrUnavailable}</div>
            )}
          </div>
        </div>

        <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className={`flex items-center gap-2 text-sm font-semibold text-slate-900 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <KeyRound className="h-4 w-4 text-brand-700" />
            <span>{labels.secretTitle}</span>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-xs uppercase tracking-[0.2em] text-slate-400">{labels.secretLabel}</div>
            <div className="mt-2 break-all font-mono text-sm text-slate-800">
              {secretVisible ? secret || '-' : '••••••••••••••••••••'}
            </div>
            <button
              type="button"
              onClick={() => setSecretVisible((current) => !current)}
              className="mt-3 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              {secretVisible ? labels.hideSecret : labels.showSecret}
            </button>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            <div>{labels.step1}</div>
            <div className="mt-2">{labels.step2}</div>
            <div className="mt-2">{labels.step3}</div>
          </div>

          <form onSubmit={onVerify} className="space-y-4">
            <FormField label={labels.codeLabel} htmlFor="mfa-enrollment-code" required error={error}>
              <input
                id="mfa-enrollment-code"
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
                {isSubmitting ? labels.verifying : labels.verify}
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
        </div>
      </div>
    </div>
  );
}

export default MfaEnrollmentCard;
