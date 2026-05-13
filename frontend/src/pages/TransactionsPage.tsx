import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchTransactions } from '../store/slices/transactionsSlice';
import TransactionRow from '../components/Transactions/TransactionRow';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';

export default function TransactionsPage() {
  const dispatch = useAppDispatch();
  const { transactions, isLoading, page, totalPages } = useAppSelector((s) => s.transactions);

  useEffect(() => {
    dispatch(fetchTransactions({ page: 1, limit: 20 }));
  }, [dispatch]);

  const handlePage = (newPage: number) => {
    dispatch(fetchTransactions({ page: newPage, limit: 20 }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
        <p className="text-gray-500 text-sm mt-1">Your complete transaction history</p>
      </div>

      <Card>
        {isLoading ? (
          <div className="text-center py-8 text-gray-400">Loading transactions...</div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-8 text-gray-400">No transactions found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {transactions.map((tx) => (
                  <TransactionRow key={tx.id} transaction={tx} />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-4">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handlePage(page - 1)}
              disabled={page <= 1}
            >
              ← Prev
            </Button>
            <span className="px-3 py-1.5 text-sm text-gray-600">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handlePage(page + 1)}
              disabled={page >= totalPages}
            >
              Next →
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
