import { Router } from 'express';
import {
  getMe,
  updateMe,
  changePassword,
  getAllUsers,
  getPendingGuides,
  approveGuide,
  rejectGuide,
  changeUserRole,
  deactivateUser,
} from '../controllers/users.controller';
import { authenticateJWT } from '../middleware/authenticate';
import { authorizeRoles } from '../middleware/authorize';

const router = Router();

router.use(authenticateJWT);

router.get('/me', getMe);
router.patch('/me', updateMe);
router.patch('/me/password', changePassword);

router.get('/', authorizeRoles('admin'), getAllUsers);
router.get('/pending-guides', authorizeRoles('admin'), getPendingGuides);
router.patch('/:id/approve', authorizeRoles('admin'), approveGuide);
router.patch('/:id/reject', authorizeRoles('admin'), rejectGuide);
router.patch('/:id/role', authorizeRoles('admin'), changeUserRole);
router.delete('/:id', authorizeRoles('admin'), deactivateUser);

export default router;
