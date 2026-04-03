export const ADMIN_EMAIL_ALLOWLIST = [
  'ayoubbhalli2003@gmail.com',
  'mohammedelkamani1@gmail.com',
];

export function normalizeAdminEmail(email = '') {
  return email.trim().toLowerCase();
}

export function isAllowedAdminEmail(email = '') {
  return ADMIN_EMAIL_ALLOWLIST.includes(normalizeAdminEmail(email));
}
