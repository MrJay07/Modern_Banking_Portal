import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchAccountSummary } from '../store/slices/accountsSlice';
import { fetchTransactions } from '../store/slices/transactionsSlice';
import StatCard from '../components/Dashboard/StatCard';
import TransactionRow from '../components/Transactions/TransactionRow';
import Card from '../components/UI/Card';

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);
  const { accounts, totalBalance, isLoading: accountsLoading } = useAppSelector((s) => s.accounts);
  const { transactions } = useAppSelector((s) => s.transactions);

  useEffect(() => {
    dispatch(fetchAccountSummary());
    dispatch(fetchTransactions({ limit: 5 }));
  }, [dispatch]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="text-gray-500 text-sm mt-1">Here's your financial overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Total Balance"
          value={totalBalance}
          icon="💰"
          isCurrency
          subtitle={`Across ${accounts.length} account(s)`}
        />
        <StatCard
          title="Total Accounts"
          value={accounts.length}
          icon="💳"
        />
        <StatCard
          title="Recent Transactions"
          value={transactions.length}
          icon="📋"
        />
      </div>

      {accountsLoading ? (
        <div className="text-center py-8 text-gray-400">Loading accounts...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {accounts.slice(0, 2).map((account) => (
            <div key={account.id} className="bg-gradient-to-br from-primary-600 to-primary-800 text-white rounded-xl p-6">
              <p className="text-primary-200 text-xs">Account •••• {account.accountNumber.slice(-4)}</p>
              <p className="text-2xl font-bold mt-2">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: account.currency }).format(Number(account.balance))}
              </p>
              <p className="text-primary-200 text-xs mt-1">{account.currency}</p>
            </div>
          ))}
        </div>
      )}

      <Card title="Recent Transactions">
        {transactions.length === 0 ? (
          <p className="text-gray-400 text-center py-4">No transactions yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
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
        <div className="mt-4 text-center">
          <Link to="/transactions" className="text-sm text-primary-600 hover:underline">
            View all transactions →
          </Link>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Link to="/transfer" className="bg-primary-600 text-white rounded-xl p-4 text-center hover:bg-primary-700 transition-colors">
          <div className="text-2xl mb-1">↔️</div>
          <div className="font-medium">Transfer Money</div>
        </Link>
        <Link to="/accounts" className="bg-white border border-gray-200 rounded-xl p-4 text-center hover:bg-gray-50 transition-colors">
          <div className="text-2xl mb-1">💳</div>
          <div className="font-medium text-gray-700">Manage Accounts</div>
        </Link>
      </div>
    </div>
  );
}
