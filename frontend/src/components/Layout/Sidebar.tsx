import { NavLink } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';
import clsx from 'clsx';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: '🏠' },
  { to: '/accounts', label: 'Accounts', icon: '💳' },
  { to: '/transactions', label: 'Transactions', icon: '📋' },
  { to: '/transfer', label: 'Transfer', icon: '↔️' },
  { to: '/profile', label: 'Profile', icon: '👤' },
];

const adminItems = [{ to: '/admin', label: 'Admin', icon: '⚙️' }];

export default function Sidebar() {
  const { user } = useAppSelector((s) => s.auth);

  const items = user?.role === 'ADMIN' ? [...navItems, ...adminItems] : navItems;

  return (
    <aside className="w-64 bg-primary-900 text-white flex flex-col">
      <div className="p-6 border-b border-primary-800">
        <h1 className="text-xl font-bold">🏦 Banking Portal</h1>
        <p className="text-primary-300 text-sm mt-1">
          {user?.firstName} {user?.lastName}
        </p>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary-700 text-white'
                  : 'text-primary-200 hover:bg-primary-800 hover:text-white'
              )
            }
          >
            <span>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
