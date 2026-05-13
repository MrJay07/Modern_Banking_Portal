import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchAccounts, createAccount } from '../store/slices/accountsSlice';
import AccountCard from '../components/Accounts/AccountCard';
import Button from '../components/UI/Button';
import Card from '../components/UI/Card';

export default function AccountsPage() {
  const dispatch = useAppDispatch();
  const { accounts, isLoading } = useAppSelector((s) => s.accounts);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    dispatch(fetchAccounts());
  }, [dispatch]);

  const handleCreate = async () => {
    setCreating(true);
    await dispatch(createAccount('USD'));
    setCreating(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Accounts</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your bank accounts</p>
        </div>
        <Button onClick={handleCreate} isLoading={creating} disabled={accounts.length >= 5}>
          + New Account
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-400">Loading accounts...</div>
      ) : accounts.length === 0 ? (
        <Card>
          <div className="text-center py-8">
            <p className="text-gray-400 text-lg">No accounts yet</p>
            <p className="text-gray-400 text-sm mt-1">Create your first account to get started</p>
            <Button className="mt-4" onClick={handleCreate} isLoading={creating}>
              Create Account
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {accounts.map((account) => (
            <AccountCard key={account.id} account={account} />
          ))}
        </div>
      )}
    </div>
  );
}
