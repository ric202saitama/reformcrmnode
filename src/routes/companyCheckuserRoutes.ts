import express from 'express';
import { validatecompany,getbranchlist,getaddress,saveBranch } from '../controllers/companyCheckuserController';

const router = express.Router();

router.post('/validatecompany',validatecompany);
router.post('/getbranchlist',getbranchlist);
router.post('/getaddress',getaddress);
router.post('/saveBranch',saveBranch);

export default router;