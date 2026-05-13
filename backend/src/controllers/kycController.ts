import { Request, Response, NextFunction } from 'express';
import * as kycService from '../services/kycService';
import { AppError } from '../middleware/errorHandler';
import type { AuthenticatedRequest } from '../middleware/auth';

export const submitDocument = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { documentType, documentUrl } = req.body as {
      documentType: string;
      documentUrl: string;
    };

    if (!documentType || !documentUrl) {
      throw new AppError('documentType and documentUrl are required', 400);
    }

    const document = await kycService.submitKYCDocument(
      req.user!.userId,
      documentType,
      documentUrl
    );

    res.status(201).json({ status: 'success', data: { document } });
  } catch (error) {
    next(error);
  }
};

export const getMyDocuments = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const documents = await kycService.getUserKYCDocuments(req.user!.userId);
    res.status(200).json({ status: 'success', data: { documents } });
  } catch (error) {
    next(error);
  }
};

export const reviewDocument = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { status, adminNotes } = req.body as {
      status: 'APPROVED' | 'REJECTED';
      adminNotes?: string;
    };

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      throw new AppError('Status must be APPROVED or REJECTED', 400);
    }

    const document = await kycService.reviewKYCDocument(req.params['id'], status, adminNotes);
    res.status(200).json({ status: 'success', data: { document } });
  } catch (error) {
    next(error);
  }
};

export const getPendingDocuments = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = Number(req.query['page']) || 1;
    const limit = Number(req.query['limit']) || 10;
    const result = await kycService.getAllPendingKYC(page, limit);
    res.status(200).json({ status: 'success', data: result });
  } catch (error) {
    next(error);
  }
};
