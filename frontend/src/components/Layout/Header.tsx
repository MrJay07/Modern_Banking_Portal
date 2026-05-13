import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logout } from '../../store/slices/authSlice';
import { authService } from '../../services/authService';

export default function Header() {
  const dispatch = useAppDispatch();
  const { user, refreshToken } = useAppSelector((s) => s.auth);

  const handleLogout = async () => {
    if (refreshToken) {
      await authService.logout(refreshToken).catch(() => undefined);
    }
    dispatch(logout());
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm">
      <div />
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">
          {user?.email}
        </span>
        <span className="px-2 py-0.5 text-xs bg-primary-100 text-primary-800 rounded-full">
          {user?.role}
        </span>
        <button
          onClick={handleLogout}
          className="text-sm text-gray-500 hover:text-red-600 transition-colors"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
