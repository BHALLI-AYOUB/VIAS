import { useMemo, useState } from 'react';
import { Expand, ImageOff } from 'lucide-react';
import { getMachineImage } from '../data/machineImages';
import ImageLightbox from './ImageLightbox';
import { useLanguage } from '../context/LanguageContext';

function MachineImage({ category, alt, className = '', previewable = true }) {
  const { t, getCategoryLabel, isRTL } = useLanguage();
  const [hasError, setHasError] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const source = getMachineImage(category);

  const fallback = useMemo(
    () => (
      <div
        className={`flex h-full w-full items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-100 text-slate-400 ${className}`}
        aria-label={t('machineImage.unavailableLabel', { alt })}
      >
        <div className="flex flex-col items-center gap-2 px-3 text-center">
          <ImageOff className="h-6 w-6" />
          <span className="text-xs font-medium uppercase tracking-[0.18em]">{getCategoryLabel(category)}</span>
        </div>
      </div>
    ),
    [alt, category, className, getCategoryLabel, t],
  );

  if (!source || hasError) {
    return fallback;
  }

  const content = (
    <div className={`group relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 ${className}`}>
      <img
        src={source}
        alt={alt}
        className="h-full w-full object-contain object-center p-3"
        loading="lazy"
        onError={() => setHasError(true)}
      />

      {previewable ? (
        <div className={`pointer-events-none absolute inset-x-3 bottom-3 flex ${isRTL ? 'justify-start' : 'justify-end'}`}>
          <span className="inline-flex items-center gap-2 rounded-full bg-slate-950/75 px-3 py-1.5 text-xs font-medium text-white opacity-0 transition group-hover:opacity-100">
            <Expand className="h-3.5 w-3.5" />
            {t('machineImage.enlarge')}
          </span>
        </div>
      ) : null}
    </div>
  );

  if (!previewable) {
    return content;
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="block w-full text-left"
        aria-label={t('machineImage.enlargeAria', { alt })}
      >
        {content}
      </button>

      <ImageLightbox open={isOpen} imageSrc={source} alt={alt} onClose={() => setIsOpen(false)} />
    </>
  );
}

export default MachineImage;
