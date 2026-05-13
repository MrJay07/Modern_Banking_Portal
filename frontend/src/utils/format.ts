export const formatCurrency = (amount: string | number, currency = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(Number(amount));
};

export const formatDate = (dateStr: string): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateStr));
};

export const maskAccountNumber = (accountNumber: string): string => {
  if (accountNumber.length <= 4) return accountNumber;
  return '*'.repeat(accountNumber.length - 4) + accountNumber.slice(-4);
};

export const getTransactionColor = (type: string): string => {
  switch (type) {
    case 'DEPOSIT':
      return 'text-green-600';
    case 'WITHDRAWAL':
      return 'text-red-600';
    case 'TRANSFER':
      return 'text-blue-600';
    default:
      return 'text-gray-600';
  }
};

export const getStatusBadgeClass = (status: string): string => {
  switch (status) {
    case 'COMPLETED':
    case 'APPROVED':
    case 'ACTIVE':
      return 'bg-green-100 text-green-800';
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800';
    case 'FAILED':
    case 'REJECTED':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};
