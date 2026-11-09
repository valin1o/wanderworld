import { Router } from 'express';
import {
  getAllTours,
  getTourBySlug,
  createTour,
  updateTour,
  deleteTour,
  getTop5Cheap,
} from '../controllers/tours.controller';
import { authenticateJWT } from '../middleware/authenticate';
import { authorizeRoles } from '../middleware/authorize';

const router = Router();

router.get('/top5cheap', getTop5Cheap);
router.get('/', getAllTours);
router.get('/:slug', getTourBySlug);

router.post('/', authenticateJWT, authorizeRoles('guide', 'admin'), createTour);
router.patch('/:id', authenticateJWT, authorizeRoles('guide', 'admin'), updateTour);
router.delete('/:id', authenticateJWT, authorizeRoles('guide', 'admin'), deleteTour);

export default router;
