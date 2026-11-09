import { Router } from 'express';
import { getPreferences, upsertPreferences, getRecommendations } from '../controllers/ai.controller';
import { authenticateJWT } from '../middleware/authenticate';
import { authorizeRoles } from '../middleware/authorize';

const router = Router();

router.use(authenticateJWT, authorizeRoles('traveler', 'admin'));

router.get('/preferences', getPreferences);
router.put('/preferences', upsertPreferences);
router.post('/recommend', getRecommendations);

export default router;
