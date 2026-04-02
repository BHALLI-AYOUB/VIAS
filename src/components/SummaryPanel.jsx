import { Eraser, FileText, Mail, MessageCircle, Phone } from 'lucide-react';
import MachineImage from './MachineImage';
import { useLanguage } from '../context/LanguageContext';
import { formatPhoneNumber } from '../utils/formatDeclaration';

function SummaryList({ title, items }) {
  const { t, isRTL, getCategoryLabel } = useLanguage();

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
      <div className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-slate-600">{title}</div>
      {items.length ? (
        <div className="space-y-3">
          {items.map((group) => (
            <div key={group.category} className="rounded-2xl bg-white p-3 text-sm text-slate-700">
              <div className={`flex gap-3 ${isRTL ? 'flex-row-reverse text-right' : ''}`}>
                <MachineImage
                  category={group.category}
                  alt={getCategoryLabel(group.category)}
                  className="h-16 w-20 shrink-0"
                />
                <div className="min-w-0">
                  <div className="font-semibold">{getCategoryLabel(group.category)}</div>
                  <div className="mt-1 leading-6 text-slate-600">{group.parcNumbers.join(', ')}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-500">{t('summary.noDeclared')}</p>
      )}
    </div>
  );
}

function SummaryPanel({ formData, summary, onSendEmail, onSendWhatsApp, onClearForm, isSending }) {
  const { isRTL, t } = useLanguage();

  return (
    <aside className={`panel top-24 h-fit p-5 lg:sticky ${isRTL ? 'text-right' : ''}`}>
      <div className={`flex items-start justify-between gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <div>
          <div className="badge border-brand-200 bg-brand-50 text-brand-900">{t('summary.previewBadge')}</div>
          <h2 className="mt-3 text-2xl text-slate-950">{t('summary.title')}</h2>
        </div>
        <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
          <FileText className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-5 space-y-3 rounded-3xl bg-ink p-5 text-white">
        <div className="text-lg font-semibold">
          {formData.fullName || t('summary.unnamed')} {formData.localisation ? `• ${formData.localisation}` : ''}
        </div>
        <div className={`flex flex-wrap gap-3 text-sm text-slate-300 ${isRTL ? 'justify-end' : ''}`}>
          <span className={`inline-flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Phone className="h-4 w-4 text-brand-300" />
            {formatPhoneNumber(formData.phone, formData.phoneCountry) || t('summary.phoneRequired')}
          </span>
          <span className={`inline-flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Mail className="h-4 w-4 text-brand-300" />
            {formData.email || t('summary.noSenderEmail')}
          </span>
        </div>
        <div className="text-sm text-slate-300">
          {t('summary.date')}: {formData.date || '-'} {formData.time ? `• ${t('summary.time')}: ${formData.time}` : ''}
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">{t('summary.availableCount')}</div>
        <div className="mt-2 text-3xl font-bold text-emerald-900">{summary.metrics.available}</div>
      </div>

      <div className="mt-5 space-y-4">
        <SummaryList title={t('summary.detailedAvailable')} items={summary.availableGroups} />
      </div>

      {summary.remarques ? (
        <div className="mt-5 rounded-3xl border border-slate-200 bg-slate-50/70 p-4">
          <div className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">{t('summary.notes')}</div>
          <p className="text-sm leading-6 text-slate-700">{summary.remarques}</p>
        </div>
      ) : null}

      <div className="mt-4 grid gap-3">
        <button
          type="button"
          onClick={onClearForm}
          className={`inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 ${isRTL ? 'flex-row-reverse' : ''}`}
        >
          <Eraser className="h-4 w-4" />
          {t('summary.buttons.clearForm')}
        </button>
        <button
          type="button"
          onClick={onSendEmail}
          disabled={isSending}
          className={`inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-ink px-5 py-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400 ${isRTL ? 'flex-row-reverse' : ''}`}
        >
          <Mail className="h-4 w-4" />
          {isSending ? t('summary.buttons.sendingEmail') : t('summary.buttons.sendEmail')}
        </button>
        <button
          type="button"
          onClick={onSendWhatsApp}
          className={`inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-5 py-4 text-sm font-semibold text-white transition hover:bg-[#1fb759] ${isRTL ? 'flex-row-reverse' : ''}`}
        >
          <MessageCircle className="h-4 w-4" />
          {t('summary.buttons.sendWhatsApp')}
        </button>
      </div>
    </aside>
  );
}

export default SummaryPanel;
