import express from 'express';
import { validateUser,validateToken,resetPasswordMail,validateChangePasswordToken } from '../controllers/userLoginController';

const router = express.Router();

router.post('/validateUser',validateUser);
router.post('/validateToken',validateToken);
router.post('/resetPasswordMail',resetPasswordMail);
router.post('/validateChangePasswordToken',validateChangePasswordToken);

export default router;