import express from 'express';
import { validateUser,validateToken } from '../controllers/userLoginController';

const router = express.Router();

router.post('/validateUser',validateUser);
router.post('/validateToken',validateToken);

export default router;