import { Router } from 'express';
import {
  submitDocument,
  getMyDocuments,
  reviewDocument,
  getPendingDocuments,
} from '../controllers/kycController';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/submit', submitDocument);
router.get('/my-documents', getMyDocuments);

router.get('/pending', requireAdmin, getPendingDocuments);
router.patch('/:id/review', requireAdmin, reviewDocument);

export default router;
