import { Eraser, FileText, Mail, MessageCircle, Phone } from 'lucide-react';
import MachineImage from './MachineImage';
import { useLanguage } from '../context/LanguageContext';
import { formatPhoneNumber } from '../utils/formatDeclaration';

function SummaryList({ title, items }) {
  const { t, isRTL, getCategoryLabel } = useLanguage();

  return (
    <div className="site-subpanel rounded-[1.5rem] p-4">
      <div className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">{title}</div>
      {items.length ? (
        <div className="space-y-3">
          {items.map((group) => (
            <div key={group.category} className="site-subpanel rounded-[1.25rem] p-3 text-sm text-slate-300">
              <div className={`flex gap-3 ${isRTL ? 'flex-row-reverse text-right' : ''}`}>
                <MachineImage
                  category={group.category}
                  alt={getCategoryLabel(group.category)}
                  className="h-16 w-20 shrink-0"
                  previewable={false}
                />
                <div className="min-w-0">
                  <div className="font-semibold text-slate-100">{getCategoryLabel(group.category)}</div>
                  <div className="mt-1 leading-6 text-slate-400">{group.parcNumbers.join(', ')}</div>
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
    <aside className={`site-panel order-first rounded-[1.75rem] p-4 sm:p-5 lg:p-6 ${isRTL ? 'text-right' : ''}`}>
      <div className={`flex items-start justify-between gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <div>
          <div className="inline-flex items-center rounded-full border border-brand-300/25 bg-brand-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-brand-200">
            {t('summary.previewBadge')}
          </div>
          <h2 className="mt-3 text-2xl text-white">{t('summary.title')}</h2>
        </div>
        <div className="site-subpanel rounded-2xl p-3 text-brand-300">
          <FileText className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_180px]">
        <div className="site-subpanel space-y-3 rounded-[1.6rem] p-4 text-white sm:p-5">
          <div className="text-lg font-semibold">
            {formData.fullName || t('summary.unnamed')} {formData.localisation ? `| ${formData.localisation}` : ''}
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
          <div className="text-sm text-slate-400">
            {t('summary.date')}: {formData.date || '-'} {formData.time ? `| ${t('summary.time')}: ${formData.time}` : ''}
          </div>
        </div>

        <div className="rounded-[1.6rem] border border-brand-300/20 bg-[linear-gradient(180deg,rgba(245,196,0,0.14),rgba(245,196,0,0.06))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-200">{t('summary.availableCount')}</div>
          <div className="mt-2 text-4xl font-bold text-brand-300">{summary.metrics.available}</div>
        </div>
      </div>

      <div className="mt-4">
        <SummaryList title={t('summary.detailedAvailable')} items={summary.availableGroups} />
      </div>

      {summary.remarques ? (
        <div className="site-subpanel mt-4 rounded-[1.5rem] p-4">
          <div className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">{t('summary.notes')}</div>
          <p className="text-sm leading-6 text-slate-300">{summary.remarques}</p>
        </div>
      ) : null}

      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        <button
          type="button"
          onClick={onClearForm}
          className={`inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(27,30,41,0.94),rgba(17,19,27,0.96))] px-5 py-4 text-sm font-semibold text-slate-200 transition hover:border-white/20 hover:bg-[#171922] ${isRTL ? 'flex-row-reverse' : ''}`}
        >
          <Eraser className="h-4 w-4" />
          {t('summary.buttons.clearForm')}
        </button>
        <button
          type="button"
          onClick={onSendEmail}
          disabled={isSending}
          className={`inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-brand-400 px-5 py-4 text-sm font-semibold text-ink transition hover:bg-brand-300 disabled:cursor-not-allowed disabled:bg-brand-200 ${isRTL ? 'flex-row-reverse' : ''}`}
        >
          <Mail className="h-4 w-4" />
          {isSending ? t('summary.buttons.sendingEmail') : t('summary.buttons.sendEmail')}
        </button>
        <button
          type="button"
          onClick={onSendWhatsApp}
          className={`inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl border border-[#25D366]/40 bg-[#25D366]/12 px-5 py-4 text-sm font-semibold text-[#7df2a9] transition hover:bg-[#25D366]/18 ${isRTL ? 'flex-row-reverse' : ''}`}
        >
          <MessageCircle className="h-4 w-4" />
          {t('summary.buttons.sendWhatsApp')}
        </button>
      </div>
    </aside>
  );
}

export default SummaryPanel;
