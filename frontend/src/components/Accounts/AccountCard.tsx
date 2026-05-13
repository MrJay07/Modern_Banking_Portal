import type { Account } from '../../types';
import { formatCurrency, maskAccountNumber } from '../../utils/format';
import Badge from '../UI/Badge';

interface AccountCardProps {
  account: Account;
}

export default function AccountCard({ account }: AccountCardProps) {
  return (
    <div className="bg-gradient-to-br from-primary-600 to-primary-800 text-white rounded-xl p-6 shadow-md">
      <div className="flex justify-between items-start mb-6">
        <div>
          <p className="text-primary-200 text-xs uppercase tracking-wider">Account Number</p>
          <p className="text-sm font-mono mt-1">{maskAccountNumber(account.accountNumber)}</p>
        </div>
        <Badge status={account.isActive ? 'ACTIVE' : 'INACTIVE'} />
      </div>
      <div>
        <p className="text-primary-200 text-xs uppercase tracking-wider">Balance</p>
        <p className="text-3xl font-bold mt-1">{formatCurrency(account.balance, account.currency)}</p>
      </div>
      <div className="mt-4 text-primary-200 text-xs">{account.currency}</div>
    </div>
  );
}
