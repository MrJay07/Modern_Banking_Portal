import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import logger from '../config/logger';

export const submitKYCDocument = async (
  userId: string,
  documentType: string,
  documentUrl: string
) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (user.kycStatus === 'APPROVED') {
    throw new AppError('KYC already approved', 400);
  }

  const document = await prisma.kYCDocument.create({
    data: {
      userId,
      documentType,
      documentUrl,
      status: 'PENDING',
    },
  });

  await prisma.user.update({
    where: { id: userId },
    data: { kycStatus: 'PENDING' },
  });

  logger.info('KYC document submitted', { userId, documentType });
  return document;
};

export const getUserKYCDocuments = async (userId: string) => {
  return prisma.kYCDocument.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
};

export const reviewKYCDocument = async (
  documentId: string,
  status: 'APPROVED' | 'REJECTED',
  adminNotes?: string
) => {
  const document = await prisma.kYCDocument.findUnique({
    where: { id: documentId },
    include: { user: true },
  });

  if (!document) {
    throw new AppError('KYC document not found', 404);
  }

  const updatedDocument = await prisma.kYCDocument.update({
    where: { id: documentId },
    data: { status, adminNotes },
  });

  const approvedDocs = await prisma.kYCDocument.count({
    where: { userId: document.userId, status: 'APPROVED' },
  });

  const kycStatus = status === 'APPROVED' && approvedDocs >= 1 ? 'APPROVED' : status;
  await prisma.user.update({
    where: { id: document.userId },
    data: { kycStatus },
  });

  logger.info('KYC document reviewed', { documentId, status, adminNotes });
  return updatedDocument;
};

export const getAllPendingKYC = async (page = 1, limit = 10) => {
  const take = Math.min(limit, 100);
  const skip = (page - 1) * take;

  const [documents, total] = await Promise.all([
    prisma.kYCDocument.findMany({
      where: { status: 'PENDING' },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
      orderBy: { createdAt: 'asc' },
      take,
      skip,
    }),
    prisma.kYCDocument.count({ where: { status: 'PENDING' } }),
  ]);

  return { documents, total, page, limit: take, totalPages: Math.ceil(total / take) };
};
