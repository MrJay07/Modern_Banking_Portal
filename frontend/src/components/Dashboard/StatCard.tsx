import { formatCurrency } from '../../utils/format';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  isCurrency?: boolean;
  subtitle?: string;
}

export default function StatCard({ title, value, icon, isCurrency, subtitle }: StatCardProps) {
  const displayValue = isCurrency ? formatCurrency(value) : value;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex items-center gap-4">
      <div className="text-3xl">{icon}</div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{displayValue}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}
