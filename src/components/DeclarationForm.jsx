import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, CheckCircle2, ChevronDown, Info } from 'lucide-react';
import FormField from './FormField';
import MachineCategorySection from './MachineCategorySection';
import SummaryPanel from './SummaryPanel';
import ConfirmationModal from './ConfirmationModal';
import { machineCategories } from '../data/machineCategories';
import { countryCallingCodes, defaultCountryCallingCode } from '../data/countryCallingCodes';
import { localisations } from '../data/localisations';
import { machines } from '../data/machines';
import { buildDeclarationSummary, formatDeclarationEmail } from '../utils/formatDeclaration';
import { buildWhatsAppUrl } from '../utils/formatWhatsAppMessage';
import { clearDraft, loadDraft, saveDraft } from '../utils/storage';
import { persistDeclaration } from '../services/declarationService';
import { sendDeclarationEmail } from '../services/emailService';
import { useLanguage } from '../context/LanguageContext';
import { getMachineIdsByCategory, groupMachinesByCategory } from '../utils/groupMachinesByCategory';

const initialFormData = {
  fullName: '',
  phoneCountry: defaultCountryCallingCode.code,
  phone: '',
  email: '',
  company: 'VIAS',
  localisation: '',
  localisationOther: '',
  date: new Date().toISOString().slice(0, 10),
  time: new Date().toTimeString().slice(0, 5),
  notes: '',
};

const initialActiveCategories = machineCategories.reduce((accumulator, category) => {
  accumulator[category.label] = false;
  return accumulator;
}, {});

function getFreshFormData() {
  return {
    ...initialFormData,
    date: new Date().toISOString().slice(0, 10),
    time: new Date().toTimeString().slice(0, 5),
  };
}

