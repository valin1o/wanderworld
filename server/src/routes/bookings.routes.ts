import { Router } from 'express';
import {
  createBooking,
  getMyBookings,
  getGuideBookings,
  getAllBookings,
  cancelBooking,
  confirmBooking,
  declineBooking,
  stripeWebhook,
} from '../controllers/bookings.controller';
import { authenticateJWT } from '../middleware/authenticate';
import { authorizeRoles } from '../middleware/authorize';

const router = Router();

router.post('/webhook', stripeWebhook);

router.use(authenticateJWT);

router.post('/', authorizeRoles('traveler'), createBooking);
router.get('/my', authorizeRoles('traveler'), getMyBookings);
router.get('/guide', authorizeRoles('guide'), getGuideBookings);
router.patch('/:id/confirm', authorizeRoles('guide', 'admin'), confirmBooking);
router.patch('/:id/decline', authorizeRoles('guide', 'admin'), declineBooking);
router.get('/', authorizeRoles('admin'), getAllBookings);
router.patch('/:id/cancel', authorizeRoles('traveler', 'admin'), cancelBooking);

export default router;
