export function formatCurrency(amount: number, currency: string = '₹'): string {
  if (isNaN(amount) || amount === null || amount === undefined) return `${currency}0`;
  const rounded = Math.round(amount * 100) / 100;
  return `${currency}${rounded.toLocaleString('en-IN')}`;
}

export function formatDate(dateInput: string | Date | undefined): string {
  if (!dateInput) return '—';
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return String(dateInput);
  }
}

export function formatDateTime(dateInput: string | Date | undefined): string {
  if (!dateInput) return '—';
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return String(dateInput);
  }
}

export function formatQuantity(qty: number, unit: string): string {
  const formattedNumber = Number.isInteger(qty) ? qty.toString() : qty.toFixed(2).replace(/\.?0+$/, '');
  return `${formattedNumber} ${unit}${qty > 1 && !unit.endsWith('s') && !['Kg', 'Litre', 'Gram'].includes(unit) ? 's' : ''}`;
}

export function normalizeSearch(str: string): string {
  return (str || '').toLowerCase().replace(/[^a-z0-9]/g, ' ').trim();
}

export function numberToWordsIndian(num: number): string {
  if (num === 0) return 'Zero Rupees Only';
  const a = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function convertTwoDigits(n: number): string {
    if (n < 20) return a[n];
    return b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : '');
  }

  function convertThreeDigits(n: number): string {
    let s = '';
    if (Math.floor(n / 100) > 0) {
      s += a[Math.floor(n / 100)] + ' Hundred ';
      n %= 100;
    }
    if (n > 0) {
      s += convertTwoDigits(n);
    }
    return s.trim();
  }

  let str = '';
  const crore = Math.floor(num / 10000000);
  num %= 10000000;
  const lakh = Math.floor(num / 100000);
  num %= 100000;
  const thousand = Math.floor(num / 1000);
  num %= 1000;
  const remainder = Math.floor(num);

  if (crore > 0) str += convertThreeDigits(crore) + ' Crore ';
  if (lakh > 0) str += convertThreeDigits(lakh) + ' Lakh ';
  if (thousand > 0) str += convertThreeDigits(thousand) + ' Thousand ';
  if (remainder > 0) str += convertThreeDigits(remainder) + ' ';

  return str.trim() + ' Rupees Only';
}
