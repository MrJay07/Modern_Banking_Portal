import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAppSelector } from '../store/hooks';
import api from '../services/api';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';
import Badge from '../components/UI/Badge';
import { formatDate } from '../utils/format';

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Required'),
    newPassword: z.string().min(8, 'Minimum 8 characters'),
    confirmPassword: z.string().min(1, 'Required'),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type PasswordData = z.infer<typeof passwordSchema>;

export default function ProfilePage() {
  const { user } = useAppSelector((s) => s.auth);
  const [isChangingPwd, setIsChangingPwd] = useState(false);
  const [pwdSuccess, setPwdSuccess] = useState<string | null>(null);
  const [pwdError, setPwdError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordData>({ resolver: zodResolver(passwordSchema) });

  const handlePasswordChange = async (data: PasswordData) => {
    setIsChangingPwd(true);
    setPwdSuccess(null);
    setPwdError(null);
    try {
      await api.post('/users/change-password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      setPwdSuccess('Password changed successfully!');
      reset();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } }).response?.data?.message ??
        'Failed to change password';
      setPwdError(message);
    } finally {
      setIsChangingPwd(false);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your personal information</p>
      </div>

      <Card title="Account Information">
        <dl className="grid grid-cols-2 gap-4">
          <div>
            <dt className="text-xs text-gray-500 uppercase">Full Name</dt>
            <dd className="mt-1 font-medium">{user.firstName} {user.lastName}</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500 uppercase">Email</dt>
            <dd className="mt-1 font-medium">{user.email}</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500 uppercase">Phone</dt>
            <dd className="mt-1 font-medium">{user.phone ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500 uppercase">Role</dt>
            <dd className="mt-1">
              <Badge status={user.role} />
            </dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500 uppercase">KYC Status</dt>
            <dd className="mt-1">
              <Badge status={user.kycStatus} />
            </dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500 uppercase">Member Since</dt>
            <dd className="mt-1 font-medium">{formatDate(user.createdAt)}</dd>
          </div>
        </dl>
      </Card>

      <Card title="Change Password">
        {pwdSuccess && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
            ✅ {pwdSuccess}
          </div>
        )}
        {pwdError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            ❌ {pwdError}
          </div>
        )}
        <form onSubmit={handleSubmit(handlePasswordChange)} className="space-y-4">
          <Input
            label="Current Password"
            type="password"
            error={errors.currentPassword?.message}
            {...register('currentPassword')}
          />
          <Input
            label="New Password"
            type="password"
            error={errors.newPassword?.message}
            {...register('newPassword')}
          />
          <Input
            label="Confirm New Password"
            type="password"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />
          <Button type="submit" isLoading={isChangingPwd}>
            Change Password
          </Button>
        </form>
      </Card>
    </div>
  );
}
