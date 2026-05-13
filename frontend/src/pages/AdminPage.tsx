import { useEffect, useState } from 'react';
import api from '../services/api';
import type { User, DashboardStats } from '../types';
import Card from '../components/UI/Card';
import StatCard from '../components/Dashboard/StatCard';
import Badge from '../components/UI/Badge';
import Button from '../components/UI/Button';
import { formatDate } from '../utils/format';

export default function AdminPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, usersRes] = await Promise.all([
          api.get<{ status: string; data: DashboardStats }>('/admin/dashboard'),
          api.get<{ status: string; data: { users: User[] } }>('/admin/users'),
        ]);
        setStats(statsRes.data.data);
        setUsers(usersRes.data.data.users);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const handleToggleUser = async (userId: string) => {
    try {
      await api.patch(`/admin/users/${userId}/toggle-status`);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, isActive: !u.isActive } : u))
      );
    } catch {
      // ignore
    }
  };

  if (isLoading) {
    return <div className="text-center py-12 text-gray-400">Loading admin dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Overview of all users and system metrics</p>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4">
          <StatCard title="Total Users" value={stats.totalUsers} icon="👥" />
          <StatCard title="Active Users" value={stats.activeUsers} icon="✅" />
          <StatCard title="Transactions" value={stats.totalTransactions} icon="📋" />
          <StatCard title="Pending KYC" value={stats.pendingKYC} icon="🔍" />
          <StatCard title="Total Volume" value={stats.totalVolume} icon="💰" isCurrency />
        </div>
      )}

      <Card title="All Users">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">KYC</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium">
                    {user.firstName} {user.lastName}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{user.email}</td>
                  <td className="px-4 py-3"><Badge status={user.role} /></td>
                  <td className="px-4 py-3"><Badge status={user.kycStatus} /></td>
                  <td className="px-4 py-3">
                    <Badge status={user.isActive ? 'ACTIVE' : 'INACTIVE'} />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{formatDate(user.createdAt)}</td>
                  <td className="px-4 py-3">
                    <Button
                      size="sm"
                      variant={user.isActive ? 'danger' : 'secondary'}
                      onClick={() => handleToggleUser(user.id)}
                    >
                      {user.isActive ? 'Disable' : 'Enable'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
