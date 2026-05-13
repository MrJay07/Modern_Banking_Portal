import { getStatusBadgeClass } from '../../utils/format';
import clsx from 'clsx';

interface BadgeProps {
  status: string;
  label?: string;
}

export default function Badge({ status, label }: BadgeProps) {
  return (
    <span className={clsx('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', getStatusBadgeClass(status))}>
      {label ?? status}
    </span>
  );
}
