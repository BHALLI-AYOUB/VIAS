import { Check, Copy } from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';

function TrajectorySummary({ trajectory = [] }) {
  const { isRTL, t } = useLanguage();
  const [copied, setCopied] = useState(false);
  const summary = trajectory.length ? trajectory.join(' → ') : t('history.noTrajectory');

  const handleCopy = async () => {
    await window.navigator.clipboard.writeText(summary);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
      <div className={`flex items-start justify-between gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">{t('history.trajectory')}</div>
          <div className="mt-2 text-sm leading-6 text-slate-700">{summary}</div>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className={`inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-100 ${isRTL ? 'flex-row-reverse' : ''}`}
        >
          {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
          {copied ? t('history.copied') : t('history.copyTrajectory')}
        </button>
      </div>
    </div>
  );
}

export default TrajectorySummary;