function Toast({ toast }) {
  const { t, isRTL } = useLanguage();

  if (!toast) {
    return null;
  }

  const tone =
    toast.type === 'success'
      ? 'border-emerald-400/25 bg-emerald-400/12 text-emerald-100'
      : 'border-rose-400/25 bg-rose-400/12 text-rose-100';
  const Icon = toast.type === 'success' ? CheckCircle2 : AlertCircle;

  return (
    <div className={`fixed bottom-4 left-4 right-4 z-50 rounded-[1.3rem] border px-4 py-3 shadow-[0_18px_44px_rgba(0,0,0,0.34)] backdrop-blur sm:left-auto sm:right-5 sm:max-w-sm ${tone} ${isRTL ? 'text-right' : ''}`}>
      <div className={`flex items-start gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <Icon className="mt-0.5 h-5 w-5" />
        <div>
          <div className="font-semibold">{t(toast.titleKey)}</div>
          <p className="mt-1 text-sm opacity-90">{t(toast.messageKey)}</p>
        </div>
      </div>
    </div>
  );
}

function inferActiveCategories(selectedMachineIds, machinesByCategory) {
  const nextState = { ...initialActiveCategories };

  Object.entries(machinesByCategory).forEach(([category, categoryMachines]) => {
    nextState[category] = categoryMachines.some((machine) => selectedMachineIds.includes(machine.id));
  });

  return nextState;
}

function DeclarationForm() {
  const { t, isRTL, locale } = useLanguage();
  const [formData, setFormData] = useState(initialFormData);
  const [activeCategories, setActiveCategories] = useState(initialActiveCategories);
  const [selectedMachines, setSelectedMachines] = useState([]);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(null);
  const [isDraftHydrated, setIsDraftHydrated] = useState(false);

  const machinesByCategory = useMemo(() => groupMachinesByCategory(machines), []);
  const machineIdsByCategory = useMemo(() => getMachineIdsByCategory(machinesByCategory), [machinesByCategory]);

  const selectedMachineIdsByCategory = useMemo(
    () =>
      Object.fromEntries(
        machineCategories.map((category) => [
          category.label,
          (machineIdsByCategory[category.label] || []).filter((id) => selectedMachines.includes(id)),
        ]),
      ),
    [machineIdsByCategory, selectedMachines],
  );

  const getResolvedFormData = () => ({
    ...formData,
    localisation:
      formData.localisation === 'AUTRE'
        ? formData.localisationOther.trim()
        : formData.localisation,
  });

  const summary = buildDeclarationSummary({
    formData: getResolvedFormData(),
    selectedMachines,
    machines,
  });

  useEffect(() => {
    const draft = loadDraft();

    if (!draft) {
      setIsDraftHydrated(true);
      return;
    }

    const nextSelectedMachines = draft.selectedMachines || [];

    setFormData((current) => ({ ...current, ...draft.formData }));
    setSelectedMachines(nextSelectedMachines);
    setActiveCategories(
      draft.activeCategories || inferActiveCategories(nextSelectedMachines, machinesByCategory),
    );
    setIsDraftHydrated(true);
  }, [machinesByCategory]);

  useEffect(() => {
    if (!isDraftHydrated) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      saveDraft({
        formData,
        activeCategories,
        selectedMachines,
      });
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [activeCategories, formData, isDraftHydrated, selectedMachines]);

  useEffect(() => {
    if (!toast) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => setToast(null), 4200);
    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  const showToast = (type, titleKey, messageKey) => setToast({ type, titleKey, messageKey });

  const resetForm = ({ keepSuccess = false } = {}) => {
    setFormData(getFreshFormData());
    setActiveCategories(initialActiveCategories);
    setSelectedMachines([]);
    setErrors({});
    setIsModalOpen(false);
    if (!keepSuccess) {
      setSubmitSuccess(null);
    }
    clearDraft();
  };

  const handleFieldChange = (field, value) => {
    setFormData((current) => ({
      ...current,
      [field]: value,
      ...(field === 'localisation' && value !== 'AUTRE' ? { localisationOther: '' } : {}),
    }));
    setErrors((current) => ({ ...current, [field]: '' }));
  };

  const handlePhoneChange = (value) => {
    const digits = value.replace(/\D/g, '');
    let normalized = digits;
    const selectedCountry =
      countryCallingCodes.find((item) => item.code === formData.phoneCountry) || defaultCountryCallingCode;
    const dialDigits = selectedCountry.dialCode.replace('+', '');

    if (normalized.startsWith(dialDigits)) {
      normalized = normalized.slice(dialDigits.length);
    }

    if (selectedCountry.code === 'MA' && normalized.startsWith('0')) {
      normalized = normalized.slice(1);
    }

    setFormData((current) => ({ ...current, phone: normalized.slice(0, 14) }));
    setErrors((current) => ({ ...current, phone: '' }));
  };

  const handleToggleCategory = (category) => {
    setActiveCategories((current) => ({
      ...current,
      [category]: !current[category],
    }));
  };

  const handleToggleMachine = (category, machineId) => {
    setActiveCategories((current) => ({
      ...current,
      [category]: true,
    }));

    setSelectedMachines((current) =>
      current.includes(machineId) ? current.filter((id) => id !== machineId) : [...current, machineId],
    );
  };

  const validate = () => {
    const nextErrors = {};

    if (!formData.fullName.trim()) nextErrors.fullName = t('form.errors.fullName');
    if (!formData.phone.trim()) nextErrors.phone = t('form.errors.phone');
    if (!formData.localisation) nextErrors.localisation = t('form.errors.localisation');
    if (formData.localisation === 'AUTRE' && !formData.localisationOther.trim()) {
      nextErrors.localisationOther = t('form.errors.localisationOther');
    }
    if (!formData.date) nextErrors.date = t('form.errors.date');
    if (!summary.hasAnyDeclaration) {
      nextErrors.declaration = t('form.errors.declaration');
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handlePrepareSubmit = () => {
    if (!validate()) {
      showToast('error', 'form.toast.incompleteTitle', 'form.toast.incompleteMessage');
      return false;
    }

    setIsModalOpen(true);
    return true;
  };

  const handleClearForm = () => {
    if (!window.confirm(t('form.confirmClear'))) {
      return;
    }

    resetForm();
    showToast('success', 'form.toast.resetTitle', 'form.toast.resetMessage');
  };

  const handleEmailSend = async () => {
    setIsSending(true);

    try {
      const payload = formatDeclarationEmail({
        formData: getResolvedFormData(),
        selectedMachines,
        machines,
      });

      await persistDeclaration({
        formData: getResolvedFormData(),
        selectedMachineIds: selectedMachines,
        canalEnvoi: 'email',
      });

      await sendDeclarationEmail(payload);
      resetForm({ keepSuccess: true });
      setSubmitSuccess({
        sentAt: new Date().toLocaleString(locale),
        subject: payload.subject,
        channelKey: 'summary.buttons.sendEmail',
      });
      showToast('success', 'form.toast.sentTitle', 'form.toast.sentMessage');
    } catch (error) {
      showToast('error', 'form.toast.sendErrorTitle', 'form.toast.sendErrorMessage');
    } finally {
      setIsSending(false);
    }
  };

  const handleWhatsAppSend = async () => {
    if (!validate()) {
      showToast('error', 'form.toast.incompleteTitle', 'form.toast.incompleteMessage');
      return;
    }

    const url = buildWhatsAppUrl({
      formData: getResolvedFormData(),
      selectedMachines,
      machines,
    });

    try {
      await persistDeclaration({
        formData: getResolvedFormData(),
        selectedMachineIds: selectedMachines,
        canalEnvoi: 'whatsapp',
      });
    } catch (error) {
      showToast('error', 'form.toast.sendErrorTitle', 'history.databaseError');
      return;
    }

    window.open(url, '_blank', 'noopener,noreferrer');
    resetForm({ keepSuccess: true });
    setSubmitSuccess({
      sentAt: new Date().toLocaleString(locale),
      subject: `WhatsApp - ${getResolvedFormData().localisation} - ${formData.fullName}`,
      channelKey: 'summary.buttons.sendWhatsApp',
    });
    showToast('success', 'form.toast.whatsappReadyTitle', 'form.toast.whatsappReadyMessage');
  };

  const panelClass = 'site-panel rounded-[1.75rem] p-4 sm:p-6 lg:p-7';
  const fieldClass = `w-full min-w-0 rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(38,42,49,0.94),rgba(26,28,34,0.98))] px-4 py-3 text-sm text-white placeholder:text-slate-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] transition focus:border-brand-300 focus:bg-[linear-gradient(180deg,rgba(46,49,56,0.96),rgba(29,32,38,0.98))] focus:ring-4 focus:ring-brand-400/12`;
  const helperCardClass = 'mt-5 rounded-[1.4rem] border p-5';

  return (
    <section id="declaration" className="grid gap-4 lg:gap-5">
      <SummaryPanel
        formData={formData}
        summary={summary}
        onSendEmail={handlePrepareSubmit}
        onSendWhatsApp={handleWhatsAppSend}
        onClearForm={handleClearForm}
        isSending={isSending}
      />

      <div className={`${panelClass} ${isRTL ? 'text-right' : ''}`}>
        <div className="inline-flex items-center rounded-full border border-brand-300/25 bg-brand-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-brand-200">
          {t('form.publicBadge')}
        </div>
        <h2 className="mt-4 text-3xl text-white sm:text-4xl">{t('form.title')}</h2>

        <div className="mt-6 grid gap-4 sm:mt-8 sm:gap-5 md:grid-cols-2">
          <FormField tone="dark" label={t('form.fields.fullName')} htmlFor="fullName" required error={errors.fullName}>
            <input
              id="fullName"
              value={formData.fullName}
              onChange={(event) => handleFieldChange('fullName', event.target.value)}
              className={`${fieldClass} ${isRTL ? 'text-right' : 'text-left'}`}
              placeholder={t('form.placeholders.fullName')}
            />
          </FormField>

          <FormField tone="dark" label={t('form.fields.phone')} htmlFor="phone" required error={errors.phone}>
            <div className={`grid gap-3 sm:grid-cols-[150px_minmax(0,1fr)] ${isRTL ? 'text-right' : ''}`}>
              <div className="relative">
                <select
                  aria-label={t('form.fields.phone')}
                  value={formData.phoneCountry}
                  onChange={(event) => handleFieldChange('phoneCountry', event.target.value)}
                  className={`${fieldClass} appearance-none pr-10 ${isRTL ? 'text-right pl-10 pr-4' : 'text-left pr-10'}`}
                >
                  {countryCallingCodes.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.label}
                    </option>
                  ))}
                </select>
                <div className={`pointer-events-none absolute inset-y-0 flex items-center text-sm font-semibold text-slate-300 ${isRTL ? 'left-3' : 'right-3'}`}>
                  <ChevronDown className="h-4 w-4" />
                </div>
              </div>
              <input
                id="phone"
                value={formData.phone}
                onChange={(event) => handlePhoneChange(event.target.value)}
                inputMode="numeric"
                className={`${fieldClass} min-w-0 ${isRTL ? 'text-right' : 'text-left'}`}
                placeholder={t('form.placeholders.phone')}
              />
            </div>
          </FormField>

          <FormField tone="dark" label={t('form.fields.company')} htmlFor="company">
            <input
              id="company"
              value={formData.company}
              onChange={(event) => handleFieldChange('company', event.target.value)}
              className={`${fieldClass} ${isRTL ? 'text-right' : 'text-left'}`}
              placeholder={t('form.placeholders.company')}
            />
          </FormField>

          <FormField tone="dark" label={t('form.fields.email')} htmlFor="email">
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(event) => handleFieldChange('email', event.target.value)}
              className={`${fieldClass} ${isRTL ? 'text-right' : 'text-left'}`}
              placeholder={t('form.placeholders.email')}
            />
          </FormField>

          <FormField tone="dark" label={t('form.fields.date')} htmlFor="date" required error={errors.date}>
            <input
              id="date"
              type="date"
              value={formData.date}
              onChange={(event) => handleFieldChange('date', event.target.value)}
              className={`${fieldClass} ${isRTL ? 'text-right' : 'text-left'}`}
            />
          </FormField>

          <FormField tone="dark" label={t('form.fields.time')} htmlFor="time">
            <input
              id="time"
              type="time"
              value={formData.time}
              onChange={(event) => handleFieldChange('time', event.target.value)}
              className={`${fieldClass} ${isRTL ? 'text-right' : 'text-left'}`}
            />
          </FormField>

          <div className="min-w-0 md:col-span-2">
            <FormField
              tone="dark"
              label={t('form.fields.localisation')}
              htmlFor="localisation"
              required
              description={t('form.descriptions.localisation')}
              error={errors.localisation}
            >
              <div className="relative">
                <select
                  id="localisation"
                  value={formData.localisation}
                  onChange={(event) => handleFieldChange('localisation', event.target.value)}
                  className={`${fieldClass} appearance-none ${isRTL ? 'text-right pl-10 pr-4' : 'text-left pr-10'}`}
                >
                  <option value="">{t('form.placeholders.localisation')}</option>
                  {localisations.map((localisation) => (
                    <option key={localisation} value={localisation}>
                      {localisation}
                    </option>
                  ))}
                  <option value="AUTRE">{t('form.fields.otherOption')}</option>
                </select>
                <div className={`pointer-events-none absolute inset-y-0 flex items-center text-sm font-semibold text-slate-300 ${isRTL ? 'left-3' : 'right-3'}`}>
                  <ChevronDown className="h-4 w-4" />
                </div>
              </div>
            </FormField>

            {formData.localisation === 'AUTRE' ? (
              <div className="mt-4">
                <FormField
                  tone="dark"
                  label={t('form.fields.localisationOther')}
                  htmlFor="localisationOther"
                  required
                  error={errors.localisationOther}
                >
                  <input
                    id="localisationOther"
                    value={formData.localisationOther}
                    onChange={(event) => handleFieldChange('localisationOther', event.target.value)}
                    className={`${fieldClass} ${isRTL ? 'text-right' : 'text-left'}`}
                    placeholder={t('form.placeholders.localisationOther')}
                  />
                </FormField>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className={panelClass}>
        <MachineCategorySection
          categories={machineCategories}
          machinesByCategory={machinesByCategory}
          activeCategories={activeCategories}
          selectedMachineIdsByCategory={selectedMachineIdsByCategory}
          onToggleCategory={handleToggleCategory}
          onToggleMachine={handleToggleMachine}
        />
      </div>

      <div className={`${panelClass} ${isRTL ? 'text-right' : ''}`}>
        <FormField tone="dark" label={t('form.fields.notes')} htmlFor="notes" description={t('form.descriptions.notes')}>
          <textarea
            id="notes"
            rows="5"
            value={formData.notes}
            onChange={(event) => handleFieldChange('notes', event.target.value)}
            className={`${fieldClass} resize-y ${isRTL ? 'text-right' : 'text-left'}`}
            placeholder={t('form.placeholders.notes')}
          />
        </FormField>

        {errors.declaration ? (
          <div className="mt-4 rounded-[1.35rem] border border-rose-400/25 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
            {errors.declaration}
          </div>
        ) : null}

        {submitSuccess ? (
          <div className={`${helperCardClass} border-emerald-400/25 bg-emerald-400/10`}>
            <div className={`flex items-start gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-300" />
              <div>
                <div className="font-semibold text-emerald-100">{t('form.successTitle')}</div>
                <p className="mt-1 text-sm text-emerald-200/90">
                  {t('form.labels.channel')}: {t(submitSuccess.channelKey)}
                  <br />
                  {t('form.labels.reference')}: {submitSuccess.subject}
                  <br />
                  {t('form.labels.timestamp')}: {submitSuccess.sentAt}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className={`${helperCardClass} site-subpanel`}>
            <div className={`flex items-start gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Info className="mt-0.5 h-5 w-5 text-brand-300" />
              <div className="text-sm leading-6 text-slate-400">{t('form.info')}</div>
            </div>
          </div>
        )}
      </div>

      <ConfirmationModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirmEmail={handleEmailSend}
        onConfirmWhatsApp={handleWhatsAppSend}
        summary={summary}
        localisation={formData.localisation}
        fullName={formData.fullName}
        isSending={isSending}
      />

      <Toast toast={toast} />
    </section>
  );
}

export default DeclarationForm;
