import { Router } from 'express';
import {
  getAllUsers,
  getUserById,
  toggleUserStatus,
  getDashboardStats,
} from '../controllers/adminController';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

router.use(authenticate, requireAdmin);

router.get('/dashboard', getDashboardStats);
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.patch('/users/:id/toggle-status', toggleUserStatus);

export default router;
