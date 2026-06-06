import dayjs from 'dayjs';

const rupee = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
});

const rupeeNoCents = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

export function formatCurrency(value, { hideCentsIfZero = false } = {}) {
  if (value == null || isNaN(value)) return '—';
  if (hideCentsIfZero && Math.round(value * 100) % 100 === 0) {
    return rupeeNoCents.format(value);
  }
  return rupee.format(value);
}

export function formatDate(value) {
  if (!value) return '—';
  return dayjs(value).format('DD MMM YYYY');
}

export function toISODate(value) {
  if (!value) return '';
  return dayjs(value).format('YYYY-MM-DD');
}

export function fromISODate(value) {
  if (!value) return null;
  return dayjs(value).toDate();
}

export function formatNumber(value) {
  if (value == null || isNaN(value)) return '—';
  return new Intl.NumberFormat('en-IN').format(value);
}

export function computeTax(amount, rate) {
  const a = Number(amount) || 0;
  const r = Number(rate) || 0;
  return Math.round(a * r * 100) / 100 / 100;
}

export function initials(name = '') {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
