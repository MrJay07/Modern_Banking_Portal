import { Router } from 'express';
import {
  getAccounts,
  getAccount,
  createAccount,
  getAccountSummary,
} from '../controllers/accountController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', getAccounts);
router.get('/summary', getAccountSummary);
router.get('/:id', getAccount);
router.post('/', createAccount);

export default router;
