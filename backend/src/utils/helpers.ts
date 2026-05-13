import crypto from 'crypto';

export const generateAccountNumber = (): string => {
  const digits = crypto.randomInt(1000000000, 9999999999).toString();
  return `ACC${digits}`;
};

export const formatCurrency = (amount: number, currency = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

export const maskAccountNumber = (accountNumber: string): string => {
  if (accountNumber.length <= 4) return accountNumber;
  const last4 = accountNumber.slice(-4);
  const masked = accountNumber.slice(0, -4).replace(/./g, '*');
  return `${masked}${last4}`;
};

export const generateReference = (): string => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `TXN-${timestamp}-${random}`;
};

export const paginate = (page: number, limit: number) => {
  const take = Math.min(limit, 100);
  const skip = (page - 1) * take;
  return { take, skip };
};

export const sanitizeUser = <T extends { password?: string }>(user: T): Omit<T, 'password'> => {
  const { password: _password, ...safeUser } = user;
  return safeUser;
};

export const isExpired = (date: Date): boolean => {
  return new Date() > date;
};
