import { AlertTriangle, CheckCircle2, Mail, MessageCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

function ConfirmationModal({ open, onClose, onConfirmEmail, onConfirmWhatsApp, summary, localisation, fullName, isSending }) {
  const { isRTL, t } = useLanguage();

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 py-6">
      <div className={`panel w-full max-w-2xl p-6 ${isRTL ? 'text-right' : ''}`}>
        <div className={`flex items-start gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className="rounded-2xl bg-brand-100 p-3 text-brand-700">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h2 className="text-3xl text-slate-950">{t('confirmation.title')}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{t('confirmation.description')}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 rounded-3xl bg-slate-50 p-5 md:grid-cols-2">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{t('confirmation.declarant')}</div>
            <div className="mt-2 text-lg font-semibold text-slate-900">{fullName}</div>
            <div className="text-sm text-slate-600">{localisation}</div>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{t('confirmation.declaredVolume')}</div>
            <div className="mt-2 space-y-2 text-sm text-slate-700">
              <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                {t('confirmation.availableMachines')}: {summary.metrics.available}
              </div>
            </div>
          </div>
        </div>

        <div className={`mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            {t('confirmation.back')}
          </button>
          <button
            type="button"
            onClick={onConfirmWhatsApp}
            className={`inline-flex items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1fb759] ${isRTL ? 'flex-row-reverse' : ''}`}
          >
            <MessageCircle className="h-4 w-4" />
            {t('confirmation.sendWhatsApp')}
          </button>
          <button
            type="button"
            onClick={onConfirmEmail}
            disabled={isSending}
            className={`inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-400 px-5 py-3 text-sm font-semibold text-ink transition hover:bg-brand-300 disabled:cursor-not-allowed disabled:bg-brand-200 ${isRTL ? 'flex-row-reverse' : ''}`}
          >
            <Mail className="h-4 w-4" />
            {isSending ? t('confirmation.sendingEmail') : t('confirmation.sendEmail')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmationModal;
