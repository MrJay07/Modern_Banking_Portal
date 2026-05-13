import { Router } from 'express';
import {
  deposit,
  withdraw,
  transfer,
  getTransactions,
  getTransaction,
} from '../controllers/transactionController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  depositSchema,
  withdrawalSchema,
  transferSchema,
} from '../validations/transaction';
import { transactionLimiter } from '../middleware/rateLimiter';

const router = Router();

router.use(authenticate);

router.get('/', getTransactions);
router.get('/:id', getTransaction);
router.post('/deposit', transactionLimiter, validate(depositSchema), deposit);
router.post('/withdraw', transactionLimiter, validate(withdrawalSchema), withdraw);
router.post('/transfer', transactionLimiter, validate(transferSchema), transfer);

export default router;
