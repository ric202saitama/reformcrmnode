import express from 'express';
import { validatecompany } from '../controllers/companyCheckuserController';

const router = express.Router();

router.post('/validatecompany',validatecompany);

export default router;