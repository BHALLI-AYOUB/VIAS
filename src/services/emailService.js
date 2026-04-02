import emailjs from '@emailjs/browser';

const {
  VITE_EMAILJS_SERVICE_ID,
  VITE_EMAILJS_TEMPLATE_ID,
  VITE_EMAILJS_PUBLIC_KEY,
  VITE_RECIPIENT_EMAIL,
} = import.meta.env;

const DEFAULT_RECIPIENT_EMAIL = 'mohammedelkamani1@gmail.com';
const RECIPIENT_EMAIL = VITE_RECIPIENT_EMAIL || DEFAULT_RECIPIENT_EMAIL;

function validateEmailConfiguration() {
  const missing = [
    ['VITE_EMAILJS_SERVICE_ID', VITE_EMAILJS_SERVICE_ID],
    ['VITE_EMAILJS_TEMPLATE_ID', VITE_EMAILJS_TEMPLATE_ID],
    ['VITE_EMAILJS_PUBLIC_KEY', VITE_EMAILJS_PUBLIC_KEY],
  ]
    .filter(([, value]) => !value)
    .map(([name]) => name);

  if (missing.length) {
    throw new Error(`Configuration EmailJS incomplète: ${missing.join(', ')}`);
  }
}

export async function sendDeclarationEmail({ subject, body, replyTo, senderName, localisation, date }) {
  validateEmailConfiguration();

  const templateParams = {
    to_email: RECIPIENT_EMAIL,
    reply_to: replyTo || RECIPIENT_EMAIL,
    subject,
    message: body,
    sender_name: senderName,
    site_name: localisation,
    declaration_date: date,
  };

  return emailjs.send(VITE_EMAILJS_SERVICE_ID, VITE_EMAILJS_TEMPLATE_ID, templateParams, VITE_EMAILJS_PUBLIC_KEY);
}
