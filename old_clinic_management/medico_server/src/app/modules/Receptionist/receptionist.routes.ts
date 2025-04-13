import express from 'express';
import { ReceptionistController } from './receptionist.controller';
import validateRequest from '../../middlewares/validateRequest';
import auth from '../../middlewares/auth';
import { UserRole } from '@prisma/client';
import { receptionistValidationSchemas } from './receptionist.validation';

const router = express.Router();

// GET all receptionists
router.get('/', ReceptionistController.getAllFromDB);

// GET a single receptionist by ID
router.get('/:id', auth(UserRole.ADMIN), ReceptionistController.getByIdFromDB);

// CREATE a new receptionist
router.post(
  '/',
  auth(UserRole.ADMIN),
  validateRequest(receptionistValidationSchemas.create),
  ReceptionistController.createReceptionist
);

// UPDATE a receptionist
router.patch(
  '/:id',
  auth(UserRole.ADMIN, UserRole.RECEPTIONIST),
  validateRequest(receptionistValidationSchemas.update),
  ReceptionistController.updateIntoDB,
);

// DELETE a receptionist
router.delete(
  '/:id',
  auth(UserRole.ADMIN),
  ReceptionistController.deleteFromDB,
);

export const ReceptionistRoutes = router;
