import { useEffect } from 'react';
import { X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

function ImageLightbox({ open, imageSrc, alt, onClose }) {
  const { t, isRTL } = useLanguage();

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open || !imageSrc) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={alt}
    >
      <button
        type="button"
        onClick={onClose}
        className={`absolute top-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 ${isRTL ? 'left-4' : 'right-4'}`}
        aria-label={t('machineImage.closePreview')}
      >
        <X className="h-5 w-5" />
      </button>

      <div
        className="flex max-h-[90vh] w-full max-w-5xl items-center justify-center rounded-3xl bg-white p-4 shadow-2xl sm:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <img src={imageSrc} alt={alt} className="max-h-[80vh] w-full rounded-2xl object-contain" />
      </div>
    </div>
  );
}

export default ImageLightbox;
