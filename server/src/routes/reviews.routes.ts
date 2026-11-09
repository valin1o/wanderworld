import { Router } from 'express';
import {
  getReviewsByTour,
  createReview,
  updateReview,
  deleteReview,
} from '../controllers/reviews.controller';
import { authenticateJWT } from '../middleware/authenticate';
import { authorizeRoles } from '../middleware/authorize';

const router = Router({ mergeParams: true });

router.get('/', getReviewsByTour);
router.post('/', authenticateJWT, authorizeRoles('traveler'), createReview);
router.patch('/:id', authenticateJWT, updateReview);
router.delete('/:id', authenticateJWT, deleteReview);

export default router;
