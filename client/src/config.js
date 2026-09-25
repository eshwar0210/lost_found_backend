const BASE_URL = process.env.REACT_APP_BASE_URL || '';
// console.log(BASE_URL);
export default BASE_URL;

export const ADMIN_EMAIL = process.env.REACT_APP_ADMIN_EMAIL || 'admin@iitp.ac.in';

// mailto: opens the visitor's own mail client, unlike a Gmail compose URL which
// breaks for anyone on Outlook/Apple Mail/Thunderbird.
export const mailtoLink = (email, subject, body) => {
  const params = [];
  if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
  if (body) params.push(`body=${encodeURIComponent(body)}`);
  const query = params.length ? `?${params.join('&')}` : '';
  return `mailto:${email}${query}`;
};
