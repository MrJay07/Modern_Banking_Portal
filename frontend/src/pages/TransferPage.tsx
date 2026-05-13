import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchAccounts } from '../store/slices/accountsSlice';
import { transactionService } from '../services/transactionService';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';

const transferSchema = z.object({
  fromAccountId: z.string().min(1, 'Select source account'),
  toAccountNumber: z.string().min(1, 'Enter destination account number'),
  amount: z.coerce.number().positive('Amount must be positive'),
  description: z.string().optional(),
});

const depositSchema = z.object({
  accountId: z.string().min(1, 'Select account'),
  amount: z.coerce.number().positive('Amount must be positive'),
  description: z.string().optional(),
});

type TransferData = z.infer<typeof transferSchema>;
type DepositData = z.infer<typeof depositSchema>;

export default function TransferPage() {
  const dispatch = useAppDispatch();
  const { accounts } = useAppSelector((s) => s.accounts);
  const [tab, setTab] = useState<'transfer' | 'deposit' | 'withdraw'>('transfer');
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const transferForm = useForm<TransferData>({ resolver: zodResolver(transferSchema) });
  const depositForm = useForm<DepositData>({ resolver: zodResolver(depositSchema) });

  useEffect(() => {
    dispatch(fetchAccounts());
  }, [dispatch]);

  const handleTransfer = async (data: TransferData) => {
    setIsLoading(true);
    setSuccessMsg(null);
    setErrorMsg(null);
    try {
      await transactionService.transfer(data);
      setSuccessMsg('Transfer completed successfully!');
      transferForm.reset();
      dispatch(fetchAccounts());
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } }).response?.data?.message ?? 'Transfer failed';
      setErrorMsg(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeposit = async (data: DepositData) => {
    setIsLoading(true);
    setSuccessMsg(null);
    setErrorMsg(null);
    try {
      await transactionService.deposit(data);
      setSuccessMsg('Deposit completed successfully!');
      depositForm.reset();
      dispatch(fetchAccounts());
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } }).response?.data?.message ?? 'Deposit failed';
      setErrorMsg(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdraw = async (data: DepositData) => {
    setIsLoading(true);
    setSuccessMsg(null);
    setErrorMsg(null);
    try {
      await transactionService.withdraw(data);
      setSuccessMsg('Withdrawal completed successfully!');
      depositForm.reset();
      dispatch(fetchAccounts());
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } }).response?.data?.message ?? 'Withdrawal failed';
      setErrorMsg(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Money Operations</h1>
        <p className="text-gray-500 text-sm mt-1">Transfer, deposit or withdraw funds</p>
      </div>

      <div className="flex gap-2 border-b border-gray-200">
        {(['transfer', 'deposit', 'withdraw'] as const).map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); setSuccessMsg(null); setErrorMsg(null); }}
            className={`px-4 py-2 text-sm font-medium capitalize border-b-2 transition-colors ${
              tab === t
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {successMsg && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
          ✅ {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          ❌ {errorMsg}
        </div>
      )}

      {tab === 'transfer' && (
        <Card title="Transfer Money">
          <form onSubmit={transferForm.handleSubmit(handleTransfer)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From Account</label>
              <select
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                {...transferForm.register('fromAccountId')}
              >
                <option value="">Select account</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.accountNumber} — ${Number(a.balance).toFixed(2)}
                  </option>
                ))}
              </select>
              {transferForm.formState.errors.fromAccountId && (
                <p className="text-xs text-red-600 mt-1">{transferForm.formState.errors.fromAccountId.message}</p>
              )}
            </div>
            <Input
              label="To Account Number"
              placeholder="ACC1234567890"
              error={transferForm.formState.errors.toAccountNumber?.message}
              {...transferForm.register('toAccountNumber')}
            />
            <Input
              label="Amount"
              type="number"
              step="0.01"
              min="0.01"
              error={transferForm.formState.errors.amount?.message}
              {...transferForm.register('amount')}
            />
            <Input label="Description (optional)" {...transferForm.register('description')} />
            <Button type="submit" className="w-full" isLoading={isLoading}>
              Transfer
            </Button>
          </form>
        </Card>
      )}

      {(tab === 'deposit' || tab === 'withdraw') && (
        <Card title={tab === 'deposit' ? 'Deposit Funds' : 'Withdraw Funds'}>
          <form
            onSubmit={depositForm.handleSubmit(tab === 'deposit' ? handleDeposit : handleWithdraw)}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Account</label>
              <select
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                {...depositForm.register('accountId')}
              >
                <option value="">Select account</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.accountNumber} — ${Number(a.balance).toFixed(2)}
                  </option>
                ))}
              </select>
              {depositForm.formState.errors.accountId && (
                <p className="text-xs text-red-600 mt-1">{depositForm.formState.errors.accountId.message}</p>
              )}
            </div>
            <Input
              label="Amount"
              type="number"
              step="0.01"
              min="0.01"
              error={depositForm.formState.errors.amount?.message}
              {...depositForm.register('amount')}
            />
            <Input label="Description (optional)" {...depositForm.register('description')} />
            <Button type="submit" className="w-full" isLoading={isLoading}>
              {tab === 'deposit' ? 'Deposit' : 'Withdraw'}
            </Button>
          </form>
        </Card>
      )}
    </div>
  );
}
