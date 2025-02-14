import express from 'express';
import { validateUser
    ,validateToken
    ,resetPasswordMail
    ,validateChangePasswordToken
    ,getUserComp
    ,setSaveUser 
} from '../controllers/userLoginController';

const router = express.Router();

router.post('/validateUser',validateUser);
router.post('/validateToken',validateToken);
router.post('/resetPasswordMail',resetPasswordMail);
router.post('/validateChangePasswordToken',validateChangePasswordToken);
router.post('/getUserComp',getUserComp);
router.post('/saveUser',setSaveUser);

export default router;