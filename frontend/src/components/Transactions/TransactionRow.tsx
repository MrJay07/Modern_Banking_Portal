import type { Transaction } from '../../types';
import { formatCurrency, formatDate, getTransactionColor } from '../../utils/format';
import Badge from '../UI/Badge';

interface TransactionRowProps {
  transaction: Transaction;
}

export default function TransactionRow({ transaction }: TransactionRowProps) {
  const isCredit = transaction.type === 'DEPOSIT';
  const sign = isCredit ? '+' : '-';

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">{transaction.type}</div>
        <div className="text-xs text-gray-500">{transaction.description ?? '—'}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`text-sm font-semibold ${getTransactionColor(transaction.type)}`}>
          {sign}{formatCurrency(transaction.amount)}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <Badge status={transaction.status} />
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {formatDate(transaction.createdAt)}
      </td>
    </tr>
  );
}
